<script lang="ts">
	import '../app.css';
	import '../i18n.ts';

	import LoadingInfo from '../components/LoadingInfo.svelte';
	import { isLoading, locale, getLocaleFromNavigator, getLocaleFromQueryString } from 'svelte-i18n';

	let language: string =
		getLocaleFromQueryString('lang') != null
			? getLocaleFromQueryString('lang')
			: getLocaleFromNavigator();
	locale.set(language);
</script>

{#if $isLoading}
	<LoadingInfo />
{:else}
	<slot />
{/if}
