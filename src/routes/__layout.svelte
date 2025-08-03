<script lang="ts">
	import '../app.css';
	import '../i18n.ts';

	import LoadingInfo from '../components/LoadingInfo.svelte';
	import { isLoading } from 'svelte-i18n';
</script>

<script defer data-domain="shotclock.dlaxv.de" src="https://analytics.tobi.re/js/script.js"></script>

{#if $isLoading}
	<LoadingInfo />
{:else}
	<slot />
{/if}
