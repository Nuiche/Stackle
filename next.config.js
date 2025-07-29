// next.config.js

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Don't cache GA script
    {
      urlPattern: /^https:\/\/www\.googletagmanager\.com\/gtag\/js?.*$/,
      handler: 'NetworkOnly',
      options: { cacheName: 'no-cache' },
    },
    // Don't cache GA collect endpoint
    {
      urlPattern: /^https:\/\/www\.google-analytics\.com\/g\/collect?.*$/,
      handler: 'NetworkOnly',
      options: { cacheName: 'no-cache' },
    },
    // API routes
    {
      urlPattern: /^\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache' },
    },
    // images
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 60 } },
    },
    // fallback for everything else
    {
      urlPattern: /.*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-cache' },
    },
  ],
});

module.exports = withPWA({
  eslint: { ignoreDuringBuilds: true },
});
