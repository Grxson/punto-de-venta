import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AuthContextType, UsuarioDTO, SucursalDTO, LoginRequest, LoginResponse } from '../types/auth';
import { apiClient } from '../services/api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioDTO | null>(null);
  const [sucursal, setSucursal] = useState<SucursalDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.rol === 'ADMIN';
  const isGerente = user?.rol === 'GERENTE';
  const isVendedor = user?.rol === 'VENDEDOR';

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<any>('/auth/login', {
        username,
        password,
      } as LoginRequest);

      console.log('📥 [AuthContext] Response del backend:', response.data);

      // Normalizar el usuario (convertir de camelCase a snake_case)
      const usuarioRaw = response.data.usuario;
      const usuario: UsuarioDTO = {
        id: usuarioRaw.id,
        nombre: usuarioRaw.nombre,
        email: usuarioRaw.email,
        rol: typeof usuarioRaw.rol === 'string' ? usuarioRaw.rol : usuarioRaw.rol?.nombre || usuarioRaw.rolNombre || 'USUARIO',
        sucursal_id: usuarioRaw.sucursalId || usuarioRaw.sucursal_id || 1,
        activo: usuarioRaw.activo,
        permisos: usuarioRaw.permisos,
      };

      // Si el backend devuelve una sucursal, usarla; si no, crearla
      let nuevaSucursal = response.data.sucursal;
      if (!nuevaSucursal || !nuevaSucursal.id) {
        console.warn('⚠️ Backend no devolvió sucursal, creando una básica');
        nuevaSucursal = {
          id: usuario.sucursal_id,
          nombre: `Sucursal ${usuario.sucursal_id}`,
          activa: true,
        };
      }

      const { token: newToken } = response.data;

      console.log('🔐 [AuthContext] Login exitoso');
      console.log(`   - Usuario normalizado: ${usuario.nombre} (ID: ${usuario.id}, sucursal_id: ${usuario.sucursal_id}, rol: ${usuario.rol})`);
      console.log(`   - Sucursal: ID=${nuevaSucursal.id}, nombre=${nuevaSucursal.nombre}`);

      setToken(newToken);
      setUser(usuario);
      setSucursal(nuevaSucursal);

      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('authUser', JSON.stringify(usuario));
      await AsyncStorage.setItem('authSucursal', JSON.stringify(nuevaSucursal));
      
      console.log('   ✅ Datos guardados en AsyncStorage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      setToken(null);
      setUser(null);
      setSucursal(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('authSucursal');
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh-token', {});
      const { token: newToken } = response.data;

      setToken(newToken);
      await AsyncStorage.setItem('authToken', newToken);
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await logout();
    }
  }, [logout]);

  const changeSucursal = useCallback(async (nuevaSucursal: SucursalDTO) => {
    try {
      console.log(`🔄 [AuthContext] Intentando cambiar sucursal a ID=${nuevaSucursal.id}`);
      
      // Validar que el usuario tenga acceso a esta sucursal
      if (user && nuevaSucursal.id !== user.sucursal_id && !isAdmin) {
        console.error('❌ Usuario no tiene acceso a esta sucursal');
        return;
      }
      
      console.log(`✅ Sucursal cambiada a ID=${nuevaSucursal.id}`);
      setSucursal(nuevaSucursal);
      await AsyncStorage.setItem('authSucursal', JSON.stringify(nuevaSucursal));
    } catch (error) {
      console.error('Error al cambiar sucursal:', error);
    }
  }, [user, isAdmin]);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
      const storedSucursal = await AsyncStorage.getItem('authSucursal');

      console.log('🔍 [AuthContext] checkAuth iniciado');
      console.log('   - Token guardado:', !!storedToken);
      console.log('   - Usuario guardado:', !!storedUser);
      console.log('   - Sucursal guardada:', !!storedSucursal);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as UsuarioDTO;
        console.log(`   - Usuario parseado: ${parsedUser.nombre} (ID: ${parsedUser.id}, sucursal_id: ${parsedUser.sucursal_id}, rol: ${parsedUser.rol})`);
        
        let finalSucursal: SucursalDTO | null = null;

        // Para ADMIN: usar la sucursal guardada o la del usuario
        // Para usuarios regulares: siempre usar su sucursal_id
        if (parsedUser.rol === 'ADMIN' && storedSucursal) {
          const parsedSucursal = JSON.parse(storedSucursal) as SucursalDTO;
          console.log(`   - Sucursal guardada parseada: ID=${parsedSucursal?.id}, nombre=${parsedSucursal?.nombre}`);
          
          // Validar que la sucursal tenga ID válido
          if (parsedSucursal && parsedSucursal.id && parsedSucursal.id > 0) {
            console.log(`   ✅ Usando sucursal guardada: ${parsedSucursal.id}`);
            finalSucursal = parsedSucursal;
          } else {
            // Si está corrupta, usar la del usuario
            console.log(`   ⚠️ Sucursal guardada inválida, usando sucursal del usuario: ${parsedUser.sucursal_id}`);
            finalSucursal = {
              id: parsedUser.sucursal_id,
              nombre: `Sucursal ${parsedUser.sucursal_id}`,
              activa: true,
            };
          }
        } else {
          // Usuario regular: siempre su sucursal
          console.log(`   - Usuario regular o sin sucursal guardada, usando: ${parsedUser.sucursal_id}`);
          finalSucursal = {
            id: parsedUser.sucursal_id,
            nombre: `Sucursal ${parsedUser.sucursal_id}`,
            activa: true,
          };
        }

        console.log(`   📍 Sucursal final: ID=${finalSucursal?.id}, nombre=${finalSucursal?.nombre}`);
        setToken(storedToken);
        setUser(parsedUser);
        if (finalSucursal) {
          setSucursal(finalSucursal);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    sucursal,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isGerente,
    isVendedor,
    login,
    logout,
    refreshToken,
    checkAuth,
    changeSucursal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
