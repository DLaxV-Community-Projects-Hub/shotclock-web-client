<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { websocketProtocol, serverBaseUrl } from '../../config.js';

	import LoadingInfo from '../../components/LoadingInfo.svelte';

	import Fa from 'svelte-fa';
	import {
		faVolumeUp,
		faVolumeMute,
		faShareAlt,
		faFastBackward,
		faBullhorn,
		faChevronDown,
		faChevronRight
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

	let advancedOptionsShown: boolean = true;

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

		if (navigator.share)
			advancedOptionsShown = false;
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

	function rewind() {
		ws.send('rewind');
	}

	function updateTime(t: number) {
		ws.send('updateTime;' + t);
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
				url: base + '/room/' + roomId
			});
		}
	}

	function shareControlURL() {
		if (navigator.share) {
			navigator.share({
				title: 'Shot Clock controller ' + roomId,
				url: base + '/control/' + roomId
			});
		}
	}

	function handleKeydown(e) {
		if (e.key === ' ' || e.key === 'Enter') {
			// Space/Enter
			startStop();
			e.preventDefault();
		} else if (
			e.key.toLowerCase() === 'm' ||
			e.key.toLowerCase() === 'c' ||
			e.key === 'Backspace'
		) {
			// M/C/Backspace
			reset();
			e.preventDefault();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div id="main" class="w-full h-full" on:click|once={activateAudio}>
	{#if authenticated}
		<!-- Volume Icon -->
		<div class="absolute top-3 left-3" on:click={() => (audioActive = !audioActive)}>
			{#if audioActive}
				<Fa icon={faVolumeUp} size="2x" />
			{:else}
				<Fa icon={faVolumeMute} size="2x" />
			{/if}
		</div>
		<!-- Room ID Info -->
		<div class="absolute top-3 right-3">
			<div class="flex flex-row">
				<div class="mr-5">
					<span class="text-xs">Room</span>
					<span class="text-xl">{roomId}</span>
				</div>
				<div class="">
					<span class="text-xs">PIN</span>
					<span class="text-xl">{pin}</span>
				</div>
			</div>
		</div>

		<div class="h-full w-full flex flex-col lg:flex-row justify-start lg:justify-between">
			<!-- Shotclock -->
			<div class="flex flex-col justify-center items-center m-5 lg:m-0">
				<span class="clock" class:text-red-600={shotclockRed}>{shotclockString}</span>
			</div>
			<!-- Controls -->
			<div class="flex flex-row lg:flex-col justify-evenly m-5 lg:m-0">
				<button
					class="controlButton"
					class:startButton={!running && shotclock > 0}
					class:stopButton={running && shotclock > 0}
					class:buttonDisabled={shotclock == 0}
					on:click={startStop}
				>
					<span title="Hotkeys: Spacebar, Enter">
						{#if running}
							STOP
						{:else}
							START
						{/if}
					</span>
				</button>
				<button class="controlButton shadow-reset text-white bg-button-bg-reset" on:click={reset} title="Hotkeys: M, C, Backspace"
					>RESET</button
				>
			</div>

			<div class="w--7/8 lg:w-full mx-2 lg:mx-0 p-1 lg:p-0 border lg:border-0 rounded" class:pb-3={advancedOptionsShown}>
				<button class="lg:hidden" on:click={() => (advancedOptionsShown = !advancedOptionsShown)}>
					<div class="flex flex-row justify-center">
						{#if advancedOptionsShown}
							<div class="mt-1">
								<Fa icon={faChevronDown} />
							</div>
							<span class="ml-2">Hide advanced options</span>
						{:else}
							<div class="mt-1">
								<Fa icon={faChevronRight} />
							</div>
							<span class="ml-2">Show advanced options</span>
						{/if}
					</div>
				</button>
				<div class="h-full flex flex-col lg:flex-row justify-between lg:pb-0" class:hidden={!advancedOptionsShown} class:pb-5={!advancedOptionsShown}>
					<div class="flex flex-row lg:flex-col justify-evenly mt-5 lg:mt-0 lg:ml-20">
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							on:click={() => updateTime(-5)}>-5s</button
						>
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							on:click={() => updateTime(-1)}>-1s</button
						>
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							title="Rewind to last reset"
							on:click={rewind}
						>
							<Fa class="w-full lg:hidden" icon={faFastBackward} />
							<Fa class="w-full hidden lg:block" icon={faFastBackward} size="2x" />
						</button>
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							on:click={() => updateTime(1)}>+1s</button
						>
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							on:click={() => updateTime(5)}>+5s</button
						>
					</div>

					<div class="flex flex-col lg:flex-col-reverse lg:justify-end">
						<div class="lg:text-right flex flex-row lg:flex-col justify-evenly lg:justify-start m-3 mt-1">
							<div>
								<button
									class="controlButtonExtraSmall shadow-reset text-white bg-button-bg-reset"
									title="Manual horn"
								>
									<Fa class="w-full lg:hidden" icon={faBullhorn} />
									<Fa class="w-full hidden lg:block" icon={faBullhorn} size="2x" />
								</button>
							</div>
						</div>

						<!-- Infos -->
						<div class="lg:text-right flex flex-row lg:flex-col justify-between lg:justify-start m-3 lg:mt-20">
							<div class="w-1/2 lg:w-full">
								<div class="hidden lg:flex flex-col mb-3">
									<span class="text-xs">Shot clock URL</span>
									<a href="{base}/room/{roomId}">{currentHost}{base}/room/{roomId}</a>
								</div>
								<div class:hidden={!navigator.share}>
									<button class="shareButton lg:text-lg">
										<div class="flex flex-row items-center" on:click={shareRoomURL}>
											<span class="mr-2">Share shot clock URL</span>
											<Fa icon={faShareAlt} size="lg" />
										</div>
									</button>
								</div>
							</div>
							<div class="w-1/2 lg:w-full">
								<div class="hidden lg:flex flex-col mb-3">
									<span class="text-xs">Controller URL</span>
									<a href="{base}/control/{roomId}">{currentHost}{base}/control/{roomId}</a>
								</div>
								<div class:hidden={!navigator.share}>
									<button class="shareButton lg:text-lg">
										<div class="flex flex-row items-center" on:click={shareControlURL}>
											<span class="mr-2">Share Controller URL</span>
											<Fa icon={faShareAlt} size="lg" />
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<LoadingInfo />
	{/if}
</div>

<style lang="postcss">
	#main {
		@apply text-white;
		touch-action: manipulation;
	}

	.clock {
		font-family: 'SevenSeg';
		font-size: 50vmin;
	}

	.controlButton {
		@apply text-2xl lg:text-5xl border-2 border-black rounded-[50%] w-button h-button uppercase;
	}

	.controlButtonSmall {
		@apply text-lg lg:text-xl border-2 border-black rounded-[50%] w-buttonSmall h-buttonSmall;
	}

	.controlButtonExtraSmall {
		@apply text-lg lg:text-xl border-2 border-black rounded-[50%] w-buttonSmall h-buttonSmall lg:w-buttonExtraSmall lg:h-buttonExtraSmall;
	}

	.startButton {
		@apply text-button-green bg-button-bg-green shadow-startstop-green;
	}

	.stopButton {
		@apply text-button-red bg-button-bg-red shadow-startstop-red;
	}

	.buttonDisabled {
		@apply text-button-disabled bg-button-bg-disabled shadow-reset;
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
