/**
 * OPTIMIZACIÓN PASO 2.7: Service Worker con Workbox
 * 
 * Estrategia de caché para PWA:
 * 1. Assets estáticos (JS, CSS, fonts): Cache first, revalidate
 * 2. Imágenes: Cache first, expiración de 30 días
 * 3. API requests: Network first, fallback a caché
 * 4. HTML: Network first con timeout
 */

/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
} from 'workbox-strategies';
import { CacheExpiration } from 'workbox-expiration';
import { Queue } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache los archivos manifesto de Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// ============================================
// Estrategia 1: Assets estáticos (JS, CSS, fonts)
// Cache first, actualizarse en background
// ============================================
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new CacheExpiration({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
);

// ============================================
// Estrategia 2: Imágenes
// Cache first con expiración
// ============================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new CacheExpiration({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      }),
    ],
  })
);

// ============================================
// Estrategia 3: API requests
// Network first con fallback a caché
// ============================================
const apiQueue = new Queue('api-queue');

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache-v1',
    networkTimeoutSeconds: 5, // Timeout de 5 segundos
    plugins: [
      new CacheExpiration({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
);

// Manejar fallos de request en background
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// Estrategia 4: HTML
// Network first con timeout
// ============================================
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheExpiration({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 día
      }),
    ],
  })
);

// ============================================
// Offline fallback
// ============================================
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'POST' || event.request.method === 'PUT') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Encolar request para reintentarlo cuando haya conexión
        return apiQueue.pushRequest({ request: event.request });
      })
    );
  }
});

// Sincronización en background para requests pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'api-queue') {
    event.waitUntil(apiQueue.replayRequests());
  }
});

console.log('Service Worker registrado correctamente');
