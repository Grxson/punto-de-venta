import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PASO 2.3: Bundle analysis
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    // PASO 2.7: PWA con Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        globIgnores: ['**/stats.html'], // Excluir stats.html del precache
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          // API requests
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v1',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 min
              },
            },
          },
          // Imágenes
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache-v1',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Punto de Venta',
        short_name: 'POS',
        description: 'Sistema de Punto de Venta',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Asegurar que sockjs-client funcione correctamente
    },
  },
  // OPTIMIZACIÓN PASO 2.2: Vite Config mejorado para máximo splitting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar sourcemaps en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.* en producción
        drop_debugger: true, // Eliminar debuggers
      },
    },
    // Optimizar reportCompressedSize para builds más rápidos en dev
    reportCompressedSize: false,
    // Aumentar chunk size limit
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Estrategia de splitting más agresiva
          
          // Vendor libraries
          if (id.includes('node_modules/@mui/')) {
            return 'mui-chunk';
          }
          if (id.includes('node_modules/date-fns/')) {
            return 'date-fns';
          }
          if (id.includes('node_modules/recharts/')) {
            return 'recharts';
          }
          if (id.includes('node_modules/@tanstack/')) {
            return 'react-query';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          
          // Rutas y features
          if (id.includes('/pages/pos/')) {
            return 'pos-pages';
          }
          if (id.includes('/pages/admin/')) {
            return 'admin-pages';
          }
          if (id.includes('/pages/')) {
            return 'pages';
          }
          
          // Servicios y hooks compartidos
          if (id.includes('/services/')) {
            return 'services';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/utils/') || id.includes('/helpers/')) {
            return 'utils';
          }
          
          // Componentes compartidos
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // Optimizar nombres de chunks
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Configuración del servidor de preview (usado por Railway)
  preview: {
    port: 4173,
    host: true, // Escuchar en todas las interfaces
    strictPort: false, // Permitir usar otro puerto si 4173 está ocupado
  },
})
