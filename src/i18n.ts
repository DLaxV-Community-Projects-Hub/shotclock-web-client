import { register, init } from 'svelte-i18n';
import { browser } from '$app/env';

register('en', () => import('./locales/en.json'));
register('de', () => import('./locales/de.json'));

export const defaultLocale: string = 'en';

if (browser) {
	// init on client side only
	// don't put this inside `load`, otherwise it will gets executed every time you changed route on client side
	init({
		fallbackLocale: defaultLocale,
		initialLocale: defaultLocale
	});
}

export const load = ({ page }) => {
	if (!browser) {
		// init on server side only, need to get query from `page.query.get("lang")`
		init({
			fallbackLocale: defaultLocale,
			initialLocale: defaultLocale
		});
	}
};
