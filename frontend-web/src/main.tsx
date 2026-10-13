import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './config/queryClient'
import { MOCKS_ENABLED } from './mocks/config.ts'
import { registerSW } from 'virtual:pwa-register'
// IMPORTANTE: Importar Emotion CSS antes que nada para asegurar su inicialización
import '@emotion/react'
import './index.css'
import App from './App.tsx'

// PWA: al detectar nueva versión, ofrecer recargar.
// Evita que una pestaña abierta quede con chunks viejos que el deploy ya borró
// (síntoma: "Failed to fetch dynamically imported module ... MIME type text/html")
registerSW({
  immediate: true,
  onNeedRefresh() {
    if (window.confirm('Nueva versión disponible. ¿Recargar ahora?')) {
      window.location.reload();
    }
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

/**
 * Activa MSW antes de renderizar para que las peticiones iniciales de la app
 * ya estén interceptadas. En modo API (`dev:api`/`dev`) no hace nada.
 */
async function enableMocking(): Promise<void> {
  if (!MOCKS_ENABLED) {
    return
  }
  const { startMockWorker } = await import('./mocks/browser.ts')
  await startMockWorker()
}

enableMocking()
  .catch((error) => {
    console.error('[mocks] No se pudo iniciar MSW; se arranca sin interceptación:', error)
  })
  .finally(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </StrictMode>,
    )
  })
