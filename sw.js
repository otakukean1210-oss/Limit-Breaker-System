importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (self.workbox) {
  self.workbox.precaching.precacheAndRoute([
    { url: 'index.html', revision: '1' },
    { url: 'style.css', revision: '1' },
    { url: 'script.js', revision: '1' },
    { url: 'manifest.json', revision: '1' },
    { url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js', revision: '1' },
    { url: 'system-icon-192.png', revision: '1' }, 
    { url: 'system-icon-512(1).png', revision: '1' },
  ]);
  

  self.workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new self.workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    })
  );
  

  self.workbox.routing.registerRoute(
      /.*fonts\.googleapis\.com.*/,
      new self.workbox.strategies.StaleWhileRevalidate({
          cacheName: 'google-fonts-cache',
      })
  );
  
} else {
  console.log('Workbox failed to load.');
}