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
	let initialShotclock: number = 30;
	let timeoutTime: number = 30;
	let quarterTime: number = 120;
	let halftimeTime: number = 300;

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

	type Preset = {
		labelKey: string;
		shotclock: number;
		timeout: number;
		quarter: number;
		halftime: number;
	};

	const presets: Preset[] = [
		{ labelKey: 'index.quick_create', shotclock: 30, timeout: 30, quarter: 120, halftime: 300 },
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

	function createFromPreset(preset: Preset) {
		initialShotclock = preset.shotclock;
		timeoutTime = preset.timeout;
		quarterTime = preset.quarter;
		halftimeTime = preset.halftime;
		createId = generateRoomId();
		createPin = generatePin();
		createRoom();
	}

	function toggleCustomSettings() {
		showAdvancedCreateSettings = !showAdvancedCreateSettings;
		if (showAdvancedCreateSettings) {
			if (!createId) createId = generateRoomId();
			if (!createPin) createPin = generatePin();
		}
	}

	function createRoom() {
		if (createId && createPin) {
			// No slashes in room name allowed
			createId = createId.replace('/', '-');
			goto(
				base +
					'/control/' +
					createId +
					'?pin=' +
					createPin +
					'&shotclock=' +
					initialShotclock +
					'&timeout=' +
					timeoutTime +
					'&quarter=' +
					quarterTime +
					'&halftime=' +
					halftimeTime +
					(language ? '&lang=' + language : '')
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

<main class="w-full min-h-full flex justify-center">
	{#if loaded && !$isLoading}
		<div class="absolute top-3 left-3 right-3 lg:top-4 lg:left-4 lg:right-4 flex justify-between">
			<div class="flex gap-2">
				<a href="mailto:shotclock@dlaxv.de" class="chip">{$_('index.send_feedback')}</a>
				<a
					href="https://github.com/DLaxV-Community-Projects-Hub/shotclock-web-client/wiki/Instructions"
					target="_blank"
					class="chip">{$_('index.instructions')}</a
				>
			</div>
			<select name="lang" id="lang" class="chip" bind:value={language}>
				<option value="en">🇺🇸</option>
				<option value="de">🇩🇪</option>
			</select>
		</div>

		<div class="flex flex-col items-center w-full max-w-xl px-3 sm:px-5 pt-16 sm:pt-20 pb-8 sm:pb-10 gap-4 sm:gap-8">
			<!-- Title -->
			<header class="flex flex-col items-center text-center">
				<h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-2">
					{$_('title')}
				</h1>
				<p class="text-white/60 text-sm lg:text-base">{$_('subtitle')}</p>
			</header>

			<!-- Create Room -->
			<section class="card w-full">
				<h2 class="section-title">{$_('index.create_room')}</h2>
				<h3 class="text-white/90 text-sm font-medium mb-2">{$_('index.presets')}</h3>
				<div class="grid grid-cols-2 gap-2 sm:gap-3">
					{#each presets as preset}
						<button class="preset" on:click={() => createFromPreset(preset)}>
							<span class="text-[13px] sm:text-lg font-medium leading-tight">{$_(preset.labelKey)}</span>
							<dl class="w-full mt-1 text-[11px] sm:text-xs text-white/60 leading-snug">
								{#each [['short_shot_clock', preset.shotclock], ['short_timeout', preset.timeout], ['short_quarter', preset.quarter], ['short_halftime', preset.halftime]] as [key, value]}
									<div class="flex justify-between gap-2">
										<dt>{$_('index.' + key)}</dt>
										<dd>{value}s</dd>
									</div>
								{/each}
							</dl>
						</button>
					{/each}
				</div>

				<!-- Custom settings -->
				<div class="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10">
					<button
						class="flex items-center justify-between w-full text-left text-white/80 hover:text-white"
						aria-expanded={showAdvancedCreateSettings}
						on:click={toggleCustomSettings}
					>
						<span class="font-medium">{$_('index.custom_settings')}</span>
						<span class="text-xl transition-transform" class:rotate-180={showAdvancedCreateSettings}
							>⌄</span
						>
					</button>
					{#if showAdvancedCreateSettings}
						<div class="mt-4 flex flex-col gap-4">
							<div class="grid grid-cols-2 gap-3">
								<label class="field">
									<span>{$_('index.room_id')}</span>
									<input bind:value={createId} />
								</label>
								<label class="field">
									<span>{$_('index.control_pin')}</span>
									<input bind:value={createPin} />
								</label>
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
								<label class="field">
									<span>{@html $_('index.shot_clock')}</span>
									<input type="number" bind:value={initialShotclock} />
								</label>
								<label class="field">
									<span>{@html $_('index.timeout')}</span>
									<input type="number" bind:value={timeoutTime} />
								</label>
								<label class="field">
									<span>{@html $_('index.quarter')}</span>
									<input type="number" bind:value={quarterTime} />
								</label>
								<label class="field">
									<span>{@html $_('index.halftime')}</span>
									<input type="number" bind:value={halftimeTime} />
								</label>
							</div>
							<button class="btn-primary self-end" on:click={createRoom}>
								{@html $_('index.create_custom').replace(/<br\s*\/?>/g, ' ')}
							</button>
						</div>
					{/if}
				</div>
			</section>

			<!-- Join Room -->
			<section class="card w-full">
				<h2 class="section-title">{$_('index.join_room')}</h2>
				<label class="field mb-3">
					<span>{$_('index.room_id')}</span>
					<input
						bind:value={joinId}
						on:keypress={(e) => {
							if (e.key === 'Enter') joinRoom();
						}}
					/>
				</label>
				<div class="flex gap-3">
					<button class="btn-primary flex-1" on:click={joinRoom}
						>{@html $_('index.join_room_button').replace(/<br\s*\/?>/g, ' ')}</button
					>
					<button class="btn-secondary flex-1" on:click={openController}
						>{@html $_('index.open_controller').replace(/<br\s*\/?>/g, ' ')}</button
					>
				</div>
			</section>

			<!-- Logos -->
			<footer class="flex flex-col items-center mt-4">
				<div class="text-white/60 text-sm uppercase tracking-wider mb-4">
					{$_('index.supported_by')}
				</div>
				<div class="flex flex-col items-center gap-4">
					<a href="https://dlaxv.de/" target="_blank" class="w-72 max-w-full rounded-xl bg-white/90 hover:bg-white px-6 py-4 transition-colors">
						<img src="img/logo-dlaxv.svg" alt="Logo DLaxV" class="w-full h-auto" />
					</a>
					<a href="https://worldlacrosse.sport/" target="_blank" class="w-72 max-w-full rounded-xl bg-white/90 hover:bg-white px-6 py-4 transition-colors">
						<img src="img/logo-worldlacrosse.svg" alt="Logo World Lacrosse" class="w-full h-auto" />
					</a>
				</div>
			</footer>
		</div>
	{/if}
</main>

<style lang="postcss">
	main {
		background: radial-gradient(ellipse at top, #9a9ea6 0%, #6b7079 45%, #3f434a 100%);
		background-attachment: fixed;
	}

	.card {
		@apply rounded-2xl border border-white/20 bg-black/25 p-5 backdrop-blur;
	}

	.section-title {
		@apply text-white/70 text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4;
	}

	.chip {
		@apply px-3 py-1 text-sm rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors;
	}

	.chip option {
		@apply text-black;
	}

	.preset {
		@apply flex flex-col items-start text-left text-white rounded-xl border border-white/20 bg-white/10 px-2 py-2 sm:px-4 sm:py-3 transition hover:bg-white/20 hover:border-green-400/60;
	}

	.field {
		@apply flex flex-col gap-1 min-w-0;
	}

	.field span {
		@apply text-white/60 text-xs uppercase tracking-wide;
	}

	.field input {
		@apply w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:border-green-400/70 transition-colors;
	}

	.btn-primary {
		@apply px-4 py-2 rounded-lg font-medium text-black bg-green-400 hover:bg-green-300 transition-colors;
	}

	.btn-secondary {
		@apply px-4 py-2 rounded-lg font-medium text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-colors;
	}
</style>
