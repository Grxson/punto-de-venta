/**
 * Roles disponibles en el sistema.
 */
export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'USUARIO';

/**
 * Usuario autenticado tal como lo devuelve el backend.
 */
export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  sucursal_id: number;
  activo: boolean;
  permisos?: string[];
}

/**
 * Sucursal (punto de venta).
 */
export interface SucursalDTO {
  id: number;
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  activa: boolean;
}

/**
 * Cuerpo de la petición de inicio de sesión.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Respuesta del backend tras un inicio de sesión correcto.
 */
export interface LoginResponse {
  token: string;
  usuario: UsuarioDTO;
  sucursal: SucursalDTO;
}

/**
 * Contrato del contexto de autenticación y sesión.
 */
export interface AuthContextType {
  // Estado
  user: UsuarioDTO | null;
  sucursal: SucursalDTO | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Propiedades derivadas
  isAdmin: boolean;
  isGerente: boolean;
  isVendedor: boolean;
  
  // Métodos
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changeSucursal: (nuevaSucursal: SucursalDTO) => Promise<void>;
}
