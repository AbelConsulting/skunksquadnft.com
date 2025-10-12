// Service Worker for SkunkSquad NFT Website
// Provides offline functionality and caching

const CACHE_NAME = 'skunksquad-nft-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/src/styles/main.css',
    '/src/styles/components.css',
    '/src/styles/animations.css',
    '/src/js/main.js',
    '/src/js/payment.js',
    '/src/js/wallet.js',
    // External resources
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap',
    'https://unpkg.com/web3@latest/dist/web3.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('🦨 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('🦨 Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('🦨 Cache installation failed:', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    console.log('🦨 Service Worker activated');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old cache versions
                            return cacheName.startsWith('skunksquad-nft-') && 
                                   cacheName !== CACHE_NAME;
                        })
                        .map(cacheName => {
                            console.log('🦨 Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
    );
    
    // Take control of all pages immediately
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Only handle same-origin requests and specific external resources
    if (!event.request.url.startsWith(self.location.origin) && 
        !event.request.url.includes('fonts.googleapis.com') &&
        !event.request.url.includes('unpkg.com')) {
        return;
    }
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('🦨 Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise, fetch from network
                console.log('🦨 Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || 
                            networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache successful responses
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('🦨 Fetch failed:', error);
                        
                        // Serve offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('🦨 Background sync triggered:', event.tag);
    
    if (event.tag === 'payment-retry') {
        event.waitUntil(retryFailedPayments());
    }
    
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

// Push notifications for important updates
self.addEventListener('push', event => {
    console.log('🦨 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New SkunkSquad NFT update!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
            url: 'https://skunksquadnft.com'
        },
        actions: [
            {
                action: 'explore',
                title: 'View Collection',
                icon: '/favicon.ico'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/favicon.ico'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('🦨 SkunkSquad NFT', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('🦨 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('https://skunksquadnft.com/#collection')
        );
    } else if (event.action !== 'close') {
        event.waitUntil(
            clients.openWindow('https://skunksquadnft.com')
        );
    }
});

// Utility functions
async function retryFailedPayments() {
    try {
        // Get failed payments from IndexedDB
        const failedPayments = await getFailedPayments();
        
        for (const payment of failedPayments) {
            try {
                // Retry payment processing
                const response = await fetch('/api/retry-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payment)
                });
                
                if (response.ok) {
                    // Remove from failed payments
                    await removeFailedPayment(payment.id);
                    console.log('🦨 Payment retry successful:', payment.id);
                }
            } catch (error) {
                console.error('🦨 Payment retry failed:', error);
            }
        }
    } catch (error) {
        console.error('🦨 Failed to retry payments:', error);
    }
}

async function syncAnalytics() {
    try {
        // Get pending analytics events
        const pendingEvents = await getPendingAnalytics();
        
        if (pendingEvents.length > 0) {
            const response = await fetch('/api/analytics/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: pendingEvents })
            });
            
            if (response.ok) {
                await clearPendingAnalytics();
                console.log('🦨 Analytics sync successful');
            }
        }
    } catch (error) {
        console.error('🦨 Analytics sync failed:', error);
    }
}

// IndexedDB helpers (simplified)
async function getFailedPayments() {
    // Implementation would use IndexedDB
    return [];
}

async function removeFailedPayment(id) {
    // Implementation would use IndexedDB
    console.log('Removing failed payment:', id);
}

async function getPendingAnalytics() {
    // Implementation would use IndexedDB
    return [];
}

async function clearPendingAnalytics() {
    // Implementation would use IndexedDB
    console.log('Clearing pending analytics');
}

// Version update notification
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🦨 SkunkSquad NFT Service Worker loaded');