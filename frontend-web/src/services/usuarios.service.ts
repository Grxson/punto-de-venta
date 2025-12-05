/**
 * Servicio para API calls relacionados con usuarios
 */

import apiService from './api.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest, CambiarRolRequest } from '../types/usuario.types';

const API_BASE = '/api/auth/usuarios';

export const usuariosService = {
  /**
   * Obtener todos los usuarios de una sucursal
   */
  obtenerPorSucursal: async (sucursalId: number, activo?: boolean) => {
    const params = new URLSearchParams();
    if (activo !== undefined) {
      params.append('activo', String(activo));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiService.get<Usuario[]>(`${API_BASE}/sucursal/${sucursalId}${query}`);
    return response.data || [];
  },

  /**
   * Obtener un usuario por ID
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Usuario>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo usuario
   */
  crear: async (data: CrearUsuarioRequest) => {
    const response = await apiService.post<Usuario>(API_BASE, data);
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
