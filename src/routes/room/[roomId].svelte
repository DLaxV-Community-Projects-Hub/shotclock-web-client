<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { websocketProtocol, serverBaseUrl } from '../../config.js';

	import LoadingInfo from '../../components/LoadingInfo.svelte';

	import Fa from 'svelte-fa';
	import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
	import { goto } from '$app/navigation';
	import { isLoading } from 'svelte-i18n';

	let roomId: string = $page['params']['roomId'];

	let ws: WebSocket;

	let title: string | undefined;

	let shotclock: number;
	let shotclockString: string = '';
	let shotclockStringPart1: string = '';
	let shotclockStringPart2: string = '';
	$: if (shotclock !== undefined) {
		if (shotclock <= 60){
			shotclockString = shotclock.toString().padStart(2, '0');
		} else {
			shotclockStringPart1 = Math.floor(shotclock / 60).toString().padStart(2, '0') + ":";
			shotclockStringPart2 = (shotclock % 60).toString().padStart(2, '0');
			shotclockString = shotclockStringPart1 + shotclockStringPart2;
		}
	}
	let shotclockRed: boolean = false;

	let alarmTimer: ReturnType<typeof setInterval>;
	let audioActive: boolean = false;
	let audio: HTMLAudioElement;

	onMount(() => {
		join();
		audio = new Audio(base + '/audio/beep.mp3');
	});

	function activateAudio() {
		audioActive = true;
		audio.play();
		audio.pause();
		audio.load();
	}

	function join() {
		ws = new WebSocket(websocketProtocol + '://' + serverBaseUrl + '/' + roomId);
		ws.onerror = function (error) {
			console.log(error);
		};
		ws.onmessage = function (event) {
			if (event.data === 'ROOM_NOT_FOUND') {
				alert('The room ' + roomId + ' does not exist');
				goto(base + '/');
			} else if (event.data === 'HORN') {
				beep();
			} else {
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
					case 'T': // Title
						title = data[0];
						if (title == "")
							title = undefined;
						break;
				}
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

<div id="main" class="w-full h-full" on:click|once={activateAudio}>
	{#if !$isLoading}
		<div class="absolute top-3 left-3" on:click={() => (audioActive = !audioActive)}>
			{#if audioActive}
				<Fa icon={faVolumeUp} size="2x" />
			{:else}
				<Fa icon={faVolumeMute} size="2x" />
			{/if}
		</div>
		<div class="h-full w-full flex flex-col justify-start items-center">
			{#if title}
				<span class="title portrait:mt-5">{title}</span>
			{/if}
			{#if shotclock <= 60}
				<span class="clock" class:text-red-600={shotclockRed} class:clock-small={title} class:clock-large={!title}>
					{shotclockString}
				</span>
			{:else}
				<div class="flex portrait:flex-col landscape:flex-row">
					<span class="clock" class:text-red-600={shotclockRed} class:clock-small={title} class:clock-large={!title}>
						{shotclockStringPart1}
					</span>
					<span class="clock" class:text-red-600={shotclockRed} class:clock-small={title} class:clock-large={!title}>
						{shotclockStringPart2}
					</span>
				</div>
			{/if}
		</div>
	{:else}
		<LoadingInfo />
	{/if}
</div>

<style lang="postcss">
	#main {
		@apply text-white;
	}

	.clock {
		font-family: 'SevenSeg';
	}

	.clock-large {
		font-size: 65vmin;
	}

	.clock-small {
		font-size: 45vmin;
	}

	.title {
		font-size: 20vmin;
	}

	@font-face {
		font-family: 'SevenSeg';
		font-style: normal;
		src: url('/fonts/DSEG7Classic-Regular.ttf') format('truetype'),
			url('/fonts/DSEG7Classic-Regular.woff2') format('woff2'),
			url('/fonts/DSEG7Classic-Regular.woff') format('woff');
	}
</style>
