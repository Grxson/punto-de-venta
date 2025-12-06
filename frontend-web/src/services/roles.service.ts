/**
 * Servicio para API calls relacionados con roles
 */

import apiService from './api.service';
import type { Rol, CrearRolRequest, EditarRolRequest } from '../types/rol.types';

const API_BASE = '/roles';

export const rolesService = {
  /**
   * Obtener todos los roles activos
   */
  obtenerTodos: async () => {
    try {
      const response = await apiService.get<Rol[]>(API_BASE);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener roles:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener roles:', error);
      return [];
    }
  },

  /**
   * Obtener todos los roles (incluyendo inactivos)
   */
  obtenerTodosConInactivos: async () => {
    try {
      const response = await apiService.get<Rol[]>(`${API_BASE}?incluirInactivos=true`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener roles con inactivos:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener roles con inactivos:', error);
      return [];
    }
  },

  /**
   * Obtener un rol por ID
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Rol>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo rol
   */
  crear: async (data: CrearRolRequest) => {
    const response = await apiService.post<Rol>(API_BASE, data);
    return response.data;
  },

  /**
   * Actualizar rol
   */
  actualizar: async (id: number, data: EditarRolRequest) => {
    const response = await apiService.put<Rol>(`${API_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar rol
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Reactivar rol
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Rol>(`${API_BASE}/${id}/reactivar`, {});
    return response.data;
  },
};
