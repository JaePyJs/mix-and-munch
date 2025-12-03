const CACHE_NAME = 'mix-munch-v1';
const STATIC_ASSETS = [
  '/',
  '/chat',
  '/pantry',
  '/recipes',
  '/tools',
  '/saved-recipes',
  '/profile',
  '/about',
  '/manifest.json',
  '/favicon.svg',
  '/MixandMunch_LOGO.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes - always fetch fresh
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // For navigation requests, return cached home page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Handle background sync for saved recipes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-recipes') {
    console.log('[SW] Syncing recipes...');
  }
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Mix & Munch';
  const options = {
    body: data.body || 'New recipe recommendation!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
