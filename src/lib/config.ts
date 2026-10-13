import { dev } from '$app/env';

const websocketProtocol = dev ? 'ws' : 'wss';
const serverBaseUrl = dev ? 'localhost:8080' : 'tobias-reinke.de/shotclock-new';

/** WebSocket URL of a shot clock room; the PIN is only needed for controllers. */
export function roomSocketUrl(roomId: string, pin?: string): string {
	const url = `${websocketProtocol}://${serverBaseUrl}/${roomId}`;
	return pin ? `${url}?pin=${pin}` : url;
}
