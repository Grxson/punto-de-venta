import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
  email?: string;
  rol?: string | { id: number; nombre: string; activo: boolean }; // Puede ser string o objeto
  rolNombre?: string; // Campo real del backend
  idSucursal?: number;
  sucursalId?: number; // Mantener compatibilidad // ID de la sucursal del usuario
  ultimoAcceso?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  activa: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  sucursal: Sucursal | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Función auxiliar para normalizar el rol
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

    console.log('🔐 AuthContext: Cargando desde localStorage...');
    console.log('   Token existe:', !!storedToken);
    console.log('   Usuario existe:', !!storedUsuario);
    console.log('   Sucursal existe:', !!storedSucursal);

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
                activa: true,
              };
            }
          } catch (e) {
            console.warn('⚠️ Error al parsear sucursal guardada');
            sucursalData = null;
          }
        }
        
        // Si no hay sucursal guardada, crear una basada en el usuario
        if (!sucursalData) {
          console.log('📍 Creando sucursal basada en usuario');
          sucursalData = {
            id: usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1,
            nombre: `Sucursal ${usuarioNormalizado.sucursalId || usuarioNormalizado.idSucursal || 1}`,
            activa: true,
          };
        }
        
        setToken(storedToken);
        setUsuario(usuarioNormalizado);
        setSucursal(sucursalData);
        apiService.setAuthToken(storedToken);
        console.log('✅ AuthContext: Token, usuario y sucursal cargados correctamente');
        console.log(`   Usuario: ${usuarioNormalizado.nombre}, Sucursal: ${sucursalData.id}`);
      } catch (error) {
        console.error('❌ Error al parsear usuario de localStorage:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_usuario');
        localStorage.removeItem('auth_sucursal');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('🔓 AuthContext: Iniciando login para', username);
      
      const response = await apiService.post(
        API_ENDPOINTS.LOGIN,
        { username, password },
        { requiresAuth: false }
      );

      if (response.success && response.data) {
        // El backend retorna: { token, usuario, mensaje }
        const { token: newToken, usuario: newUsuario } = response.data as { token: string; usuario: any; mensaje?: string };
        
        console.log('✅ AuthContext: Login exitoso, token recibido');
        console.log('   Token length:', newToken?.length);
        console.log('   Usuario:', newUsuario?.username);
        console.log('   Usuario object:', newUsuario);
        
        // Normalizar el rol: usar función auxiliar
        const usuarioNormalizado: Usuario = {
          ...newUsuario,
          rol: normalizarRol(newUsuario),
        };
        
        console.log('✅ AuthContext: Usuario normalizado:', usuarioNormalizado);
        
        // Crear sucursal basada en el sucursalId del usuario
        const sucursalId = newUsuario.sucursalId || newUsuario.idSucursal || 1;
        const sucursalData: Sucursal = {
          id: sucursalId,
          nombre: `Sucursal ${sucursalId}`,
          activa: true,
        };
        
        console.log(`   📍 Sucursal: ID=${sucursalData.id}, nombre=${sucursalData.nombre}`);
        
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
        
        console.log('✅ AuthContext: Token guardado en localStorage y apiService');
        console.log('   localStorage.auth_token:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
      } else {
        console.error('❌ AuthContext: Response sin éxito:', response);
        throw new Error(response.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error en login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setSucursal(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    localStorage.removeItem('auth_sucursal');
    apiService.clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        sucursal,
        token,
        isAuthenticated: !!token && !!usuario,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

