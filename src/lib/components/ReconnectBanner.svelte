<script lang="ts">
	import { _ } from 'svelte-i18n';

	let { visible }: { visible: boolean } = $props();
</script>

{#if visible}
	<div
		role="status"
		class="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded bg-black/70 px-3 py-1 text-sm text-white"
	>
		{$_('errors.reconnecting')}
	</div>
{/if}
