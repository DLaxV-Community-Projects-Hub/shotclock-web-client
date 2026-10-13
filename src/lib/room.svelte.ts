import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';
import { BeepPlayer } from './beep.svelte.ts';
import { roomSocketUrl } from './config.ts';
import { forgetPin } from './pin.ts';

const ALARM_BLINK_MS = 500;

type Options = {
	roomId: string;
	/** Controllers authenticate with a PIN, plain displays don't. */
	pin?: string;
	/** Called once the server accepted the PIN. */
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

	#pin?: string;
	#onAuthenticated?: () => void;
	#socket?: WebSocket;
	#alarmTimer?: ReturnType<typeof setInterval>;

	constructor({ roomId, pin, onAuthenticated }: Options) {
		this.roomId = roomId;
		this.#pin = pin;
		this.#onAuthenticated = onAuthenticated;
	}

	connect() {
		this.#socket = new WebSocket(roomSocketUrl(this.roomId, this.#pin));
		this.#socket.onerror = (error) => console.log(error);
		this.#socket.onmessage = (event) => this.#handleMessage(event.data);
	}

	disconnect() {
		this.#socket?.close();
		this.#stopAlarm();
	}

	/** Sends a command like `updateTime;5` to the server. */
	send(command: string, ...args: (string | number)[]) {
		this.#socket?.send([command, ...args].join(';'));
	}

	#handleMessage(message: string) {
		switch (message) {
			case 'ROOM_NOT_FOUND':
				alert(get(_)('errors.room_not_found', { values: { id: this.roomId } }));
				goto(resolve('/'));
				return;
			case 'WRONG_PIN':
				alert(get(_)('errors.wrong_pin'));
				forgetPin(this.roomId);
				goto(resolve('/'));
				return;
			case 'RATE_LIMITED':
				alert(get(_)('errors.rate_limited'));
				goto(resolve('/'));
				return;
			case 'SERVER_BUSY':
				alert(get(_)('errors.server_busy'));
				goto(resolve('/'));
				return;
			case 'INVALID_REQUEST':
				alert(get(_)('errors.invalid_request'));
				goto(resolve('/'));
				return;
			case 'AUTHENTICATED':
				this.authenticated = true;
				this.#onAuthenticated?.();
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
