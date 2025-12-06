/**
 * Tipos para Sucursal
 */

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearSucursalRequest {
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

export interface EditarSucursalRequest {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface SucursalFiltros {
  activo?: boolean;
}
