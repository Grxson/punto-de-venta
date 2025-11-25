import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar token y usuario desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUsuario = localStorage.getItem('auth_usuario');

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
      apiService.setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.LOGIN,
        { username, password },
        { requiresAuth: false }
      );

      if (response.success && response.data) {
        // El backend retorna: { token, usuario, mensaje }
        const { token: newToken, usuario: newUsuario } = response.data as { token: string; usuario: Usuario; mensaje?: string };
        
        // Guardar en estado
        setToken(newToken);
        setUsuario(newUsuario);
        
        // Guardar en localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_usuario', JSON.stringify(newUsuario));
        
        // Configurar token en apiService
        apiService.setAuthToken(newToken);
      } else {
        throw new Error(response.error || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    apiService.clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
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

