<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Fa from 'svelte-fa';
	import {
		faShareNodes,
		faFastBackward,
		faBullhorn,
		faChevronDown,
		faChevronRight,
		faUsers,
		faClock,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import ClockDisplay from '#lib/components/ClockDisplay.svelte';
	import LoadingInfo from '#lib/components/LoadingInfo.svelte';
	import VolumeToggle from '#lib/components/VolumeToggle.svelte';
	import { resolvePin } from '#lib/pin.ts';
	import { timingCommands } from '#lib/presets.ts';
	import { RoomClient } from '#lib/room.svelte.ts';

	const roomId = page.params.roomId!;
	const currentHost = window.location.host;
	const canShare = !!navigator.share;

	const pin = resolvePin(
		roomId,
		page.url.searchParams,
		$_('errors.enter_pin', { values: { id: roomId } })
	);

	const client = new RoomClient({
		roomId,
		pin: pin ?? undefined,
		// A freshly created room gets its timings from the query string.
		onAuthenticated: () => {
			for (const [param, command] of Object.entries(timingCommands)) {
				const value = page.url.searchParams.get(param);
				if (value !== null) client.send(command, value);
			}
		}
	});

	let advancedOptionsShown = $state(true);

	const timeSteps = { before: [-5, -1], after: [1, 5] };

	const actions = [
		{ key: 'horn', icon: faBullhorn, disabledAt: 2 },
		{ key: 'timeout', icon: faUsers },
		{ key: 'quarter', icon: faClock },
		{ key: 'halftime', icon: faClock }
	] as const;

	onMount(() => {
		if (!pin) {
			goto(resolve('/'));
			return;
		}
		client.connect();
		return () => client.disconnect();
	});

	function startStop() {
		client.send(client.running ? 'pause' : 'start');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			startStop();
			e.preventDefault();
		} else if (
			e.key.toLowerCase() === 'm' ||
			e.key.toLowerCase() === 'c' ||
			e.key === 'Backspace'
		) {
			client.send('reset');
			e.preventDefault();
		}
	}

	const roomPath = $derived(resolve('/room/[roomId]', { roomId }));
	const controllerPath = $derived(resolve('/control/[roomId]', { roomId }));

	function share(titleKey: string, url: string) {
		navigator.share({ title: $_(titleKey, { values: { id: roomId } }), url });
	}
</script>

<svelte:window onclick={() => client.beep.enable()} onkeydown={handleKeydown} />

