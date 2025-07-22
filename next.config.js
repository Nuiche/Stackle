// next.config.js
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache' },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 60 } },
    },
    {
      urlPattern: /.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-cache' },
    },
  ],
});

module.exports = withPWA({
  eslint: { ignoreDuringBuilds: true },
})
