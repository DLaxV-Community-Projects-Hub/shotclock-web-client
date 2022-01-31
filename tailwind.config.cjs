module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'inputs-2': 'minmax(0, 1fr) auto',
        'inputs-3-button': 'minmax(0, 1fr) repeat(2, auto)',
        'inputs-3': 'repeat(2, minmax(0, 1fr)) auto'
      }
    },
  },
  plugins: [],
}
