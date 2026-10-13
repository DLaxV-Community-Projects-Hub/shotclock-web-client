const key = (roomId: string) => `PIN-${roomId}`;

// Safari throws on any storage access when "Block all cookies" is on. Fall back to memory then.
const memory = new Map<string, string>();

function readStored(name: string): string | null {
	try {
		return sessionStorage.getItem(name);
	} catch {
		return memory.get(name) ?? null;
	}
}

function writeStored(name: string, value: string) {
	memory.set(name, value);
	try {
		sessionStorage.setItem(name, value);
	} catch {
		// memory only
	}
}

/** PIN from the URL, else from this session, else asked from the user. */
export function resolvePin(
	roomId: string,
	searchParams: Pick<URLSearchParams, 'get'>,
	promptText: string
): string | null {
	const pin = searchParams.get('pin') ?? readStored(key(roomId)) ?? prompt(promptText);
	if (pin) writeStored(key(roomId), pin);
	return pin || null;
}

export function forgetPin(roomId: string) {
	memory.delete(key(roomId));
	try {
		sessionStorage.removeItem(key(roomId));
	} catch {
		// nothing stored
	}
}
