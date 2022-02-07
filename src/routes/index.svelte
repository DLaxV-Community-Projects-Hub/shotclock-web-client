<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { _, locale, isLoading } from 'svelte-i18n';
	import { defaultLocale } from '../i18n';

	let loaded: boolean = false;

	let joinId: string;
	let createId: string;
	let createPin: string;

	let showAdvancedCreateSettings: boolean = false;

	let language: string;
	$: {
		if (browser && !$isLoading) {
			setTimeout(() => {
				locale.set(language);
				replaceStateWithQuery({
					lang: language !== defaultLocale ? language : null
				});
			}, 1);
		}
	}

	onMount(() => {
		language = $_('locale');

		// Redirect traffic from 404 page to corresponding room
		let path: string = new URL(window.location.href).pathname;
		let basePath: string = base + '/';

		if (path !== basePath) {
			const relevantPath: string = new URL(window.location.href).pathname.replace(base + '/', '');
			if (relevantPath.includes('/')) {
				const slashPosition: number = relevantPath.indexOf('/');
				joinId = relevantPath.substring(slashPosition + 1);
				switch (relevantPath.substring(0, slashPosition)) {
					case 'room':
						joinRoom();
						break;
					case 'control':
						openController();
						break;
					default:
						goto(basePath);
				}
			} else {
				joinId = relevantPath;
				joinRoom();
			}
		} else {
			loaded = true;
		}
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
		if (joinId) goto(base + '/room/' + joinId + (language ? '?lang=' + language : ''));
	}

	function openController() {
		if (joinId) goto(base + '/control/' + joinId + (language ? '?lang=' + language : ''));
	}

	function quickCreateRoom() {
		createId = generateRoomId();
		createPin = generatePin();
		createRoom();
	}

	function createRoom() {
		if (createId && createPin) {
			// No slashes in room name allowed
			createId = createId.replace('/', '-');
			goto(
				base + '/control/' + createId + '?pin=' + createPin + (language ? '&lang=' + language : '')
			);
		}
	}

	export const replaceStateWithQuery = (values: Record<string, string>) => {
		const url = new URL(window.location.toString());
		for (let [k, v] of Object.entries(values)) {
			if (!!v) url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v));
			else url.searchParams.delete(k);
		}
		history.replaceState({}, '', url);
	};
</script>

<div id="main" class="w-full h-full flex justify-center">
	{#if loaded && !$isLoading}
		<div class="absolute bottom-2 right-2 lg:top-3 lg:right-3">
			<select name="lang" id="lang" class="p-1 border rounded" bind:value={language}>
				<option value="en">🇺🇸</option>
				<option value="de">🇩🇪</option>
			</select>
		</div>
		<div class="flex justify-center p-5 lg:p-10 h-full w-full xl:w-1/2">
			<div class="flex flex-col justify-between h-full w-full">
				<!-- Top Content -->
				<div class="flex flex-col items-center w-full">
					<div class="flex flex-col items-center w-full">
						<!-- Title -->
						<div class="flex flex-col items-center mb-5 lg:mb-10">
							<h1 class="text-white text-3xl md:text-4xl lg:text-5xl mb-2">{$_('title')}</h1>
							<h3 class="text-white text-md lg:text-xl text-center">
								{$_('subtitle')}
							</h3>
						</div>

						<!-- Join Room -->
						<div class="w-full lg:w-7/12 mb-10 lg:mb-20">
							<div class="mb-3">
								<h4 class="text-white text-md uppercase">{$_('index.join_room')}</h4>
							</div>
							<div class="grid grid-cols-inputs-3-button mb-3">
								<span class="uppercase text-white text-xs font-bold">{$_('index.room_id')}</span>
								<div />
								<div />
								<input
									class="px-3 py-2 rounded"
									bind:value={joinId}
									on:keypress={(e) => {
										if (e.key === 'Enter') joinRoom();
									}}
								/>
								<button class="btn text-xl ml-2" on:click={joinRoom}>{$_('index.join_room')}</button
								>
								<button class="btn text-xs ml-2" on:click={openController}
									>{@html $_('index.open_controller')}</button
								>
							</div>
						</div>

						<!-- Create Room -->
						<div class="w-full lg:w-7/12">
							<div class="mb-3">
								<h4 class="text-white text-md uppercase">{$_('index.create_room')}</h4>
							</div>
							<div class="flex mb-3">
								<button class="btn text-lg" on:click={quickCreateRoom}
									>{$_('index.quick_create')}</button
								>
								<button
									class="btn text-lg ml-2"
									on:click={() => (showAdvancedCreateSettings = !showAdvancedCreateSettings)}
									>{$_('index.custom_settings')}</button
								>
							</div>
							{#if showAdvancedCreateSettings}
								<div class="grid grid-cols-inputs-3 mb-3">
									<span class="uppercase text-white text-xs font-bold">{$_('index.room_id')}</span>
									<span class="uppercase text-white text-xs font-bold"
										>{$_('index.control_pin')}</span
									>
									<div />
									<input class="px-3 py-2 mr-2 rounded" bind:value={createId} />
									<input class="px-3 py-2 rounded" bind:value={createPin} />
									<button class="btn text-xs ml-2" on:click={createRoom}
										>{@html $_('index.create_custom')}</button
									>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Logos -->
				<div class="h-32 lg:h-40 flex flex-col items-center justify-between">
					<div class="text-white font-bold text-2xl">{$_('index.supported_by')}</div>
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
