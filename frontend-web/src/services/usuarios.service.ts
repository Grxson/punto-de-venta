/**
 * Servicio para API calls relacionados con usuarios
 */

import apiService from './api.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest, CambiarRolRequest } from '../types/usuario.types';

const API_BASE = '/auth/usuarios';

export const usuariosService = {
  /**
   * Obtener todos los usuarios de una sucursal
   */
  obtenerPorSucursal: async (sucursalId: number, activo?: boolean) => {
    try {
      const params = new URLSearchParams();
      if (activo !== undefined) {
        params.append('activo', String(activo));
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiService.get<Usuario[]>(`${API_BASE}/sucursal/${sucursalId}${query}`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener usuarios:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener usuarios:', error);
      return [];
    }
  },

  /**
   * Obtener un usuario por ID
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<Usuario>(`${API_BASE}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener usuario:', response.error || 'Unknown error');
      return null;
    } catch (error) {
      console.error('Exception al obtener usuario:', error);
      return null;
    }
  },

  /**
   * Crear nuevo usuario
   */
  crear: async (data: CrearUsuarioRequest) => {
    console.log('🔵 usuariosService.crear() - Datos:', data);
    const response = await apiService.post<Usuario>(API_BASE, data);
    console.log('🔴 usuariosService.crear() - Respuesta:', response);
    return response.data;
  },

  /**
   * Actualizar usuario
   */
  actualizar: async (id: number, data: EditarUsuarioRequest) => {
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Cambiar rol de un usuario
   */
  cambiarRol: async (id: number, rolId: number) => {
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}/rol`, { rolId });
    return response.data;
  },

  /**
   * Desactivar usuario
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Reactivar usuario
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Usuario>(`${API_BASE}/${id}/reactivar`, {});
    return response.data;
  },
};
