import { useState, useCallback, useRef, useEffect } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface Venta {
  id: number;
  sucursalId?: number;
  sucursalNombre?: string;
  fecha: string;
  subtotal: number;
  total: number;
  impuestos: number;
  descuento: number;
  canal: string;
  estado: string;
  nota?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  items: any[];
  pagos: any[];
}

interface SalesCacheEntry {
  data: Venta[];
  timestamp: number;
  page: number;
  size: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, SalesCacheEntry>();

/**
 * Hook para cachear ventas y evitar peticiones innecesarias
 * 
 * Características:
 * - Cachea ventas por período de tiempo
 * - Invalida caché automáticamente después de 5 minutos
 * - Permite cargar ventas incrementalmente con paginación
 * - Soporta invalidación manual del caché cuando hay cambios
 */
export function useSalesCache() {
  const [allSales, setAllSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const lastLoadTimestampRef = useRef<number>(0);
  const currentCacheKeyRef = useRef<string>('');

  /**
   * Generar clave de caché única basada en rango de fechas
   */
  const getCacheKey = useCallback((dateRange?: { desde: string; hasta: string }) => {
    if (!dateRange) {
      return 'all-sales';
    }
    return `sales-${dateRange.desde}-${dateRange.hasta}`;
  }, []);

  /**
   * Cargar ventas con paginación
   */
  const loadSalesPage = useCallback(
    async (page: number, size: number, dateRange?: { desde: string; hasta: string }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.get(
          `${API_ENDPOINTS.SALES}?page=${page}&size=${size}`
        );

        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.error || 'Error al cargar ventas');
          return [];
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Error de conexión';
        setError(errorMsg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cargar todas las ventas en múltiples páginas
   */
  const loadAllSales = useCallback(async (dateRange?: { desde: string; hasta: string }) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(dateRange);
      currentCacheKeyRef.useRef = cacheKey;

      // Verificar si existe en caché y si sigue siendo válido
      if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey)!;
        const now = Date.now();
        if (now - entry.timestamp < CACHE_DURATION) {
          // Caché válido, usar datos en caché
          setAllSales(entry.data);
          lastLoadTimestampRef.current = now;
          return entry.data;
        }
        // Caché expirado, eliminar
        cache.delete(cacheKey);
      }

      // No hay caché válido, cargar desde el backend
      const allSalesData: Venta[] = [];
      let page = 0;
      const pageSize = 50;
      let hasMorePages = true;

      while (hasMorePages) {
        const pageData = await loadSalesPage(page, pageSize, dateRange);
        if (pageData.length === 0) {
          hasMorePages = false;
        } else {
          allSalesData.push(...pageData);
          if (pageData.length < pageSize) {
            hasMorePages = false;
          }
          page++;
        }
      }

      // Guardar en caché
      const now = Date.now();
      cache.set(cacheKey, {
        data: allSalesData,
        timestamp: now,
        page: 0,
        size: pageSize,
      });

      setAllSales(allSalesData);
      lastLoadTimestampRef.current = now;
      hasLoadedRef.current = true;

      return allSalesData;
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, loadSalesPage]);

  /**
   * Invalidar caché manualmente (cuando se agrega/edita/cancela una venta)
   */
  const invalidateCache = useCallback((dateRange?: { desde: string; hasta: string }) => {
    const cacheKey = getCacheKey(dateRange);
    cache.delete(cacheKey);
    cache.delete('all-sales'); // También invalidar caché general
    hasLoadedRef.current = false;
  }, [getCacheKey]);

  /**
   * Limpiar todo el caché
   */
  const clearAllCache = useCallback(() => {
    cache.clear();
    hasLoadedRef.current = false;
    setAllSales([]);
  }, []);

  return {
    allSales,
    loading,
    error,
    loadAllSales,
    loadSalesPage,
    invalidateCache,
    clearAllCache,
    hasLoaded: hasLoadedRef.current,
  };
}
