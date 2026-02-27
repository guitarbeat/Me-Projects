const CACHE_NAME = 'flo-and-tell-v3';
const STATIC_CACHE = 'flo-static-v3';
const DYNAMIC_CACHE = 'flo-dynamic-v3';

// Resources to cache immediately
const urlsToCache = ['/', '/index.html', '/flo.png', '/manifest.json'];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(urlsToCache);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    (async () => {
      try {
        // Strategy 0: Network-first for navigations (HTML documents)
        // Prevents serving stale index.html that references old asset hashes
        if (request.mode === 'navigate' || request.destination === 'document') {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (err) {
            const cached = await caches.match(request);
            if (cached) return cached;
            // Fallback to app shell if available
            const cachedRoot = await caches.match('/');
            return cachedRoot || new Response('Offline', { status: 200 });
          }
        }

        // Strategy 1: Cache First for static assets (images, fonts, CSS, JS)
        if (
          request.destination === 'image' ||
          request.destination === 'font' ||
          request.destination === 'style' ||
          request.destination === 'script'
        ) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }

        // Strategy 2: Network First for API calls and dynamic content
        if (
          url.pathname.startsWith('/api/') ||
          url.hostname.includes('supabase')
        ) {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          }
        }

        // Strategy 3: Stale-While-Revalidate for other same-origin requests
        const cachedResponse = await caches.match(request);
        const fetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      } catch (error) {
        console.error('Fetch failed:', error);
        // Return offline fallback if available
        if (request.destination === 'document') {
          const offlineResponse = await caches.match('/');
          return offlineResponse || new Response('Offline', { status: 200 });
        }
        throw error;
      }
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Handle background sync operations here
      Promise.resolve()
    );
  }
});

// Push notifications (placeholder for future implementation)
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  // Handle push notifications here
});
