import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Asegurar que sockjs-client funcione correctamente
    },
  },
  // Configuración para producción
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar sourcemaps en producción para reducir tamaño
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
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
