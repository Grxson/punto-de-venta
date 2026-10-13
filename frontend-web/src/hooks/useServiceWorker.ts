import { useEffect, useState } from 'react';

/**
 * OPTIMIZACIÓN PASO 2.7: registro del Service Worker.
 *
 * Registra el Service Worker, avisa cuando hay una nueva versión y revisa
 * actualizaciones cada hora. No recibe argumentos ni devuelve valor.
 */
export function useServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers no soportados en este navegador');
      return undefined;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/sw.js',
          { scope: '/' }
        );


        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              
              // Mostrar notificación al usuario
              if (window.confirm('Nueva versión disponible. ¿Recargar?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Manejar cambios en la conexión
        registration.addEventListener('controllerchange', () => {
        });
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    };

    // Registrar al montar
    registerServiceWorker();

    // Buscar actualizaciones cada hora
    const updateCheckInterval = setInterval(async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach(reg => reg.update());
      } catch (error) {
        console.error('Error buscando actualizaciones:', error);
      }
    }, 60 * 60 * 1000); // Cada hora

    return () => clearInterval(updateCheckInterval);
  }, []);
}

/**
 * Indica si el navegador tiene conexión a Internet.
 *
 * @returns `true` cuando el equipo está `online` y `false` cuando está `offline`.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
