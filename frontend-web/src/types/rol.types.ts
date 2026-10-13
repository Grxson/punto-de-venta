/**
 * Tipos del módulo de roles.
 */

/** Rol del sistema y sus permisos asociados. */
export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  permisos?: Permiso[];
  createdAt?: string;
  updatedAt?: string;
}

/** Permiso atómico asignable a un rol. */
export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
}

/** Datos para crear un rol. */
export interface CrearRolRequest {
  nombre: string;
  descripcion?: string;
  /** IDs de los permisos a conceder; sustituye al conjunto completo. */
  permisoIds?: number[];
}

/** Datos para editar un rol; `permisoIds` reemplaza la asignación previa. */
export interface EditarRolRequest {
  nombre: string;
  descripcion?: string;
  permisoIds?: number[];
}

/** Filtros de búsqueda del listado de roles. */
export interface RolFiltros {
  busqueda?: string;
  activo?: boolean;
}
