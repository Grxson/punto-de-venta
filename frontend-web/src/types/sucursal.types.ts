/**
 * Tipos de sucursales.
 */

/** Sucursal (punto de venta físico) del negocio. */
export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  /** `false` equivale a baja lógica. */
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Datos para crear una sucursal. */
export interface CrearSucursalRequest {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

/** Datos de edición de una sucursal; solo se envía lo que cambia. */
export interface EditarSucursalRequest {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

/** Filtros del listado de sucursales. */
export interface SucursalFiltros {
  activo?: boolean;
}
