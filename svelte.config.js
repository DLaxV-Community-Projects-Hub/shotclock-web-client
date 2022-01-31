import static_adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const dev = process.env.NODE_ENV === 'development';

console.log('Dev build: ' + dev);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: true
    })
  ],

  kit: {
    adapter: static_adapter(),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    paths: {
      base: dev ? '' : '/shotclock-web-client'
    }
  }
};

export default config;
