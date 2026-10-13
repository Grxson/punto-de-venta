import { useState, useCallback, useRef } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

/** Venta devuelta por la API, con sus totales e ítems asociados. */
interface Venta {
  /** Identificador de la venta. */
  id: number;
  /** Id de la sucursal donde se realizó. */
  sucursalId?: number;
  /** Nombre de la sucursal donde se realizó. */
  sucursalNombre?: string;
  /** Fecha de la venta. */
  fecha: string;
  /** Importe antes de impuestos y descuentos. */
  subtotal: number;
  /** Importe total de la venta. */
  total: number;
  /** Impuestos aplicados. */
  impuestos: number;
  /** Descuento aplicado. */
  descuento: number;
  /** Canal de venta (por ejemplo, mostrador). */
  canal: string;
  /** Estado de la venta. */
  estado: string;
  /** Nota asociada a la venta. */
  nota?: string;
  /** Id del usuario que registró la venta. */
  usuarioId?: number;
  /** Nombre del usuario que registró la venta. */
  usuarioNombre?: string;
  /** Ítems vendidos. */
  items: any[];
  /** Pagos aplicados a la venta. */
  pagos: any[];
}

/** Entrada de `cache` con un conjunto de ventas y su paginación. */
interface SalesCacheEntry {
  /** Ventas almacenadas en la entrada. */
  data: Venta[];
  /** Marca de tiempo de cuándo se guardó. */
  timestamp: number;
  /** Número de la primera página cacheada. */
  page: number;
  /** Tamaño de página usado en la consulta. */
  size: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, SalesCacheEntry>();

/**
 * Cachea ventas para evitar peticiones innecesarias.
 *
 * Características:
 * - Cachea ventas por período de tiempo
 * - Invalida el `cache` automáticamente después de 5 minutos
 * - Carga las páginas de forma secuencial para evitar condiciones de carrera
 * - Idempotente: ignora llamadas mientras hay una carga en progreso
 *
 * @returns Objeto con `allSales`, `loading`, `error`, `loadAllSales`, `invalidateCache`, `clearAllCache` y `hasLoaded`.
 */
export function useSalesCache() {
  const [allSales, setAllSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔒 Control de cargas
  const isLoadingRef = useRef(false);
  const lastLoadTimestampRef = useRef<number>(0);

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
   * Cargar todas las ventas en múltiples páginas (SECUENCIAL)
   * Idempotente: ignora llamadas simultáneas
   * 📅 Filtra por rango de fechas (por defecto, hoy)
   */
  const loadAllSales = useCallback(async (dateRange?: { desde: string; hasta: string }) => {
    // 🔒 Evitar múltiples cargas simultáneas (idempotencia)
    if (isLoadingRef.current) {
      return allSales;
    }

    // Timeout de seguridad: si la carga toma más de 30 segundos, cancelarla
    const loadTimeoutId = setTimeout(() => {
      console.error('⏱️ TIMEOUT: Carga de ventas tardó demasiado (>30s), cancelando...');
      isLoadingRef.current = false;
      // ⚠️ NO llamar setLoading(false) aquí - el componente lo maneja
      setError('Timeout cargando ventas');
    }, 30000);

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(dateRange);

      // Verificar si existe en caché y si sigue siendo válido
      if (cache.has(cacheKey)) {
        const entry = cache.get(cacheKey)!;
        const now = Date.now();
        if (now - entry.timestamp < CACHE_DURATION) {
          // ⚠️ IMPORTANTE: No llamar setLoading(false) aquí
          // El componente es responsable de manejar el estado loading
          // Mantener el spinner visible hasta que setVentas() complete
          // Solo retornar los datos para que se procesen en loadVentas()
          isLoadingRef.current = false;
          clearTimeout(loadTimeoutId);
          return entry.data;
        }
        cache.delete(cacheKey);
      }

      const allSalesData: Venta[] = [];
      let page = 0;
      const pageSize = 50;
      let hasMorePages = true;

      // Construir URL con parámetros de fecha
      const buildUrl = (pageNum: number) => {
        let url = `${API_ENDPOINTS.SALES}?page=${pageNum}&size=${pageSize}`;
        if (dateRange?.desde) url += `&desde=${dateRange.desde}`;
        if (dateRange?.hasta) url += `&hasta=${dateRange.hasta}`;
        return url;
      };

      // Cargar páginas de forma SECUENCIAL
      while (hasMorePages) {
        try {
          const response = await apiService.get(buildUrl(page));

          if (response.success && response.data) {
            const pageData = response.data;
            if (Array.isArray(pageData) && pageData.length > 0) {
              allSalesData.push(...pageData);
              
              if (pageData.length < pageSize) {
                hasMorePages = false;
              } else {
                page++;
              }
            } else {
              hasMorePages = false;
            }
          } else {
            // 🔴 Error en la respuesta
            const errorMsg = response.error || 'Error desconocido';
            console.error(`❌ Error en página ${page}:`, errorMsg);
            setError(errorMsg);
            throw new Error(errorMsg);
          }
        } catch (err: any) {
          // 🔴 Si falla la página 0, detener todo
          if (page === 0) {
            console.error(`❌ Error crítico en página 0 (primera carga):`, err.message);
            throw err; // Re-lanzar para que se maneje en el catch externo
          }
          // Si falla una página posterior, terminar carga con los datos que tenemos
          console.error(`⚠️ Error en página ${page}, terminando carga con datos parciales:`, err.message);
          hasMorePages = false;
        }
      }


      // 🔄 Delay mínimo para asegurar que el usuario vea el spinner (UX)
      await new Promise(resolve => setTimeout(resolve, 500));

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

      return allSalesData;
    } catch (err: any) {
      const errorMsg = err.message || 'Error de conexión';
      console.error('❌ Error en loadAllSales:', errorMsg);
      setError(errorMsg);
      // 🔴 IMPORTANTE: No retornar array vacío si hay error
      // Retornar el array previo o null para que el componente sepa que hubo error
      return null;
    } finally {
      clearTimeout(loadTimeoutId);
      isLoadingRef.current = false;
      // ⚠️ NO llamar setLoading(false) aquí
      // El componente es responsable de manejar el estado loading completamente
      // Esto asegura que el spinner se muestre mientras se actualiza la UI
    }
  }, [getCacheKey]);

  /**
   * Invalidar caché manualmente
   */
  const invalidateCache = useCallback((dateRange?: { desde: string; hasta: string }) => {
    const cacheKey = getCacheKey(dateRange);
    cache.delete(cacheKey);
    cache.delete('all-sales');
  }, [getCacheKey]);

  /**
   * Limpiar todo el caché
   */
  const clearAllCache = useCallback(() => {
    cache.clear();
    setAllSales([]);
  }, []);

  return {
    allSales,
    loading,
    error,
    loadAllSales,
    invalidateCache,
    clearAllCache,
    hasLoaded: allSales.length > 0,
  };
}
