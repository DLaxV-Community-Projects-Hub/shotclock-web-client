export type Timings = {
	/** Shot clock in seconds */
	shotclock: number;
	/** Team timeout in seconds */
	timeout: number;
	/** Break between quarters in seconds */
	quarter: number;
	/** Halftime break in seconds */
	halftime: number;
};

export type Preset = Timings & {
	/** i18n key of the preset name */
	labelKey: string;
};

export const defaultTimings: Timings = { shotclock: 30, timeout: 30, quarter: 120, halftime: 300 };

// Values from the World Lacrosse rule books 2026-2028 (box: 5.2, 5.6, 6.6; sixes: 5.1, 5.3, 6.10).
export const presets: Preset[] = [
	{ labelKey: 'index.quick_create', ...defaultTimings },
	{
		labelKey: 'index.quick_create_wl_field',
		shotclock: 80,
		timeout: 90,
		quarter: 120,
		halftime: 600
	},
	{ labelKey: 'index.quick_create_box', shotclock: 30, timeout: 45, quarter: 120, halftime: 720 },
	{ labelKey: 'index.quick_create_sixes', shotclock: 30, timeout: 60, quarter: 120, halftime: 300 }
];

/** Query parameter -> controller command used to configure a freshly created room. */
export const timingCommands: Record<keyof Timings, string> = {
	shotclock: 'setInitialShotclock',
	timeout: 'setTimeout',
	quarter: 'setQuarter',
	halftime: 'setHalftime'
};
