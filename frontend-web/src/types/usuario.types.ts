/**
 * Tipos y interfaces para el módulo de usuarios
 */

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  activo: boolean;
  rol?: Rol;
  rolId?: number;
  rolNombre?: string;
  sucursal?: {
    id: number;
    nombre: string;
  };
  sucursalId?: number;
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password?: string;
  rolId: number;
  sucursalId: number;
}

export interface EditarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password?: string; // Opcional al editar
  rolId: number;
  sucursalId: number;
}

export interface CambiarRolRequest {
  rolId: number;
}

export interface UsuarioFiltros {
  busqueda?: string;
  rolId?: number;
  sucursalId?: number;
  activo?: boolean;
}
