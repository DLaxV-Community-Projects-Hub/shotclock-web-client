const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * Splits the remaining seconds into the parts the clock displays.
 *
 * Titled countdowns (timeout, quarter, halftime) switch to MM:SS above 60 s. The plain shot clock
 * only does so from 100 s on, so that e.g. 80 s (WorldLacrosse field) is shown as "80".
 */
export function clockParts(seconds: number, hasTitle: boolean): string[] {
	const plainSeconds = hasTitle ? seconds <= 60 : seconds < 100;
	return plainSeconds ? [pad(seconds)] : [pad(Math.floor(seconds / 60)) + ':', pad(seconds % 60)];
}

// Approximate widths of the seven segment font, in em
const DIGIT_WIDTH = 0.82;
const COLON_WIDTH = 0.35;

const partWidth = (part: string) =>
	[...part].reduce((width, char) => width + (char === ':' ? COLON_WIDTH : DIGIT_WIDTH), 0);

/** Width of the clock in em when all parts sit next to each other (landscape). */
export const rowWidthEm = (parts: string[]) =>
	parts.reduce((sum, part) => sum + partWidth(part), 0);

/** Width of the clock in em when the parts are stacked (portrait). */
export const columnWidthEm = (parts: string[]) => Math.max(0, ...parts.map(partWidth));
