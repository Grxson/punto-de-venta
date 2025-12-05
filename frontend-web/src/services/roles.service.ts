/**
 * Servicio para API calls relacionados con roles
 */

import apiService from './api.service';
import type { Rol, CrearRolRequest, EditarRolRequest } from '../types/rol.types';

const API_BASE = '/api/roles';

export const rolesService = {
  /**
   * Obtener todos los roles activos
   */
  obtenerTodos: async () => {
    const response = await apiService.get<Rol[]>(API_BASE);
    return response.data || [];
  },

  /**
   * Obtener todos los roles (incluyendo inactivos)
   */
  obtenerTodosConInactivos: async () => {
    const response = await apiService.get<Rol[]>(`${API_BASE}?incluirInactivos=true`);
    return response.data || [];
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
