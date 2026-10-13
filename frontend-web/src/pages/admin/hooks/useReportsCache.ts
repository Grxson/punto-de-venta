import { useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

/** Entrada del caché en memoria con la marca de tiempo de escritura. */
interface CachedReport {
  /** Respuesta cacheada sin transformar. */
  data: any;
  /** `Date.now()` en el momento de guardar; define la vigencia de la entrada. */
  timestamp: number;
}

/**
 * Vigencia por tipo de dato, en milisegundos.
 * @remarks Los gastos cambian poco y el detalle de ventas es el recurso más pesado,
 * de ahí que sus TTL sean mayores.
 */
const CACHE_TTL = {
  RESUMEN: 5 * 60 * 1000,      // 5 minutos
  PRODUCTOS: 5 * 60 * 1000,     // 5 minutos
  GASTOS: 10 * 60 * 1000,       // 10 minutos
  VENTAS: 15 * 60 * 1000,       // 15 minutos
};

export const useReportsCache = () => {
  const { sucursal, usuario } = useAuth();
  const cache = useRef<Map<string, CachedReport>>(new Map());

  /**
   * 🔒 SEGURIDAD CRÍTICA: genera una clave única que incluye el id de sucursal.
   *
   * ✅ Cada sucursal tiene su propia rama de caché, aislada
   * - Usuario 1 (Sucursal A): resumen_1_2025-12-01_2025-12-31
   * - Usuario 2 (Sucursal B): resumen_2_2025-12-01_2025-12-31
   *
   * ❌ Antes (vulnerable a contaminación):
   *   return `${type}_${desde}_${hasta}`;
   *   - Una misma entrada de caché para todas las sucursales
   *   - El usuario B veía los datos del usuario A si cargaban el mismo rango
   *
   * ✅ Ahora (seguro):
   *   return `${type}_${sucursalId}_${desde}_${hasta}`;
   *   - Caché aislado por sucursal
   *   - Imposible la contaminación entre sucursales
   *
   * @param type - Tipo de dato cacheado (RESUMEN, PRODUCTOS, GASTOS, VENTAS).
   * @param desde - Fecha inicial del rango consultada.
   * @param hasta - Fecha final del rango consultada.
   * @returns Clave de caché única por sucursal, tipo y rango de fechas.
   */
  const getCacheKey = (type: string, desde: string, hasta: string) => {
    const sucursalId = sucursal?.id || usuario?.sucursalId || 'unknown';
    return `${type}_${sucursalId}_${desde}_${hasta}`;
  };

  /**
   * Devuelve los datos de caché si existen y siguen vigentes.
   * @remarks Si la entrada expiró, se elimina antes de devolver `null`.
   * @param type - Tipo de dato cacheado.
   * @param desde - Fecha inicial del rango.
   * @param hasta - Fecha final del rango.
   * @returns Los datos cacheados, o `null` si no existen o expiraron.
   */
  const getFromCache = useCallback(
    (type: string, desde: string, hasta: string) => {
      const key = getCacheKey(type, desde, hasta);
      const cached = cache.current.get(key);

      if (!cached) {
        return null;
      }

      const ttl = CACHE_TTL[type as keyof typeof CACHE_TTL] || CACHE_TTL.VENTAS;
      const isExpired = Date.now() - cached.timestamp > ttl;

      if (isExpired) {
        cache.current.delete(key);
        return null;
      }

      return cached.data;
    },
    []
    );

  /**
   * Guarda los datos en el caché en memoria con su marca de tiempo.
   * @param type - Tipo de dato cacheado.
   * @param desde - Fecha inicial del rango.
   * @param hasta - Fecha final del rango.
   * @param data - Datos a cachear.
   */
  const setInCache = useCallback((type: string, desde: string, hasta: string, data: any) => {
    const key = getCacheKey(type, desde, hasta);
    const ttlMs = CACHE_TTL[type as keyof typeof CACHE_TTL] || CACHE_TTL.VENTAS;
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Borra todas las entradas de un tipo, sin importar el rango de fechas.
   * @remarks Se usa tras registrar un gasto o una venta para forzar la recarga.
   * @param type - Tipo de dato a invalidar.
   */
  const invalidateType = useCallback((type: string) => {
    const keysToDelete = Array.from(cache.current.keys()).filter(k => k.startsWith(type));
    keysToDelete.forEach(k => {
      cache.current.delete(k);
    });
  }, []);

  /**
   * Vacía por completo el caché en memoria.
   */
  const clearAll = useCallback(() => {
    const count = cache.current.size;
    cache.current.clear();
  }, []);

  /**
   * Devuelve claves, antigüedad y tamaño de cada entrada, para depurar el caché.
   * @returns Objeto con el total de entradas y el detalle de cada una.
   */
  const getStats = useCallback(() => {
    const stats = {
      totalItems: cache.current.size,
      items: Array.from(cache.current.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        size: JSON.stringify(value.data).length,
      })),
    };
    return stats;
  }, []);

  return {
    getFromCache,
    setInCache,
    invalidateType,
    clearAll,
    getCacheKey,
    getStats,
  };
};
