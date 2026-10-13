const key = (roomId: string) => `PIN-${roomId}`;

/** PIN from the URL, else from this session, else asked from the user. */
export function resolvePin(
	roomId: string,
	searchParams: Pick<URLSearchParams, 'get'>,
	promptText: string
): string | null {
	const pin = searchParams.get('pin') ?? sessionStorage.getItem(key(roomId)) ?? prompt(promptText);
	if (pin) sessionStorage.setItem(key(roomId), pin);
	return pin || null;
}

export function forgetPin(roomId: string) {
	sessionStorage.removeItem(key(roomId));
}
