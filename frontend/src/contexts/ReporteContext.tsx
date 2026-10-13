import React, { createContext, useState, useCallback, useEffect } from 'react';
import { ReporteContextType, ReporteDTO, KPIAdmin } from '../types/reportes';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api/axiosInstance';

/**
 * Contexto de reportes de ventas, gastos y ganancias.
 */
export const ReporteContext = createContext<ReporteContextType | undefined>(undefined);

/**
 * Proveedor de los reportes y KPIs.
 *
 * El alcance de los datos depende del rol: un administrador recibe el reporte
 * general, el desglose por sucursal y los KPIs; el resto de usuarios solo
 * obtiene su reporte personal.
 *
 * @param props.children Subárbol que consume el contexto.
 * @returns El proveedor con el valor de estado y acciones.
 */
export function ReporteProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [reporteGeneral, setReporteGeneral] = useState<ReporteDTO | null>(null);
  const [reportesPorSucursal, setReportesPorSucursal] = useState<Map<number, ReporteDTO>>(
    new Map()
  );
  const [kpis, setKpis] = useState<KPIAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoy = new Date();
  const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [fechaInicio, setFechaInicio] = useState<Date>(hace30Dias);
  const [fechaFin, setFechaFin] = useState<Date>(hoy);
  const [sucursalFiltro, setSucursalFiltro] = useState<number | null>(null);

  // El backend espera fechas en formato ISO (yyyy-MM-dd), por eso se recorta
  // la marca de tiempo en lugar de enviar el `toISOString()` completo.
  const cargarReportes = useCallback(async () => {
    try {
      setIsLoading(true);
      const inicioStr = fechaInicio.toISOString().split('T')[0];
      const finStr = fechaFin.toISOString().split('T')[0];

      if (isAdmin) {
        // Cargar en paralelo para admin
        const [generalRes, porSucursalRes, kpisRes] = await Promise.all([
          apiClient.get<ReporteDTO>('/reportes/general', {
            params: { inicio: inicioStr, fin: finStr },
          }),
          apiClient.get<Record<number, ReporteDTO>>('/reportes/por-sucursal', {
            params: { inicio: inicioStr, fin: finStr },
          }),
          apiClient.get<KPIAdmin>('/reportes/kpis', {
            params: { inicio: inicioStr, fin: finStr },
          }),
        ]);

        setReporteGeneral(generalRes.data);
        const mapa = new Map(Object.entries(porSucursalRes.data).map(([k, v]) => [+k, v]));
        setReportesPorSucursal(mapa);
        setKpis(kpisRes.data);
      } else {
        // Solo reporte personal para usuarios regulares
        const response = await apiClient.get<ReporteDTO>('/reportes/por-fecha', {
          params: { inicio: inicioStr, fin: finStr },
        });
        setReporteGeneral(response.data);
        setReportesPorSucursal(new Map());
        setKpis(null);
      }

      setError(null);
    } catch (err) {
      setError('Error cargando reportes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fechaInicio, fechaFin, isAdmin]);

  const setFechas = useCallback((inicio: Date, fin: Date) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
  }, []);

  /**
   * Resuelve el reporte que corresponde a los filtros activos.
   *
   * Para un administrador con filtro de sucursal devuelve el reporte de esa
   * sucursal; en cualquier otro caso devuelve el reporte general.
   *
   * @returns El reporte vigente o `null` si aún no se ha cargado.
   */
  const obtenerReporteActual = useCallback((): ReporteDTO | null => {
    if (!isAdmin) return reporteGeneral;
    if (sucursalFiltro) return reportesPorSucursal.get(sucursalFiltro) || null;
    return reporteGeneral;
  }, [isAdmin, sucursalFiltro, reporteGeneral, reportesPorSucursal]);

  // Cargar reportes cuando cambien fechas
  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin, cargarReportes]);

  const value: ReporteContextType = {
    reporteGeneral,
    reportesPorSucursal,
    kpis,
    isLoading,
    error,
    fechaInicio,
    fechaFin,
    sucursalFiltro,
    cargarReportes,
    setFechas,
    setSucursalFiltro,
    obtenerReporteActual,
  };

  return <ReporteContext.Provider value={value}>{children}</ReporteContext.Provider>;
}
