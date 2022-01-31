<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let loaded: boolean = false;

	let joinId: string;
	let createId: string;
	let createPin: string;

	let showAdvancedCreateSettings: boolean = false;

	onMount(() => {
		// Redirect traffic from 404 page to corresponding room
		let path: string = new URL(window.location.href).pathname;
		if (path !== base + '/') {
			joinId = new URL(window.location.href).pathname.replace(base + '/', '');
			joinRoom();
		} else loaded = true;
	});

	function generateRoomId(): string {
		const min: number = 10000;
		const max: number = 99999;
		return Math.floor(Math.random() * (max - min + 1) + min).toString();
	}

	function generatePin(): string {
		let length: number = 4;
		let chars: string = '0123456789';
		return [...Array(length)].map((i) => chars[Math.floor(Math.random() * chars.length)]).join('');
	}

	function joinRoom() {
		if (joinId) goto(base + '/room/' + joinId);
	}

	function openController() {
		if (joinId) goto(base + '/control/' + joinId);
	}

	function quickCreateRoom() {
		createId = generateRoomId();
		createPin = generatePin();
		createRoom();
	}

	function createRoom() {
		if (createId && createPin) {
			goto(base + '/control/' + createId + '?pin=' + createPin);
		}
	}
</script>

<div id="main" class="w-full h-full flex justify-center">
	{#if loaded}
		<div class="flex justify-center p-5 lg:p-10 h-full w-full lg:w-1/2">
			<div class="flex flex-col justify-between h-full w-full">
				<!-- Top Content -->
				<div class="flex flex-col items-center w-full">
					<div class="flex flex-col items-center w-full">
						<!-- Title -->
						<div class="flex flex-col items-center mb-5 lg:mb-10">
							<h1 class="text-white text-3xl md:text-4xl lg:text-5xl mb-2">DLaxV Shot Clock</h1>
							<h3 class="text-white text-md lg:text-xl text-center">
								Free & Open Source online shot clock application
							</h3>
						</div>

						<!-- Join Room -->
						<div class="w-full lg:w-7/12 mb-10 lg:mb-20">
							<div class="mb-3">
								<h4 class="text-white text-md uppercase">Join room</h4>
							</div>
							<div class="grid grid-cols-inputs-3-button mb-3">
								<span class="uppercase text-white text-xs font-bold">Room ID</span>
								<div />
								<div />
								<input class="px-3 py-2 rounded" bind:value={joinId} />
								<button class="btn text-xl ml-2" on:click={joinRoom}>Join Room</button>
								<button class="btn text-xs ml-2" on:click={openController}
									>Open<br />Controller</button
								>
							</div>
						</div>

						<!-- Create Room -->
						<div class="w-full lg:w-7/12">
							<div class="mb-3">
								<h4 class="text-white text-md uppercase">Create room</h4>
							</div>
							<div class="flex mb-3">
								<button class="btn text-lg" on:click={quickCreateRoom}>Quick create</button>
								<button
									class="btn text-lg ml-2"
									on:click={() => (showAdvancedCreateSettings = !showAdvancedCreateSettings)}
									>Custom settings</button
								>
							</div>
							{#if showAdvancedCreateSettings}
								<div class="grid grid-cols-inputs-3 mb-3">
									<span class="uppercase text-white text-xs font-bold">Room ID</span>
									<span class="uppercase text-white text-xs font-bold">Control PIN</span>
									<div />
									<input class="px-3 py-2 mr-2 rounded" bind:value={createId} />
									<input class="px-3 py-2 rounded" bind:value={createPin} />
									<button class="btn text-xs ml-2" on:click={createRoom}>Create<br />Custom</button>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Logos -->
				<div class="h-32 lg:h-40 flex flex-col items-center justify-between">
					<div class="text-white font-bold text-2xl">Supported by</div>
					<div class="flex h-4/6">
						<div class="h-full mx-5">
							<a href="https://dlaxv.de/" target="_blank">
								<img src="img/logo-dlaxv.svg" alt="Logo DLaxV" class="h-full" />
							</a>
						</div>
						<div class="h-full mx-5">
							<a href="https://worldlacrosse.sport/" target="_blank">
								<img src="img/logo-worldlacrosse.svg" alt="Logo World Lacrosse" class="h-full" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	#main {
		background: rgb(158, 158, 158);
		background: radial-gradient(
			circle,
			rgba(158, 158, 158, 1) 0%,
			rgba(117, 117, 117, 1) 35%,
			rgba(66, 66, 66, 1) 100%
		);
	}

	.btn {
		@apply px-2 py-1 border rounded text-white;
	}
</style>
