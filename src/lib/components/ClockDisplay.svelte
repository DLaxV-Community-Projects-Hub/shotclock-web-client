<script lang="ts">
	import { clockParts, columnWidthEm, rowWidthEm } from '#lib/clock.ts';

	let {
		title,
		seconds,
		red = false,
		size
	}: {
		title?: string;
		seconds?: number;
		red?: boolean;
		/** `display` fills the whole screen, `controller` leaves room for the buttons. */
		size: 'display' | 'controller';
	} = $props();

	const parts = $derived(seconds === undefined ? [] : clockParts(seconds, !!title));
</script>

<div
	class="contents"
	class:display={size === 'display'}
	class:controller={size === 'controller'}
	style:--em-row={rowWidthEm(parts) || 1}
	style:--em-column={columnWidthEm(parts) || 1}
>
	{#if title}
		<span class={['title', size === 'display' ? 'portrait:mt-5' : 'mt-5']}>{title}</span>
	{/if}
	<div class="flex portrait:flex-col landscape:flex-row">
		{#each parts as part}
			<span class="clock" class:text-red-600={red} class:small={title}>{part}</span>
		{/each}
	</div>
</div>

<style>
	/*
	 * The clock is as large as the screen height allows (vmin), but never wider than the space left
	 * next to the buttons: "available width / clock width in em" is the largest font size that fits.
	 */
	.display {
		--clock-size: 65vmin;
		--clock-size-small: 45vmin;
		--title-size: 20vmin;
		--available-width: 96vw;
	}

	.controller {
		--clock-size: 50vmin;
		--clock-size-small: 30vmin;
		--title-size: 10vmin;
		--available-width: calc(100vw - 2.5rem);
	}

	@media (min-width: 1024px) {
		.controller {
			/* Room for the main buttons (17vmax) and the advanced controls */
			--available-width: calc(100vw - 24vmax - 430px);
		}
	}

	.display,
	.controller {
		--clock-em: var(--em-column);
	}

	@media (orientation: landscape) {
		.display,
		.controller {
			--clock-em: var(--em-row);
		}
	}

	.clock {
		font-family: 'SevenSeg';
		font-size: min(var(--clock-size), calc(var(--available-width) / var(--clock-em)));
	}

	.clock.small {
		font-size: min(var(--clock-size-small), calc(var(--available-width) / var(--clock-em)));
	}

	.title {
		font-size: var(--title-size);
	}

	@font-face {
		font-family: 'SevenSeg';
		font-style: normal;
		src:
			url('/fonts/DSEG7Classic-Regular.ttf') format('truetype'),
			url('/fonts/DSEG7Classic-Regular.woff2') format('woff2'),
			url('/fonts/DSEG7Classic-Regular.woff') format('woff');
	}
</style>
