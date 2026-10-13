<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import { _, locale } from 'svelte-i18n';
	import { defaultLocale } from '#lib/i18n.ts';
	import { generatePin, generateRoomId } from '#lib/ids.ts';
	import { defaultTimings, presets, type Timings } from '#lib/presets.ts';

	let joinId = $state('');
	let createId = $state('');
	let createPin = $state('');
	let timings = $state<Timings>({ ...defaultTimings });
	let showCustomSettings = $state(false);
	let language = $state($_('locale'));

	const timingFields = [
		{ key: 'shotclock', label: 'index.shot_clock', shortLabel: 'index.short_shot_clock' },
		{ key: 'timeout', label: 'index.timeout', shortLabel: 'index.short_timeout' },
		{ key: 'quarter', label: 'index.quarter', shortLabel: 'index.short_quarter' },
		{ key: 'halftime', label: 'index.halftime', shortLabel: 'index.short_halftime' }
	] as const;

	const logos = [
		{ href: 'https://dlaxv.de/', src: asset('img/logo-dlaxv.svg'), alt: 'Logo DLaxV' },
		{
			href: 'https://worldlacrosse.sport/',
			src: asset('img/logo-worldlacrosse.svg'),
			alt: 'Logo World Lacrosse'
		}
	];

	function changeLanguage() {
		locale.set(language);
		const url = new URL(page.url.href);
		if (language === defaultLocale) url.searchParams.delete('lang');
		else url.searchParams.set('lang', language);
		replaceState(url, {});
	}

	function joinRoom() {
		if (joinId) goto(`${resolve('/clock/[roomId]', { roomId: joinId })}?lang=${language}`);
	}

	function openController() {
		if (joinId) goto(`${resolve('/control/[roomId]', { roomId: joinId })}?lang=${language}`);
	}

	/** Opens the controller of a new room; the controller then configures the room on the server. */
	function createRoom(id: string, pin: string, roomTimings: Timings) {
		if (!id || !pin) return;
		const query = new URLSearchParams({
			pin,
			...Object.fromEntries(Object.entries(roomTimings).map(([k, v]) => [k, String(v)])),
			lang: language
		});
		// No slashes in room names allowed
		const roomId = id.replaceAll('/', '-');
		goto(`${resolve('/control/[roomId]', { roomId })}?${query}`);
	}

	function toggleCustomSettings() {
		showCustomSettings = !showCustomSettings;
		if (showCustomSettings) {
			createId ||= generateRoomId();
			createPin ||= generatePin();
		}
	}
</script>

<main class="w-full min-h-full flex justify-center">
	<div class="absolute top-3 left-3 right-3 lg:top-4 lg:left-4 lg:right-4 flex justify-between">
		<div class="flex gap-2">
			<a href="mailto:shotclock@dlaxv.de" class="chip">{$_('index.send_feedback')}</a>
			<a
				href="https://github.com/DLaxV-Community-Projects-Hub/shotclock-web-client/wiki/Instructions"
				target="_blank"
				class="chip">{$_('index.instructions')}</a
			>
		</div>
		<select
			name="lang"
			id="lang"
			class="chip"
			aria-label={$_('index.language')}
			bind:value={language}
			onchange={changeLanguage}
		>
			<option value="en">EN</option>
			<option value="de">DE</option>
		</select>
	</div>

	<div
		class="flex flex-col items-center w-full max-w-xl px-3 sm:px-5 pt-16 sm:pt-20 pb-8 sm:pb-10 gap-4 sm:gap-8"
	>
		<header class="flex flex-col items-center text-center">
			<h1 class="text-white text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-2">
				{$_('title')}
			</h1>
			<p class="text-white/60 text-sm lg:text-base">{$_('subtitle')}</p>
		</header>

		<!-- Create room -->
		<section class="card w-full">
			<h2 class="section-title">{$_('index.create_room')}</h2>
			<h3 class="text-white/90 text-sm font-medium mb-2">{$_('index.presets')}</h3>
			<div class="grid grid-cols-2 gap-2 sm:gap-3">
				{#each presets as { labelKey, ...preset }}
					<button
						class="preset"
						onclick={() => createRoom(generateRoomId(), generatePin(), preset)}
					>
						<span class="text-[13px] sm:text-lg font-medium leading-tight">{$_(labelKey)}</span>
						<dl class="w-full mt-1 text-[11px] sm:text-xs text-white/60 leading-snug">
							{#each timingFields as { key, shortLabel }}
								<div class="flex justify-between gap-2">
									<dt>{$_(shortLabel)}</dt>
									<dd>{preset[key]}s</dd>
								</div>
							{/each}
						</dl>
					</button>
				{/each}
			</div>

			<div class="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10">
				<button
					class="flex items-center justify-between w-full text-left text-white/80 hover:text-white"
					aria-expanded={showCustomSettings}
					onclick={toggleCustomSettings}
				>
					<span class="font-medium">{$_('index.custom_settings')}</span>
					<span class="text-xl transition-transform" class:rotate-180={showCustomSettings}>⌄</span>
				</button>
				{#if showCustomSettings}
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
						<div class="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
							{#each timingFields as { key, label }}
								<label class="field">
									<span>{$_(label)}</span>
									<input type="number" bind:value={timings[key]} />
								</label>
							{/each}
						</div>
						<button
							class="btn-primary self-end"
							onclick={() => createRoom(createId, createPin, timings)}
						>
							{$_('index.create_custom')}
						</button>
					</div>
				{/if}
			</div>
		</section>

		<!-- Join room -->
		<section class="card w-full">
			<h2 class="section-title">{$_('index.join_room')}</h2>
			<label class="field mb-3">
				<span>{$_('index.room_id')}</span>
				<input bind:value={joinId} onkeydown={(e) => e.key === 'Enter' && joinRoom()} />
			</label>
			<div class="flex gap-3">
				<button class="btn-primary flex-1" onclick={joinRoom}>{$_('index.join_room')}</button>
				<button class="btn-secondary flex-1" onclick={openController}>
					{$_('index.open_controller')}
				</button>
			</div>
		</section>

		<footer class="flex flex-col items-center mt-4">
			<div class="text-white/60 text-sm uppercase tracking-wider mb-4">
				{$_('index.supported_by')}
			</div>
			<div class="flex flex-col items-center gap-4">
				{#each logos as { href, src, alt }}
					<a
						{href}
						target="_blank"
						class="w-72 max-w-full rounded-xl bg-white/90 hover:bg-white px-6 py-4 transition-colors"
					>
						<img {src} {alt} class="w-full h-auto" />
					</a>
				{/each}
			</div>
		</footer>
	</div>
</main>

<style lang="postcss">
	@reference '../app.css';

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
		@apply w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-white outline-hidden focus:border-green-400/70 transition-colors;
	}

	.btn-primary {
		@apply px-4 py-2 rounded-lg font-medium text-black bg-green-400 hover:bg-green-300 transition-colors;
	}

	.btn-secondary {
		@apply px-4 py-2 rounded-lg font-medium text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-colors;
	}
</style>
