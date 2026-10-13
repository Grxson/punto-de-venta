import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Usuario autenticado, tal como lo expone el backend.
 */
interface Usuario {
  /** Identificador único del usuario. */
  id: number;
  /** Nombre de usuario para iniciar sesión. */
  username: string;
  /** Nombre de pila. */
  nombre: string;
  /** Apellidos (opcional). */
  apellido?: string;
  /** Correo electrónico (opcional). */
  email?: string;
  /** Rol del usuario. Puede venir como string o como objeto; se normaliza con {@link normalizarRol}. */
  rol?: string | { id: number; nombre: string; activo: boolean };
  /** Nombre del rol tal como lo devuelve el backend. */
  rolNombre?: string;
  /** Identificador de sucursal con el nombre de campo histórico. */
  idSucursal?: number;
  /** Identificador de sucursal con el nombre de campo actual; se conserva por compatibilidad con ambas formas. */
  sucursalId?: number;
  /** Fecha del último inicio de sesión registrado. */
  ultimoAcceso?: string;
  /** Fecha de creación del registro. */
  createdAt?: string;
  /** Fecha de la última actualización del registro. */
  updatedAt?: string;
}

/**
 * Sucursal asociada al usuario autenticado.
 */
interface Sucursal {
  /** Identificador único de la sucursal. */
  id: number;
  /** Nombre visible de la sucursal. */
  nombre: string;
  /** Dirección física (opcional). */
  direccion?: string;
  /** Correo electrónico de la sucursal (opcional). */
  email?: string;
  /** Teléfono de contacto (opcional). */
  telefono?: string;
  /** Indica si la sucursal está activa. */
  activo: boolean;
}

/**
 * Estado global de autenticación disponible para toda la aplicación.
 */
interface AuthContextType {
  /** Usuario autenticado, o `null` si no hay sesión activa. */
  usuario: Usuario | null;
  /** Sucursal del usuario autenticado, o `null` si aún no se ha resuelto. */
  sucursal: Sucursal | null;
  /** Token de sesión almacenado en `localStorage`, o `null` si no hay sesión. */
  token: string | null;
  /** `true` solo si hay token, usuario y formato de token válido. */
  isAuthenticated: boolean;
  /** Autentica al usuario contra la API y persiste la sesión. Lanza un error si las credenciales son inválidas. */
  login: (username: string, password: string) => Promise<void>;
  /** Limpia estado, `localStorage` y token de `apiService`, y redirige a `/login`. */
  logout: () => void;
  /** `true` mientras se restaura la sesión desde `localStorage`; evita parpadeos de rutas protegidas. */
  loading: boolean;
}

