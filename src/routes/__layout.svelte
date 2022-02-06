<script lang="ts">
	import '../app.css';
	import '../i18n.ts';

	import LoadingInfo from '../components/LoadingInfo.svelte';
	import { isLoading, locale, getLocaleFromNavigator, getLocaleFromQueryString } from 'svelte-i18n';
	import { browser } from '$app/env';

	if (browser) {
		let language: string =
			getLocaleFromQueryString('lang') != null
				? getLocaleFromQueryString('lang')
				: getLocaleFromNavigator();
		setTimeout(() => {
			locale.set(language);
		}, 1);
		console.log('Language: ' + language);
	}
</script>

{#if $isLoading}
	<LoadingInfo />
{:else}
	<slot />
{/if}
