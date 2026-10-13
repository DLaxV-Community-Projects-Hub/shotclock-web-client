import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// Single page app: room IDs are only known at runtime, so every unknown path falls
			// back to the app shell (GitHub Pages serves 404.html for those).
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
