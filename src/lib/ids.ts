/** Random 5-digit shot clock ID. */
export function generateRoomId(): string {
	return Math.floor(10000 + Math.random() * 90000).toString();
}

/** Random 4-digit controller PIN. */
export function generatePin(): string {
	return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
}
