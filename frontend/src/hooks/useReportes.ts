import { useContext } from 'react';
import { ReporteContext } from '../contexts/ReporteContext';
import { ReporteContextType } from '../types/reportes';

export function useReportes(): ReporteContextType {
  const context = useContext(ReporteContext);

  if (!context) {
    throw new Error('useReportes debe ser usado dentro de ReporteProvider');
  }

  return context;
}
