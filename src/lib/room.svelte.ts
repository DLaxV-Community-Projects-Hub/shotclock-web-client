import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';
import { BeepPlayer } from './beep.svelte.ts';
import { roomSocketUrl } from './config.ts';
import { forgetPin } from './pin.ts';

const ALARM_BLINK_MS = 500;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10_000;
/** The server sends the clock at least every 10 s, so longer silence means a dead connection. */
const WATCHDOG_MS = 25_000;

type Options = {
	roomId: string;
	/** Controllers authenticate with a PIN, plain displays don't. */
	pin?: string;
	/** Called once the server accepted the PIN (not again after a reconnect). */
	onAuthenticated?: () => void;
};

/** Connection to a shot clock room, shared by the display and the controller page. */
export class RoomClient {
	readonly roomId: string;
	readonly beep = new BeepPlayer();

	title = $state<string>();
	shotclock = $state<number>();
	running = $state(false);
	authenticated = $state(false);
	/** Toggles while the clock sits at zero to make it blink. */
	alarmRed = $state(false);
	/** True while the connection was lost and is being re-established. */
	reconnecting = $state(false);

	#pin?: string;
	#onAuthenticated?: () => void;
	#socket?: WebSocket;
	#alarmTimer?: ReturnType<typeof setInterval>;
	#reconnectTimer?: ReturnType<typeof setTimeout>;
	#watchdogTimer?: ReturnType<typeof setTimeout>;
	#attempts = 0;
	#stopped = true;
	#wasAuthenticated = false;

	constructor({ roomId, pin, onAuthenticated }: Options) {
		this.roomId = roomId;
		this.#pin = pin;
		this.#onAuthenticated = onAuthenticated;
	}

	connect() {
		this.#stopped = false;
		window.addEventListener('online', this.#reconnectNow);
		document.addEventListener('visibilitychange', this.#reconnectNow);
		this.#open();
	}

	disconnect() {
		this.#stopped = true;
		window.removeEventListener('online', this.#reconnectNow);
		document.removeEventListener('visibilitychange', this.#reconnectNow);
		clearTimeout(this.#reconnectTimer);
		clearTimeout(this.#watchdogTimer);
		this.#detach(this.#socket)?.close();
		this.#socket = undefined;
		this.#stopAlarm();
	}

	#open() {
		clearTimeout(this.#reconnectTimer);
		const socket = new WebSocket(roomSocketUrl(this.roomId, this.#pin));
		this.#socket = socket;
		socket.onerror = (error) => console.log(error);
		socket.onmessage = (event) => {
			this.#attempts = 0;
			this.reconnecting = false;
			this.#resetWatchdog();
			this.#handleMessage(event.data);
		};
		socket.onclose = () => this.#handleConnectionLost(socket);
		this.#resetWatchdog();
	}

	#detach(socket?: WebSocket) {
		if (socket) socket.onclose = socket.onmessage = socket.onerror = null;
		return socket;
	}

	/** The server restarted or the network dropped: try again with growing delays. */
	#handleConnectionLost(socket: WebSocket) {
		if (this.#socket !== socket) return;
		this.#detach(socket);
		this.#socket = undefined;
		clearTimeout(this.#watchdogTimer);
		if (this.#stopped) return;
		this.reconnecting = true;
		const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.#attempts, RECONNECT_MAX_MS);
		this.#attempts++;
		// Jitter, so that all clients do not hit a restarting server at the same moment
		this.#reconnectTimer = setTimeout(() => this.#open(), delay * (0.5 + Math.random() / 2));
	}

	/** Reconnect right away, e.g. when the network is back or the tab becomes visible again. */
	#reconnectNow = () => {
		if (this.#stopped || document.visibilityState === 'hidden') return;
		const state = this.#socket?.readyState;
		if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) return;
		this.#attempts = 0;
		this.#open();
	};

	#resetWatchdog() {
		clearTimeout(this.#watchdogTimer);
		this.#watchdogTimer = setTimeout(() => {
			const socket = this.#socket;
			if (!socket) return;
			// A silently dead connection never fires "close" on its own
			this.#handleConnectionLost(socket);
			socket.close();
		}, WATCHDOG_MS);
	}

	/** The server rejected us, reconnecting would not help. */
	#giveUp() {
		this.disconnect();
	}

	/** Sends a command like `updateTime;5` to the server. */
	send(command: string, ...args: (string | number)[]) {
		if (this.#socket?.readyState === WebSocket.OPEN) {
			this.#socket.send([command, ...args].join(';'));
		}
	}

	#handleMessage(message: string) {
		switch (message) {
			case 'ROOM_NOT_FOUND':
				alert(get(_)('errors.room_not_found', { values: { id: this.roomId } }));
				this.#giveUp();
				goto(resolve('/'));
				return;
			case 'WRONG_PIN':
				alert(get(_)('errors.wrong_pin'));
				forgetPin(this.roomId);
				this.#giveUp();
				goto(resolve('/'));
				return;
			case 'RATE_LIMITED':
				alert(get(_)('errors.rate_limited'));
				this.#giveUp();
				goto(resolve('/'));
				return;
			case 'SERVER_BUSY':
				alert(get(_)('errors.server_busy'));
				this.#giveUp();
				goto(resolve('/'));
				return;
			case 'INVALID_REQUEST':
				alert(get(_)('errors.invalid_request'));
				this.#giveUp();
				goto(resolve('/'));
				return;
			case 'AUTHENTICATED':
				this.authenticated = true;
				if (!this.#wasAuthenticated) {
					this.#wasAuthenticated = true;
					this.#onAuthenticated?.();
				}
				return;
			case 'HORN':
				this.beep.beep();
				return;
		}

		// Everything else looks like "<type>;<value>[;<value>...]"
		const type = message[0];
		const data = message.slice(2).split(';');
		switch (type) {
			case 't': // Time
				this.shotclock = parseInt(data[1]);
				if (this.shotclock === 0) this.#startAlarm();
				else this.#stopAlarm();
				break;
			case 'r': // Running
				this.running = data[0] === '1';
				break;
			case 'T': // Title
				this.title = data[0] || undefined;
				break;
		}
	}

	#startAlarm() {
		if (this.#alarmTimer !== undefined) return;
		this.alarmRed = true;
		this.beep.beep();
		this.#alarmTimer = setInterval(() => (this.alarmRed = !this.alarmRed), ALARM_BLINK_MS);
	}

	#stopAlarm() {
		if (this.#alarmTimer === undefined) return;
		clearInterval(this.#alarmTimer);
		this.#alarmTimer = undefined;
		this.alarmRed = false;
	}
}
