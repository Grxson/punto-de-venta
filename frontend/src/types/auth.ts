export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'USUARIO';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  sucursal_id: number;
  activo: boolean;
  permisos?: string[];
}

export interface SucursalDTO {
  id: number;
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  activa: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioDTO;
  sucursal: SucursalDTO;
}

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
