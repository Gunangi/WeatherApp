// Service Worker for WeatherApp
// Version 1.0.0

const CACHE_NAME = 'weather-app-v1.0.0';
const DATA_CACHE_NAME = 'weather-data-v1.0.0';
const NOTIFICATION_CACHE_NAME = 'weather-notifications-v1.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/android-chrome-192x192.png',
    '/icons/android-chrome-512x512.png',
    '/icons/apple-touch-icon.png',
    '/icons/favicon-32x32.png',
    '/icons/favicon-16x16.png',
    '/offline.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// API endpoints to cache
const API_CACHE_URLS = [
    '/api/weather/current',
    '/api/weather/forecast',
    '/api/weather/hourly',
    '/api/air-quality',
    '/api/weather/alerts',
    '/api/locations/search'
];

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
    STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
    API: 30 * 60 * 1000, // 30 minutes
    IMAGES: 24 * 60 * 60 * 1000, // 24 hours
    FALLBACK: 5 * 60 * 1000 // 5 minutes
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME &&
                        cacheName !== DATA_CACHE_NAME &&
                        cacheName !== NOTIFICATION_CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // Handle static assets
    event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Clone the response before caching
            const responseClone = networkResponse.clone();

            // Cache successful API responses
            const cache = await caches.open(DATA_CACHE_NAME);
            await cache.put(request, responseClone);

            return networkResponse;
        }

        throw new Error(`Network response not ok: ${networkResponse.status}`);
    } catch (error) {
        console.log('[ServiceWorker] Fetch failed, returning cached data:', error);

        // Try to get from cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            // Check if cached data is still valid
            const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
            const now = new Date();
            const age = now.getTime() - cachedDate.getTime();

            if (age < CACHE_DURATIONS.API) {
                return cachedResponse;
            }
        }

        // Return fallback response for critical API endpoints
        return getFallbackApiResponse(url.pathname);
    }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Return cached app shell
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/');

        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback to offline page
        return cache.match('/offline.html');
    }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Check if we should update the cache in background
        updateCacheInBackground(request, cache);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache new static assets
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Static asset fetch failed:', error);

        // Return fallback for images
        if (request.destination === 'image') {
            return getFallbackImage();
        }

        throw error;
    }
}

// Update cache in background for performance
async function updateCacheInBackground(request, cache) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        // Silently fail background updates
        console.log('[ServiceWorker] Background update failed:', error);
    }
}

// Get fallback API response for offline scenarios
function getFallbackApiResponse(pathname) {
    const fallbackData = {
        '/api/weather/current': {
            error: 'offline',
            message: 'Weather data unavailable offline',
            location: { city: 'Unknown', country: 'Unknown' },
            temperature: null,
            condition: 'Unknown',
            timestamp: Date.now()
        },
        '/api/weather/forecast': {
            error: 'offline',
            message: 'Forecast data unavailable offline',
            forecast: []
        },
        '/api/air-quality': {
            error: 'offline',
            message: 'Air quality data unavailable offline',
            aqi: null
        }
    };

    const data = fallbackData[pathname] || {
        error: 'offline',
        message: 'Data unavailable offline'
    };

    return new Response(JSON.stringify(data), {
        status: 200,
        statusText: 'OK (Offline)',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    });
}

// Get fallback image for broken image requests
function getFallbackImage() {
    // Return a simple 1x1 transparent pixel
    const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Uint8Array.from(atob(pixel), c => c.charCodeAt(0));

    return new Response(buffer, {
        status: 200,
        statusText: 'OK',
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'max-age=86400'
        }
    });
}

// Background sync for sending queued data
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'weather-data-sync') {
        event.waitUntil(syncWeatherData());
    } else if (event.tag === 'notification-sync') {
        event.waitUntil(syncNotifications());
    }
});

// Sync weather data when back online
async function syncWeatherData() {
    try {
        // Get any queued weather requests from IndexedDB
        const queuedRequests = await getQueuedRequests();

        for (const request of queuedRequests) {
            try {
                await fetch(request.url, request.options);
                await removeQueuedRequest(request.id);
            } catch (error) {
                console.log('[ServiceWorker] Failed to sync request:', error);
            }
        }
    } catch (error) {
        console.log('[ServiceWorker] Background sync failed:', error);
    }
}

// Sync notifications
async function syncNotifications() {
    try {
        const queuedNotifications = await getQueuedNotifications();

        for (const notification of queuedNotifications) {
            await self.registration.showNotification(notification.title, notification.options);
            await removeQueuedNotification(notification.id);
        }
    } catch (error) {
        console.log('[ServiceWorker] Notification sync failed:', error);
    }
}

