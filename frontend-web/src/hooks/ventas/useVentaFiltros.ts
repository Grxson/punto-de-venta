import { useState, useCallback, useMemo } from 'react';
import type { Venta } from './useVentas';
import type { DateRangeValue } from '../../../types/dateRange.types';

/**
 * Hook para filtrar ventas por fecha y otros criterios
 * 
 * @example
 * const { ventasFiltradas, dateRange, setDateRange, diaSeleccionado, ... } = useVentaFiltros(ventas);
 */
export function useVentaFiltros(ventas: Venta[]) {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  const [diaSeleccionado, setDiaSeleccionado] = useState(0);

  const ventasFiltradas = useMemo(() => {
    const desde = new Date(dateRange.desde);
    const hasta = new Date(dateRange.hasta);
    hasta.setHours(23, 59, 59, 999);

    if (diaSeleccionado !== 0) {
      const hoy = new Date();
      const diaBuscado = new Date(hoy.getTime() + diaSeleccionado * 24 * 60 * 60 * 1000);
      const inicioDelDia = new Date(diaBuscado.getFullYear(), diaBuscado.getMonth(), diaBuscado.getDate());
      const finDelDia = new Date(inicioDelDia.getTime() + 24 * 60 * 60 * 1000 - 1);

      return ventas.filter((venta) => {
        const ventaFecha = new Date(venta.fecha);
        return ventaFecha >= inicioDelDia && ventaFecha <= finDelDia;
      });
    }

    return ventas.filter((venta) => {
      const ventaFecha = new Date(venta.fecha);
      return ventaFecha >= desde && ventaFecha <= hasta;
    });
  }, [ventas, dateRange, diaSeleccionado]);

  const handleDateRangeChange = useCallback((newRange: DateRangeValue) => {
    setDateRange(newRange);
    setDiaSeleccionado(0);
  }, []);

  const handleCambiarDia = useCallback((dias: number) => {
    setDiaSeleccionado(dias);
  }, []);

  return {
    ventasFiltradas,
    dateRange,
    setDateRange: handleDateRangeChange,
    diaSeleccionado,
    handleCambiarDia,
  };
}
