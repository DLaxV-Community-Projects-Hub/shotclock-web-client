<script lang="ts">
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
	import { _ } from 'svelte-i18n';

	let supported = $state(false);
	let active = $state(false);

	onMount(() => {
		// Not available e.g. on iPhones, where Safari goes full screen on its own when rotated
		supported = document.fullscreenEnabled;
		const sync = () => (active = !!document.fullscreenElement);
		document.addEventListener('fullscreenchange', sync);
		return () => document.removeEventListener('fullscreenchange', sync);
	});

	function toggle() {
		if (document.fullscreenElement) document.exitFullscreen();
		else document.documentElement.requestFullscreen();
	}
</script>

{#if supported}
	<button
		type="button"
		class="absolute top-3 right-3"
		aria-label={$_('control.toggle_fullscreen')}
		title={$_('control.toggle_fullscreen')}
		onclick={toggle}
	>
		<Fa icon={active ? faCompress : faExpand} size="2x" />
	</button>
{/if}
