/**
 * Tipos e interfaces del módulo de usuarios.
 */

/** Usuario del sistema tal como lo devuelve la API. */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  /** `false` equivale a baja lógica: el registro se conserva pero no puede iniciar sesión. */
  activo: boolean;
  /** Rol incrustado; presente solo cuando la consulta incluye la relación. */
  rol?: Rol;
  rolId?: number;
  /** Nombre del rol desnormalizado, para pintar listados sin segunda petición. */
  rolNombre?: string;
  /** Sucursal en la que el usuario opera; delimita el alcance de sus ventas. */
  sucursal?: {
    id: number;
    nombre: string;
  };
  sucursalId?: number;
  /** Marca de tiempo ISO de la última entrada al sistema. */
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Rol con el conjunto de permisos que otorga. */
export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  /** Permisos efectivos; se rellenan solo cuando se solicitan explícitamente. */
  permisos?: Permiso[];
  createdAt?: string;
  updatedAt?: string;
}

/** Permiso atómico que se asigna a un rol. */
export interface Permiso {
  id: number;
  nombre: string;
  descripcion?: string;
}

/** Datos necesarios para dar de alta un usuario. */
export interface CrearUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  /** Opcional: si se omite, el backend genera una contraseña temporal. */
  password?: string;
  rolId: number;
  sucursalId: number;
}

/** Datos de edición de un usuario; `password` solo se aplica si se envía. */
export interface EditarUsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  password?: string; // Opcional al editar
  rolId: number;
  sucursalId: number;
}

/** Payload del cambio de rol de un usuario. */
export interface CambiarRolRequest {
  rolId: number;
}

/** Filtros de búsqueda del listado de usuarios. */
export interface UsuarioFiltros {
  /** Búsqueda libre sobre nombre, apellido, email y username. */
  busqueda?: string;
  rolId?: number;
  sucursalId?: number;
  activo?: boolean;
}