/**
 * Contexto de autenticación. Se crea como `undefined` para poder detectar
 * consumidores usados fuera de {@link AuthProvider}.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de autenticación: restaura la sesión desde `localStorage`,
 * expone el login/logout y mantiene sincronizado el token con `apiService`.
 *
 * @param props.children - Árbol de componentes que recibe el contexto.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Devuelve el rol del usuario como texto plano, pruebando en orden
   * `rolNombre`, `rol.nombre` y `rol`, porque el backend no siempre envía el mismo campo.
   *
   * @param usuario - Objeto usuario crudo devuelto por la API o leído de `localStorage`.
   * @returns Nombre del rol, o cadena vacía si no se puede determinar.
   */
  const normalizarRol = (usuario: any): string => {
    // Prioridad: rolNombre > rol.nombre > rol > ''
    if (usuario.rolNombre) return usuario.rolNombre;
    if (typeof usuario.rol === 'object' && usuario.rol?.nombre) return usuario.rol.nombre;
    if (typeof usuario.rol === 'string') return usuario.rol;
    return '';
  };

  // Cargar token y usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUsuario = localStorage.getItem('auth_usuario');
    const storedSucursal = localStorage.getItem('auth_sucursal');


    if (storedToken && storedUsuario) {
      try {
        const usuarioData = JSON.parse(storedUsuario);
        // Normalizar el rol al cargar desde localStorage
        const usuarioNormalizado: Usuario = {
          ...usuarioData,
          rol: normalizarRol(usuarioData), // Usar función auxiliar
        };

        // Cargar sucursal
        let sucursalData: Sucursal | null = null;
        if (storedSucursal) {
          try {
            sucursalData = JSON.parse(storedSucursal);
            // Validar que la sucursal sea válida
            if (!sucursalData?.id || sucursalData.id <= 0) {
              console.warn('⚠️ Sucursal guardada inválida, usando la del usuario');
              sucursalData = {
                id: usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1,
                nombre: `Sucursal ${usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1}`,
                activo: true,
              };
            }
          } catch (e) {
            console.warn('⚠️ Error al parsear sucursal guardada');
            sucursalData = null;
          }
        }

        // Si no hay sucursal guardada, crear una basada en el usuario
        if (!sucursalData) {
          sucursalData = {
            id: usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1,
            nombre: `Sucursal ${usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1}`,
            activo: true,
          };
        }

        setToken(storedToken);
        setUsuario(usuarioNormalizado);
        setSucursal(sucursalData);
        apiService.setAuthToken(storedToken);
      } catch (error) {
        console.error('❌ Error al parsear usuario de localStorage:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_usuario');
        localStorage.removeItem('auth_sucursal');
      }
    }
    setLoading(false);
  }, []);

  /**
 * Autentica al usuario: obtiene el token, normaliza el rol, resuelve la sucursal
 * y persiste la sesión en `localStorage`.
 *
 * @param username - Nombre de usuario enviado al backend.
 * @param password - Contraseña enviada al backend.
 * @throws Error Si el backend no devuelve una respuesta exitosa o la petición falla.
 */
  const login = async (username: string, password: string) => {
    try {

      const response = await apiService.post(
        API_ENDPOINTS.LOGIN,
        { username, password },
        { requiresAuth: false }
      );

      if (response.success && response.data) {
        // El backend retorna: { token, usuario, mensaje }
        const { token: newToken, usuario: newUsuario } = response.data as { token: string; usuario: any; mensaje?: string };


        // Normalizar el rol: usar función auxiliar
        const usuarioNormalizado: Usuario = {
          ...newUsuario,
          rol: normalizarRol(newUsuario),
        };


        // Cargar sucursal del servidor basado en el sucursalId del usuario
        const sucursalId = newUsuario.sucursalId || newUsuario.idSucursal || 1;
        let sucursalData: Sucursal;
        
        try {
          // Setear token temporalmente para poder hacer la solicitud
          apiService.setAuthToken(newToken);
          const sucursalResponse = await apiService.get(`/sucursales/${sucursalId}`);
          
          if (sucursalResponse.success && sucursalResponse.data) {
            sucursalData = sucursalResponse.data;
          } else {
            throw new Error('No se encontró la sucursal');
          }
        } catch (err) {
          console.warn(`⚠️ No se pudo cargar sucursal del servidor, usando datos locales`);
          // Fallback: crear sucursal local
          sucursalData = {
            id: sucursalId,
            nombre: `Sucursal ${sucursalId}`,
            activo: true,
          };
        }

        // Guardar en estado
        setToken(newToken);
        setUsuario(usuarioNormalizado);
        setSucursal(sucursalData);

        // Guardar en localStorage (con rol normalizado)
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_usuario', JSON.stringify(usuarioNormalizado));
        localStorage.setItem('auth_sucursal', JSON.stringify(sucursalData));

        // Configurar token en apiService
        apiService.setAuthToken(newToken);

      } else {
        console.error('❌ AuthContext: Response sin éxito:', response);
        throw new Error(response.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error en login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  /**
   * Cierra sesión y fuerza la navegación al login con una recarga completa,
   * de modo que ningún estado en memoria sobreviva al cambio de usuario.
   */
  const logout = () => {
    setToken(null);
    setUsuario(null);
    setSucursal(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    localStorage.removeItem('auth_sucursal');
    apiService.clearAuthToken();
    // Redirigir al login después de limpiar el estado
    window.location.href = '/login';
  };

  /**
 * Valida el formato del token (JWT de tres segmentos separados por puntos).
 * No verifica la expiración: esa comprobación la hace el backend al recibirlo.
 *
 * @returns `true` si el token existe y tiene el formato esperado.
 */
  const isTokenValid = (): boolean => {
    if (!token) return false;
    try {
      // Un token JWT simple tiene 3 partes separadas por puntos
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Token inválido (formato incorrecto)');
        return false;
      }
      // Aquí podrías decodificar el JWT y verificar expiration si necesitas
      return true;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        sucursal,
        token,
        isAuthenticated: !!token && !!usuario && isTokenValid(),
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook de acceso al contexto de autenticación.
 *
 * @returns El estado y las acciones de {@link AuthContext}.
 * @throws Error Si se usa fuera de {@link AuthProvider}.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

