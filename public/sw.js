const CACHE_NAME = 'aakb-billing-v1';
const urlsToCache = [
    '/',
    '/login',
    '/bill',
    '/admin',
    '/manifest.json',
    '/logo.png',
    '/globe.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.log('Cache install failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and Supabase API calls
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('supabase.co')) return;
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    // Fetch fresh version in background
                    fetch(event.request).then((freshResponse) => {
                        if (freshResponse && freshResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, freshResponse);
                            });
                        }
                    }).catch(() => { });
                    return response;
                }

                // Fetch from network
                return fetch(event.request).then((response) => {
                    // Cache successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                });
            })
            .catch(() => {
                // Return offline page if available
                return caches.match('/');
            })
    );
});
