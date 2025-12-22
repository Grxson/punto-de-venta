import { useCallback, useRef } from 'react';

interface CachedReport {
  data: any;
  timestamp: number;
}

const CACHE_TTL = {
  RESUMEN: 5 * 60 * 1000,      // 5 minutos
  PRODUCTOS: 5 * 60 * 1000,     // 5 minutos
  GASTOS: 10 * 60 * 1000,       // 10 minutos
  VENTAS: 15 * 60 * 1000,       // 15 minutos
};

export const useReportsCache = () => {
  const cache = useRef<Map<string, CachedReport>>(new Map());

  /**
   * Generar clave única para caché
   */
  const getCacheKey = (type: string, desde: string, hasta: string) => {
    return `${type}_${desde}_${hasta}`;
  };

  /**
   * Obtener data de caché si existe y es fresca
   */
  const getFromCache = useCallback(
    (type: string, desde: string, hasta: string) => {
      const key = getCacheKey(type, desde, hasta);
      const cached = cache.current.get(key);

      if (!cached) {
        console.log(`❌ Cache MISS: ${key}`);
        return null;
      }

      const ttl = CACHE_TTL[type as keyof typeof CACHE_TTL] || CACHE_TTL.VENTAS;
      const isExpired = Date.now() - cached.timestamp > ttl;

      if (isExpired) {
        console.log(`⏰ Cache EXPIRADO: ${key} (${ttl / 1000}s ago)`);
        cache.current.delete(key);
        return null;
      }

      console.log(`✅ Cache HIT: ${key}`);
      return cached.data;
    },
    []
    );

    /**
     * Guardar data en caché
   */
  const setInCache = useCallback((type: string, desde: string, hasta: string, data: any) => {
    const key = getCacheKey(type, desde, hasta);
    const ttlMs = CACHE_TTL[type as keyof typeof CACHE_TTL] || CACHE_TTL.VENTAS;
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log(`💾 Cache SET: ${key} (TTL: ${ttlMs / 1000}s)`);
  }, []);

  /**
   * Invalidar caché de un tipo específico
   */
  const invalidateType = useCallback((type: string) => {
    const keysToDelete = Array.from(cache.current.keys()).filter(k => k.startsWith(type));
    keysToDelete.forEach(k => {
      cache.current.delete(k);
      console.log(`🗑️ Cache INVALIDATED: ${k}`);
    });
  }, []);

  /**
   * Invalidar TODO el caché
   */
  const clearAll = useCallback(() => {
    const count = cache.current.size;
    cache.current.clear();
    console.log(`🗑️ Cache CLEARED (${count} items)`);
  }, []);

  /**
   * Obtener estadísticas del caché (para debugging)
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
