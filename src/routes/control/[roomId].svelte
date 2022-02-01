<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { websocketProtocol, serverBaseUrl } from '../../config.js';

	import Fa from 'svelte-fa';
	import {
		faVolumeUp,
		faVolumeMute,
		faShareAlt,
		faSpinner
	} from '@fortawesome/free-solid-svg-icons';
	import { goto } from '$app/navigation';

	let roomId: string = $page['params']['roomId'];
	let pin: string;
	let currentHost: string;

	let authenticated: boolean = false;

	let ws: WebSocket;

	let shotclock: number;
	let shotclockString: string = '';
	$: if (shotclock !== undefined) shotclockString = shotclock.toString().padStart(2, '0');
	let shotclockRed: boolean = false;

	let running: boolean;

	let alarmTimer: ReturnType<typeof setInterval>;
	let audioActive: boolean = false;
	let audio: HTMLAudioElement;

	onMount(() => {
		currentHost = window.location.host;
		if ($page['url']['searchParams'].has('pin')) {
			pin = $page['url']['searchParams'].get('pin');
		} else {
			pin = sessionStorage.getItem('PIN-' + roomId);
			if (!pin) pin = prompt('Please enter the control PIN for room ' + roomId);
		}
		if (pin) {
			sessionStorage.setItem('PIN-' + roomId, pin);
			join(pin);
			audio = new Audio(base + '/audio/beep.mp3');
		} else {
			goto(base + '/');
		}
	});

	function activateAudio() {
		audioActive = true;
		audio.play();
		audio.pause();
		audio.load();
	}

	function join(pin: string) {
		ws = new WebSocket(websocketProtocol + '://' + serverBaseUrl + '/' + roomId + '?pin=' + pin);
		ws.onerror = function (error) {
			console.log(error);
		};
		ws.onmessage = function (event) {
			if (event.data === 'ROOM_NOT_FOUND') {
				alert('The room ' + roomId + ' does not exist');
				goto(base + '/');
			} else if (event.data === 'WRONG_PIN') {
				alert('Wrong PIN');
				sessionStorage.removeItem('PIN-' + roomId);
				goto(base + '/');
			} else if (event.data === 'AUTHENTICATED') {
				authenticated = true;
			} else {
				let id: string = event.data.substring(0, 1);
				let data: Array<string> = event.data.substring(2).includes(';')
					? event.data.substring(2).split(';')
					: [event.data.substring(2)];
				switch (id) {
					case 't': // Time
						shotclock = parseInt(data[1]);
						if (shotclock == 0) alarm();
						else deactivateAlarm();
						break;
					case 'r': // Running
						running = data[0] === '1';
						break;
				}
			}
		};
	}

	function startStop() {
		if (running) ws.send('pause');
		else ws.send('start');
	}

	function reset() {
		ws.send('reset');
	}

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

	function shareRoomURL() {
		if (navigator.share) {
			navigator.share({
				title: 'Shot Clock room ' + roomId,
				url: currentHost + base + '/room/' + roomId
			});
		}
	}

	function shareControlURL() {
		if (navigator.share) {
			navigator.share({
				title: 'Shot Clock controller ' + roomId,
				url: currentHost + base + '/control/' + roomId
			});
		}
	}
</script>

<div id="main" class="w-full h-full overflow-hidden" on:click|once={activateAudio}>
	{#if authenticated}
		<!-- Volume Icon -->
		<div class="absolute top-3 left-3" on:click={() => (audioActive = !audioActive)}>
			{#if audioActive}
				<Fa icon={faVolumeUp} size="2x" />
			{:else}
				<Fa icon={faVolumeMute} size="2x" />
			{/if}
		</div>

		<div class="h-full w-full flex flex-col lg:flex-row justify-between">
			<!-- Shotclock -->
			<div class="flex flex-col justify-center items-center">
				<span class="clock" class:text-red-600={shotclockRed}>{shotclockString}</span>
			</div>
			<!-- Controls -->
			<div class="flex flex-row lg:flex-col justify-evenly">
				<button
					class="controlButton"
					class:startButton={!running}
					class:stopButton={running}
					on:click={startStop}
				>
					<span>
						{#if running}
							STOP
						{:else}
							START
						{/if}
					</span>
				</button>
				<button class="controlButton shadow-reset text-white bg-button-bg-reset" on:click={reset}
					>RESET</button
				>
			</div>
			<!-- Infos -->
			<div class="lg:text-right flex flex-row lg:flex-col justify-between lg:justify-start m-3">
				<div class="lg:mb-10 w-1/2 lg:w-full">
					<div class="flex flex-col mb-3 mr-5 lg:mr-0">
						<span class="text-xs">Room</span>
						<span class="text-xl">{roomId}</span>
					</div>
					<div class="hidden lg:flex flex-col mb-3">
						<span class="text-xs">Room URL</span>
						<a href="{base}/room/{roomId}">{currentHost}{base}/room/{roomId}</a>
					</div>
					<div class:hidden={!navigator.share}>
						<button class="shareButton lg:text-lg">
							<div class="flex flex-row items-center" on:click={shareRoomURL}>
								<span class="mr-2">Share Room URL</span>
								<Fa icon={faShareAlt} size="lg" />
							</div>
						</button>
					</div>
				</div>
				<div class="w-1/2 lg:w-full">
					<div class="flex flex-col mb-3">
						<span class="text-xs">PIN</span>
						<span class="text-xl">{pin}</span>
					</div>
					<div class="hidden lg:flex flex-col mb-3">
						<span class="text-xs">Controller URL</span>
						<a href="{base}/control/{roomId}">{currentHost}{base}/control/{roomId}</a>
					</div>
					<div class:hidden={!navigator.share}>
						<button class="shareButton lg:text-lg">
							<div class="flex flex-row items-center" on:click={shareControlURL}>
								<span class="mr-2">Share Control URL</span>
								<Fa icon={faShareAlt} size="lg" />
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="h-full flex justify-center">
			<div class="flex flex-col justify-center">
				<Fa icon={faSpinner} size="5x" spin />
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	#main {
		@apply bg-black text-white;
	}

	.clock {
		font-family: 'SevenSeg';
		font-size: 65vmin;
	}

	.controlButton {
		@apply text-2xl lg:text-5xl border-2 border-black rounded-[50%] w-button h-button;
	}

	.startButton {
		@apply text-button-green bg-button-bg-green shadow-startstop-green;
	}

	.stopButton {
		@apply text-button-red bg-button-bg-red shadow-startstop-red;
	}

	.shareButton {
		@apply px-2 py-1 border rounded text-white;
	}

	@font-face {
		font-family: 'SevenSeg';
		font-style: normal;
		src: url('/fonts/DSEG7Classic-Regular.ttf') format('truetype'),
			url('/fonts/DSEG7Classic-Regular.woff2') format('woff2'),
			url('/fonts/DSEG7Classic-Regular.woff') format('woff');
	}
</style>