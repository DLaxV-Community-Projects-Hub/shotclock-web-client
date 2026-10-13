<script lang="ts">
	import '../app.css';
	import '#lib/i18n.ts';

	import LoadingInfo from '#lib/components/LoadingInfo.svelte';
	import { isLoading } from 'svelte-i18n';

	let { children } = $props();
</script>

{#if $isLoading}
	<LoadingInfo />
{:else}
	{@render children()}
{/if}
