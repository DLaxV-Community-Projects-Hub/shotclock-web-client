<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	import Fa from 'svelte-fa';
	import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

	let roomId: string = $page['params']['roomId'];

	let ws: WebSocket;

	let shotclock: number;
	let shotclockString: string = '';
	$: if (shotclock !== undefined) shotclockString = shotclock.toString().padStart(2, '0');
	let shotclockRed: boolean = false;

	let alarmTimer: ReturnType<typeof setInterval>;
	let audioActive: boolean = false;
	let audio: HTMLAudioElement;

	onMount(() => {
		join();
		audio = new Audio('audio/beep.mp3');
	});

	function activateAudio() {
		audioActive = true;
		audio.play();
		audio.pause();
		audio.load();
	}

	function join() {
		ws = new WebSocket('wss://tobias-reinke.de/shotclock/' + roomId);
		ws.onerror = function (error) {
			console.log(error);
		};
		ws.onmessage = function (event) {
			let id: string = event.data.substring(0, 1);
			let data: Array<string> = event.data.substring(2).includes(';')
				? event.data.substring(2).split(';')
				: [event.data.substring(2)];
			switch (id) {
				case 't':
					shotclock = parseInt(data[1]);
					if (shotclock == 0) alarm();
					else deactivateAlarm();
					break;
			}
		};

		function alarm() {
			if (alarmTimer === undefined) {
				shotclockRed = true;
				beep();
				alarmTimer = setInterval(function () {
					shotclockRed = !shotclockRed;
				}, 500);
			}
		}

		function deactivateAlarm() {
			if (alarmTimer) {
				clearInterval(alarmTimer);
				alarmTimer = undefined;
				shotclockRed = false;
			}
		}

		function beep() {
			if (audioActive) {
				audio.play();
				setTimeout(function () {
					audio.pause();
					audio.load();
				}, 2000);
			}
		}
	}
</script>

<div id="main" class="w-screen h-screen overflow-hidden" on:click|once={activateAudio}>
	<div class="absolute top-3 left-3" on:click={() => (audioActive = !audioActive)}>
		{#if audioActive}
			<Fa icon={faVolumeUp} size="2x" />
		{:else}
			<Fa icon={faVolumeMute} size="2x" />
		{/if}
	</div>
	<div class="h-full w-full flex flex-col justify-center items-center">
		<span class="clock" class:text-red-600={shotclockRed}>{shotclockString}</span>
	</div>
</div>

<style lang="postcss">
	#main {
		@apply bg-black text-white;
	}

	.clock {
		font-family: 'SevenSeg';
		font-size: 65vmin;
	}

	@font-face {
		font-family: 'SevenSeg';
		font-style: normal;
		src: url('{base}/fonts/DSEG7Classic-Regular.ttf') format('ttf'),
			url('{base}/fonts/DSEG7Classic-Regular.woff2') format('woff2'),
			url('{base}/fonts/DSEG7Classic-Regular.woff') format('woff');
	}
</style>
