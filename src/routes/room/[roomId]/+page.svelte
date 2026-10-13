<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ClockDisplay from '#lib/components/ClockDisplay.svelte';
	import ReconnectBanner from '#lib/components/ReconnectBanner.svelte';
	import FullscreenToggle from '#lib/components/FullscreenToggle.svelte';
	import VolumeToggle from '#lib/components/VolumeToggle.svelte';
	import { RoomClient } from '#lib/room.svelte.ts';

	const client = new RoomClient({ roomId: page.params.roomId! });

	onMount(() => {
		client.connect();
		return () => client.disconnect();
	});
</script>

<svelte:window onclick={() => client.beep.enable()} />

<div id="main" class="w-full h-full">
	<ReconnectBanner visible={client.reconnecting} />
	<VolumeToggle player={client.beep} />
	<FullscreenToggle />
	<div class="h-full w-full flex flex-col justify-start items-center">
		<ClockDisplay
			size="display"
			title={client.title}
			seconds={client.shotclock}
			red={client.alarmRed}
		/>
	</div>
</div>

<style lang="postcss">
	@reference '../../../app.css';

	#main {
		@apply text-white;
	}
</style>
