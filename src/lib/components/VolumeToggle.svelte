<script lang="ts">
	import Fa from 'svelte-fa';
	import { faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';
	import type { BeepPlayer } from '#lib/beep.svelte.ts';

	let { player }: { player: BeepPlayer } = $props();
</script>

<button
	type="button"
	class="absolute top-3 left-3"
	aria-label={$_('control.toggle_sound')}
	onclick={() => player.toggle()}
>
	<Fa icon={player.active ? faVolumeHigh : faVolumeXmark} size="2x" />
</button>
