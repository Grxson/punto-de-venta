/**
 * OPTIMIZACIÓN PASO 2.7: Service Worker con Workbox
 * 
 * Estrategia de caché para PWA:
 * 1. Assets estáticos (JS, CSS, fonts): Cache first
 * 2. Imágenes: Cache first
 * 3. API requests: Network first, fallback a caché
 * 4. HTML: Stale while revalidate
 */

/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Precache los archivos manifesto de Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// ============================================
// Estrategia 1: Assets estáticos (JS, CSS, fonts)
// Cache first
// ============================================
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets-v1',
  })
);

// ============================================
// Estrategia 2: Imágenes
// Cache first
// ============================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
  })
);

// ============================================
// Estrategia 3: API requests
// Network first con fallback a caché
// ============================================
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v1',
  })
);

// ============================================
// Estrategia 4: HTML
// Stale while revalidate
// ============================================
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'html-cache-v1',
  })
);

// ============================================
// Manejar mensajes desde el cliente
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker registrado correctamente');
