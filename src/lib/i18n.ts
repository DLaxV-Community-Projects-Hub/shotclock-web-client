import { register, init, getLocaleFromNavigator, getLocaleFromQueryString } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('de', () => import('./locales/de.json'));

export const defaultLocale = 'en';

// The app runs in the browser only (see routes/+layout.js), so this can init right away.
init({
	fallbackLocale: defaultLocale,
	initialLocale: getLocaleFromQueryString('lang') ?? getLocaleFromNavigator()
});
