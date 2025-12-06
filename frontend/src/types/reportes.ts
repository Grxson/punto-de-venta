export interface VentasResumen {
  total: number;
  cantidad: number;
  promedio: number;
  porCategoria: { [categoria: string]: number };
}

export interface GastosResumen {
  total: number;
  cantidad: number;
  promedio: number;
  porCategoria: { [categoria: string]: number };
}

export interface GananciasResumen {
  neto: number;
  margen: number;
  gananciaPromedioDia: number;
}

export interface ReporteDTO {
  periodo: { inicio: string; fin: string };
  ventas: VentasResumen;
  gastos: GastosResumen;
  ganancias: GananciasResumen;
  detalles: {
    mejorProducto: string;
    productoMenorVenta: string;
    gastoPrincipal: string;
  };
}

export interface KPIAdmin {
  ventasTotales: number;
  gastosTotales: number;
  sucursalMasVendedora: string;
  mejorProducto: string;
  tendencia: 'ARRIBA' | 'ABAJO' | 'ESTABLE';
}

export interface ReporteContextType {
  // Estado
  reporteGeneral: ReporteDTO | null;
  reportesPorSucursal: Map<number, ReporteDTO>;
  kpis: KPIAdmin | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros
  fechaInicio: Date;
  fechaFin: Date;
  sucursalFiltro: number | null;
  
  // Métodos
  cargarReportes: () => Promise<void>;
  setFechas: (inicio: Date, fin: Date) => void;
  setSucursalFiltro: (sucursalId: number | null) => void;
  obtenerReporteActual: () => ReporteDTO | null;
}
