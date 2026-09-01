module.exports = {
	globDirectory: 'dist',
	globPatterns: [
		'**/*.{js,css,html,png,jpg,jpeg,svg,ico,json}'
	],
	swDest: 'dist/sw.js',
	maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [{
		urlPattern: ({ request }) => request.mode === 'navigate',
		handler: 'NetworkFirst',
		options: {
			cacheName: 'menucity-pages',
			networkTimeoutSeconds: 10
		}
	}]
};
