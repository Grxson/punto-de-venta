import { useState, useCallback, useRef } from 'react';
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
 * - Carga de forma secuencial para evitar condiciones de carrera
 * - Idempotente: ignora llamadas mientras hay una carga en progreso
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
      console.log('⏳ Ya hay una carga en progreso, ignorando nueva solicitud');
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
          console.log('📦 Usando caché válido para:', cacheKey);
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

      console.log('🔄 Iniciando carga de ventas desde el backend...', { desde: dateRange?.desde, hasta: dateRange?.hasta });
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
          console.log(`  📡 Solicitando página ${page}...`);
          const response = await apiService.get(buildUrl(page));

          if (response.success && response.data) {
            const pageData = response.data;
            if (Array.isArray(pageData) && pageData.length > 0) {
              allSalesData.push(...pageData);
              console.log(`  ✓ Página ${page}: ${pageData.length} registros`);
              
              if (pageData.length < pageSize) {
                hasMorePages = false;
              } else {
                page++;
              }
            } else {
              console.log(`  ℹ️ Página ${page} vacía, finalizando carga`);
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

      console.log(`✅ Carga completada: ${allSalesData.length} ventas totales`);

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
    console.log('🔄 Caché invalidado');
  }, [getCacheKey]);

  /**
   * Limpiar todo el caché
   */
  const clearAllCache = useCallback(() => {
    cache.clear();
    setAllSales([]);
    console.log('🗑️ Caché limpiado');
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
