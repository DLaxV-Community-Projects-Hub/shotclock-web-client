<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let loaded: boolean = false;

	let roomIdJoin: string;
	let roomIdCreate: string = generateRoomId();

	onMount(() => {
		// Redirect traffic from 404 page to corresponding room
		let path: string = new URL(window.location.href).pathname;
		if (path !== base + '/') {
			roomIdJoin = new URL(window.location.href).pathname.replace(base + '/', '');
			joinRoom();
		} else loaded = true;
	});

	function generateRoomId(): string {
		const min: number = 10000;
		const max: number = 99999;
		return Math.floor(Math.random() * (max - min + 1) + min).toString();
	}

	function joinRoom() {
		if (roomIdJoin) goto(base + '/' + roomIdJoin);
	}
</script>

{#if loaded}
	<div id="main" class="w-screen h-screen">
		<div class="flex justify-center h-full p-10">
			<div class="flex flex-col justify-between h-full">
				<div class="flex flex-col items-center">
					<div class="flex flex-col items-center">
						<div class="flex flex-col items-center mb-5">
							<h1 class="text-white text-5xl mb-2">DLaxV Shot Clock</h1>
							<h3 class="text-white text-xl">Free & Open Source online shot clock application</h3>
						</div>
						<div class="flex mb-3 justify-between">
							<input
								class="w-8/12 px-3 py-2 rounded"
								placeholder="Room ID"
								bind:value={roomIdJoin}
							/>
							<button class="btn" on:click={joinRoom}>Join Room</button>
						</div>
					</div>
					<div class="flex items-center">
						<button class="btn">Instructions</button>
						<button class="btn">Create Room</button>
					</div>
				</div>

				<!-- Logos -->
				<div class="h-40 flex flex-col items-center justify-between">
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
	</div>
{/if}

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
		@apply p-2 mx-2 border rounded text-white text-xl;
	}
</style>
