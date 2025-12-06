/**
 * Tipos y interfaces para el módulo de roles
 */

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  permisos?: Permiso[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CrearRolRequest {
  nombre: string;
  descripcion?: string;
  permisoIds?: number[];
}

export interface EditarRolRequest {
  nombre: string;
  descripcion?: string;
  permisoIds?: number[];
}

export interface RolFiltros {
  busqueda?: string;
  activo?: boolean;
}
