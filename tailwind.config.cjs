module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			width: {
				button: '17vmax',
        		buttonSmall: '7vmax',
        		buttonExtraSmall: '4vmax'
			},
			height: {
				button: '17vmax',
        		buttonSmall: '7vmax',
        		buttonExtraSmall: '4vmax'
			},
			colors: {
				'button-green': 'rgba(0, 255, 0, 1)',
				'button-bg-green': 'rgba(0, 255, 0, 0.2)',
				'button-red': 'rgba(255, 165, 0, 1)',
				'button-bg-red': 'rgba(255, 165, 0, 0.2)',
				'button-bg-reset': 'rgba(105, 105, 105, 0.3)',
        		'button-disabled': 'rgba(105, 105, 105, 0.1)',
        		'button-bg-disabled': 'rgba(105, 105, 105, 0.2)',
				'button': '#e9e9ed',
			},
			boxShadow: {
				'startstop-green': '0px 0px 0px 2px rgba(0, 255, 0, 0.2)',
				'startstop-red': '0px 0px 0px 2px rgba(255, 165, 0, 0.2)',
				'reset': '0px 0px 0px 2px rgba(105, 105, 105, 0.3)'
			},
			gridTemplateColumns: {
				'inputs-2': 'minmax(0, 1fr) auto',
				'inputs-3-button': 'minmax(0, 1fr) repeat(2, auto)',
				'inputs-3': 'repeat(2, minmax(0, 1fr)) auto'
			},
			screens: {
				'portrait': { 'raw': '(orientation: portrait)' },
				'landscape': { 'raw': '(orientation: landscape)' }
			}
		}
	},
	plugins: []
};
