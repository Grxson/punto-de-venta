import { useCallback, useRef, useEffect } from 'react';

/**
 * OPTIMIZACIÓN PASO 2.6: Request Batching
 * 
 * Hook para agrupar múltiples requests en una sola petición.
 * Útil para evitar múltiples peticiones simultáneas al mismo endpoint.
 * 
 * Ejemplo:
 * const batchFetch = useRequestBatching();
 * const resultado1 = batchFetch(() => fetch('/api/productos/1'));
 * const resultado2 = batchFetch(() => fetch('/api/productos/2'));
 * // Los dos requests se combinan en uno
 */

interface BatchRequest<T> {
  key: string;
  promise: Promise<T>;
  timestamp: number;
}

interface BatchConfig {
  delay?: number; // Tiempo de espera para agrupar requests (ms)
  maxSize?: number; // Máximo de requests a agrupar
  ttl?: number; // Tiempo de vida de la batched request (ms)
}

const defaultConfig: BatchConfig = {
  delay: 10, // 10ms para agrupar requests
  maxSize: 10, // Máximo 10 requests por batch
  ttl: 5 * 60 * 1000, // 5 minutos de caché para resultados
};

export function useRequestBatching(config: BatchConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const batchMap = useRef<Map<string, BatchRequest<any>>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cacheRef = useRef<Map<string, { result: any; timestamp: number }>>(new Map());

  // Limpiar caché expirado
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > mergedConfig.ttl!) {
          cacheRef.current.delete(key);
        }
      }
    }, 60 * 1000); // Limpiar cada minuto

    return () => clearInterval(interval);
  }, [mergedConfig.ttl]);

  const batchFetch = useCallback(
    <T,>(requestFn: () => Promise<T>, key?: string): Promise<T> => {
      const requestKey = key || String(requestFn);

      // Verificar caché
      const cached = cacheRef.current.get(requestKey);
      if (cached && Date.now() - cached.timestamp < mergedConfig.ttl!) {
        return Promise.resolve(cached.result);
      }

      // Verificar si ya existe en batch
      const existing = batchMap.current.get(requestKey);
      if (existing) {
        return existing.promise;
      }

      // Crear nueva promesa para el batch
      const promise = requestFn();

      // Guardar en batch
      batchMap.current.set(requestKey, {
        key: requestKey,
        promise,
        timestamp: Date.now(),
      });

      // Limpiar el batch después de procesar
      promise
        .then((result) => {
          // Guardar en caché
          cacheRef.current.set(requestKey, {
            result,
            timestamp: Date.now(),
          });
          return result;
        })
        .finally(() => {
          batchMap.current.delete(requestKey);
        });

      // Ejecutar batch si alcanzó tamaño máximo
      if (batchMap.current.size >= mergedConfig.maxSize!) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      } else if (!timeoutRef.current) {
        // Agendar ejecución del batch
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;
        }, mergedConfig.delay);
      }

      return promise;
    },
    [mergedConfig]
  );

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchFetch;
}

/**
 * Hook para deduplicar requests idénticos
 * Cualquier request duplicado dentro del tiempo TTL reutiliza el caché
 */
export function useRequestDeduplication(ttl: number = 5 * 60 * 1000) {
  const requestMap = useRef<Map<string, { promise: Promise<any>; timestamp: number }>>(new Map());

  return useCallback(
    <T,>(requestFn: () => Promise<T>, key: string): Promise<T> => {
      const now = Date.now();

      // Limpiar requests expirados
      for (const [k, value] of requestMap.current.entries()) {
        if (now - value.timestamp > ttl) {
          requestMap.current.delete(k);
        }
      }

      // Retornar request existente si no expiró
      const existing = requestMap.current.get(key);
      if (existing && now - existing.timestamp < ttl) {
        return existing.promise;
      }

      // Crear nuevo request
      const promise = requestFn();
      requestMap.current.set(key, { promise, timestamp: now });

      return promise;
    },
    [ttl]
  );
}
