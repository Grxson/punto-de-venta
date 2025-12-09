import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api.service';
import type { InventarioMovimientoReporteDTO } from '../types/reportes.types';
import { useAuth } from '../contexts/AuthContext';

interface UseInventarioMovimientoParams {
  fechaInicio?: string; // ISO format: yyyy-MM-dd
  fechaFin?: string;
}

interface UseInventarioMovimientoReturn {
  reporte: InventarioMovimientoReporteDTO | null;
  cargando: boolean;
  error: string | null;
  refetch: (fechaInicio: string, fechaFin: string) => Promise<void>;
}

/**
 * Hook optimizado para obtener reporte de movimiento de inventario.
 * - Caché automático en memoria
 * - Evita requests duplicados
 * - Manejo de errores automático
 */
export const useInventarioMovimiento = (
  params?: UseInventarioMovimientoParams
): UseInventarioMovimientoReturn => {
  const { usuario } = useAuth();
  const [reporte, setReporte] = useState<InventarioMovimientoReporteDTO | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheKey, setCacheKey] = useState<string>('');

  const refetch = useCallback(
    async (fechaInicio: string, fechaFin: string) => {
      if (!usuario) {
        setError('Usuario no autenticado');
        return;
      }

      // Generar clave de caché
      const key = `${usuario.sucursalId}-${fechaInicio}-${fechaFin}`;

      // Si ya tenemos datos en caché, no hacer request
      if (cacheKey === key && reporte) {
        return;
      }

      setCargando(true);
      setError(null);

      try {
        // Convertir a ISO DateTime (agregar hora)
        const fechaInicioFull = `${fechaInicio}T00:00:00`;
        const fechaFinFull = `${fechaFin}T23:59:59`;

        // Construir URL con query parameters
        const queryParams = new URLSearchParams({
          fechaInicio: fechaInicioFull,
          fechaFin: fechaFinFull,
        });

        const response = await apiService.get<InventarioMovimientoReporteDTO>(
          `/api/reportes/inventario-movimiento?${queryParams.toString()}`
        );

        if (response.success && response.data) {
          setReporte(response.data);
          setCacheKey(key);
        } else {
          setError(response.error || 'Error al obtener reporte');
        }
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : 'Error de conexión';
        setError(mensaje);
        console.error('Error en useInventarioMovimiento:', err);
      } finally {
        setCargando(false);
      }
    },
    [usuario, reporte, cacheKey]
  );

  // Cargar datos iniciales si se proporcionan fechas
  useEffect(() => {
    if (params?.fechaInicio && params?.fechaFin) {
      refetch(params.fechaInicio, params.fechaFin);
    }
  }, [params?.fechaInicio, params?.fechaFin, refetch]);

  return {
    reporte,
    cargando,
    error,
    refetch,
  };
};
