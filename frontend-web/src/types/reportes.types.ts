/**
 * Tipos para DTOs de reportes del backend.
 */

/**
 * DTO principal de reporte de movimiento de inventario.
 * Estructura dinámica que solo incluye días con operación.
 */
export interface InventarioMovimientoReporteDTO {
  /** Lista de fechas donde hubo operación (sin días vacíos) */
  diasOperacion: string[]; // LocalDate serializado como ISO string (yyyy-MM-dd)

  /** Datos de productos con movimientos por día */
  productos: ProductoInventarioDTO[];
}

/**
 * Información de un producto con sus movimientos diarios.
 */
export interface ProductoInventarioDTO {
  id: number;
  nombre: string;
  /** Mapa de movimientos diarios: fecha -> movimiento */
  datos: Record<string, DiaMovimientoDTO>;
  /** Totales acumulados para todo el período */
  totales: DiaMovimientoDTO;
}

/**
 * Movimientos de un producto en un día específico (o totales).
 */
export interface DiaMovimientoDTO {
  /** Stock inicial del día */
  inicio: number;
  /** Total comprado en el día */
  compra: number;
  /** Total vendido en el día */
  venta: number;
  /** Total de merma en el día */
  merma: number;
  /** Stock final del día */
  queda: number;
}
