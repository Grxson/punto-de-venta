import { useContext } from 'react';
import { ReporteContext } from '../contexts/ReporteContext';
import { ReporteContextType } from '../types/reportes';

/**
 * Acceso tipado al contexto de reportes y KPIs.
 *
 * @returns Los reportes, los filtros de fecha y sucursal, y sus acciones.
 * @throws Error si se usa fuera de `ReporteProvider`.
 */
export function useReportes(): ReporteContextType {
  const context = useContext(ReporteContext);

  if (!context) {
    throw new Error('useReportes debe ser usado dentro de ReporteProvider');
  }

  return context;
}