// Push event for push notifications
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');

    let notificationData = {
        title: 'Weather Alert',
        body: 'New weather information available',
        icon: '/icons/android-chrome-192x192.png',
        badge: '/icons/weather-badge-72x72.png',
        tag: 'weather-alert',
        requireInteraction: false,
        actions: [
            {
                action: 'view',
                title: 'View Details',
                icon: '/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/action-dismiss.png'
            }
        ],
        data: {
            url: '/',
            timestamp: Date.now()
        }
    };

    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.log('[ServiceWorker] Error parsing push data:', error);
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            actions: notificationData.actions,
            data: notificationData.data,
            vibrate: [200, 100, 200]
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked:', event.notification.tag);

    event.notification.close();

    const action = event.action;
    const data = event.notification.data || {};

    if (action === 'dismiss') {
        return;
    }

    // Default action or 'view' action
    const urlToOpen = data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.postMessage({
                            type: 'NOTIFICATION_CLICKED',
                            action: action,
                            data: data
                        });
                        return;
                    }
                }

                // Open new window if app is not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Message event for communication with main app
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);

    const { action, data } = event.data;

    switch (action) {
        case 'skipWaiting':
            self.skipWaiting();
            break;

        case 'clearCache':
            event.waitUntil(clearAllCaches());
            break;

        case 'getCacheSize':
            event.waitUntil(getCacheSize().then(size => {
                event.ports[0].postMessage({ size });
            }));
            break;

        case 'queueRequest':
            event.waitUntil(queueRequest(data));
            break;

        case 'queueNotification':
            event.waitUntil(queueNotification(data));
            break;

        default:
            console.log('[ServiceWorker] Unknown message action:', action);
    }
});

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();

    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Get total cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }

    return totalSize;
}

// Queue request for background sync (simplified - would need IndexedDB in real implementation)
async function queueRequest(requestData) {
    // In a real implementation, this would store in IndexedDB
    console.log('[ServiceWorker] Queuing request for sync:', requestData);
}

// Queue notification for background sync
async function queueNotification(notificationData) {
    // In a real implementation, this would store in IndexedDB
    console.log('[ServiceWorker] Queuing notification for sync:', notificationData);
}

// Get queued requests (simplified)
async function getQueuedRequests() {
    // In a real implementation, this would retrieve from IndexedDB
    return [];
}

// Remove queued request
async function removeQueuedRequest(requestId) {
    // In a real implementation, this would remove from IndexedDB
    console.log('[ServiceWorker] Removing queued request:', requestId);
}

// Get queued notifications
async function getQueuedNotifications() {
    // In a real implementation, this would retrieve from IndexedDB
    return [];
}

// Remove queued notification
async function removeQueuedNotification(notificationId) {
    // In a real implementation, this would remove from IndexedDB
    console.log('[ServiceWorker] Removing queued notification:', notificationId);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('[ServiceWorker] Periodic sync:', event.tag);

    if (event.tag === 'weather-update') {
        event.waitUntil(updateWeatherInBackground());
    }
});

// Update weather data in background
async function updateWeatherInBackground() {
    try {
        // Get user's last known location from cache or storage
        const lastLocation = await getLastKnownLocation();

        if (lastLocation) {
            // Fetch fresh weather data
            const weatherResponse = await fetch(`/api/weather/current?lat=${lastLocation.lat}&lon=${lastLocation.lon}`);

            if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();

                // Check if weather conditions have changed significantly
                const shouldNotify = await checkForSignificantWeatherChange(weatherData);

                if (shouldNotify) {
                    await self.registration.showNotification('Weather Update', {
                        body: `Conditions have changed in ${weatherData.location.city}`,
                        icon: '/icons/android-chrome-192x192.png',
                        badge: '/icons/weather-badge-72x72.png',
                        tag: 'weather-update',
                        data: { weatherData }
                    });
                }
            }
        }
    } catch (error) {
        console.log('[ServiceWorker] Background weather update failed:', error);
    }
}

// Get last known location (simplified)
async function getLastKnownLocation() {
    // In a real implementation, this would retrieve from IndexedDB or cache
    return null;
}

// Check for significant weather changes
async function checkForSignificantWeatherChange(newWeatherData) {
    // In a real implementation, this would compare with previously cached data
    // and determine if changes are significant enough to warrant a notification
    return false;
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('[ServiceWorker] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[ServiceWorker] Unhandled promise rejection:', event.reason);
});

console.log('[ServiceWorker] Service Worker loaded and ready');