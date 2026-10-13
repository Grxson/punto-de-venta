import { useCallback, useRef, useEffect } from 'react';

/**
 * OPTIMIZACIÓN PASO 2.6: agrupación de peticiones (Request Batching).
 *
 * Agrupa múltiples peticiones idénticas en una sola y evita peticiones
 * simultáneas al mismo endpoint.
 *
 * Ejemplo:
 * const batchFetch = useRequestBatching();
 * const resultado1 = batchFetch(() => fetch('/api/productos/1'));
 * const resultado2 = batchFetch(() => fetch('/api/productos/2'));
 * // Las dos peticiones se combinan en una
 */

/** Petición en curso registrada dentro de un batch. */
interface BatchRequest<T> {
  /** Clave que identifica la petición. */
  key: string;
  /** Promesa asociada a la petición. */
  promise: Promise<T>;
  /** Marca de tiempo de creación. */
  timestamp: number;
}

interface BatchConfig {
  /** Tiempo de espera para agrupar peticiones, en milisegundos. */
  delay?: number; // Tiempo de espera para agrupar requests (ms)
  /** Máximo de peticiones a agrupar. */
  maxSize?: number; // Máximo de requests a agrupar
  /** Tiempo de vida del resultado cacheado, en milisegundos. */
  ttl?: number; // Tiempo de vida de la batched request (ms)
}

const defaultConfig: BatchConfig = {
  delay: 10, // 10ms para agrupar requests
  maxSize: 10, // Máximo 10 requests por batch
  ttl: 5 * 60 * 1000, // 5 minutos de caché para resultados
};

/**
 * Agrupa y deduplica peticiones con `cache` temporal por clave.
 *
 * @param config - Ajustes opcionales de `delay`, `maxSize` y `ttl`; se combinan con los valores por defecto.
 * @returns Función `batchFetch(requestFn, key?)` que ejecuta la petición reutilizando el `cache` o el batch activo.
 */
export function useRequestBatching(config: BatchConfig = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  const batchMap = useRef<Map<string, BatchRequest<any>>>(new Map());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
 * Deduplica peticiones idénticas: cualquier petición repetida dentro del
 * tiempo `ttl` reutiliza el `cache` de la primera.
 *
 * @param ttl - Tiempo de vida en milisegundos del `cache` de peticiones (por defecto 5 minutos).
 * @returns Función `dedupe(requestFn, key)` que ejecuta o reutiliza la petición según su clave.
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