{#snippet icon(definition: IconDefinition)}
	<Fa class="w-full lg:hidden" icon={definition} />
	<Fa class="w-full hidden lg:block" icon={definition} size="2x" />
{/snippet}

{#snippet timeStep(delta: number)}
	<button
		class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
		onclick={() => client.send('updateTime', delta)}
	>
		{delta > 0 ? '+' : ''}{delta}s
	</button>
{/snippet}

{#snippet urlBlock(label: string, url: string, shareLabel: string, shareTitleKey: string)}
	<div class="w-1/2 lg:w-full">
		<div class="hidden lg:flex flex-col mb-3">
			<span class="text-xs">{label}</span>
			<a href={url}>{currentHost}{url}</a>
		</div>
		<div class:hidden={!canShare}>
			<button
				class="shareButton lg:text-lg flex flex-row items-center"
				onclick={() => share(shareTitleKey, url)}
			>
				<span class="mr-2">{shareLabel}</span>
				<Fa icon={faShareNodes} size="lg" />
			</button>
		</div>
	</div>
{/snippet}

<div id="main" class="w-full h-full">
	{#if client.authenticated}
		<VolumeToggle player={client.beep} />

		<div class="absolute top-3 right-3">
			<div class="flex flex-row">
				<div class="mr-5">
					<span class="text-xs">{$_('control.id')}</span>
					<span class="text-xl">{roomId}</span>
				</div>
				<div>
					<span class="text-xs">{$_('control.pin')}</span>
					<span class="text-xl">{pin}</span>
				</div>
			</div>
		</div>

		<div class="lg:h-full w-full flex flex-col lg:flex-row justify-start lg:justify-between">
			<div class="flex flex-col justify-center items-center m-5 lg:mr-20 lg:m-0">
				<ClockDisplay
					size="controller"
					title={client.title}
					seconds={client.shotclock}
					red={client.alarmRed}
				/>
			</div>

			<!-- Main controls -->
			<div class="flex flex-row lg:flex-col justify-evenly m-5 lg:m-0">
				<button
					class="controlButton"
					class:startButton={!client.running && client.shotclock! > 0}
					class:stopButton={client.running && client.shotclock! > 0}
					class:buttonDisabled={client.shotclock === 0}
					onclick={startStop}
					title={$_('control.hotkeys_start')}
				>
					{client.running ? $_('control.stop') : $_('control.start')}
				</button>
				<button
					class="controlButton shadow-reset text-white bg-button-bg-reset"
					onclick={() => client.send('reset')}
					title={$_('control.hotkeys_reset')}
				>
					{$_('control.reset')}
				</button>
			</div>

			<div
				class="w--7/8 lg:w-full mx-2 lg:mx-0 p-1 lg:p-0 border lg:border-0 rounded-sm mt-3 lg:mt-0"
				class:pb-8={advancedOptionsShown}
				class:mb-5={advancedOptionsShown}
			>
				<button class="lg:hidden" onclick={() => (advancedOptionsShown = !advancedOptionsShown)}>
					<div class="flex flex-row justify-center">
						<div class="mt-1">
							<Fa icon={advancedOptionsShown ? faChevronDown : faChevronRight} />
						</div>
						<span class="ml-2">
							{advancedOptionsShown ? $_('control.hide_advanced') : $_('control.show_advanced')}
						</span>
					</div>
				</button>
				<div
					class="h-full flex flex-col lg:flex-row justify-between lg:pb-0"
					class:hidden={!advancedOptionsShown}
				>
					<!-- Time adjustment -->
					<div class="flex flex-row lg:flex-col justify-evenly mt-5 lg:mt-0 lg:ml-20">
						{#each timeSteps.before as delta}
							{@render timeStep(delta)}
						{/each}
						<button
							class="controlButtonSmall shadow-reset text-white bg-button-bg-reset"
							title={$_('control.rewind')}
							onclick={() => client.send('rewind')}
						>
							{@render icon(faFastBackward)}
						</button>
						{#each timeSteps.after as delta}
							{@render timeStep(delta)}
						{/each}
					</div>

					<div class="flex flex-col lg:flex-col-reverse lg:justify-end">
						<!-- Horn and countdowns -->
						<div
							class="lg:text-right flex flex-row lg:flex-col justify-evenly lg:justify-start m-3 mt-1"
						>
							{#each actions as action}
								<div class="my-5 flex flex-col items-center">
									<button
										class="controlButtonExtraSmall shadow-reset text-white bg-button-bg-reset"
										class:buttonDisabled={'disabledAt' in action &&
											(client.shotclock ?? Infinity) <= action.disabledAt}
										title={action.key === 'horn'
											? $_('control.manual_horn')
											: $_(`control.${action.key}`)}
										onclick={() => client.send(action.key)}
									>
										{@render icon(action.icon)}
									</button>
									<span class="mt-1">{$_(`control.${action.key}`)}</span>
								</div>
							{/each}
						</div>

						<!-- URLs -->
						<div
							class="lg:text-right flex flex-row lg:flex-col justify-between lg:justify-start m-3 lg:mt-20"
						>
							{@render urlBlock(
								$_('control.room_url'),
								roomPath,
								$_('control.share_room_url'),
								'control.share_room_title'
							)}
							{@render urlBlock(
								$_('control.controller_url'),
								controllerPath,
								$_('control.share_controller_url'),
								'control.share_controller_title'
							)}
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
	@reference '../../../app.css';

	#main {
		@apply text-white;
		touch-action: manipulation;
	}

	.controlButton {
		@apply text-2xl lg:text-5xl border-2 border-black rounded-[50%] size-button uppercase;
	}

	.controlButtonSmall {
		@apply text-lg lg:text-xl border-2 border-black rounded-[50%] size-button-small;
	}

	.controlButtonExtraSmall {
		@apply text-lg lg:text-xl border-2 border-black rounded-[50%] size-button-small lg:size-button-extra-small;
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
</style>
