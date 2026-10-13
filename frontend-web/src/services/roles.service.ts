/**
 * Servicio con llamadas a la API relacionadas con roles.
 */

import apiService from './api.service';
import type { Rol, CrearRolRequest, EditarRolRequest } from '../types/rol.types';

const API_BASE = '/roles';

export const rolesService = {
  /**
   * Obtiene todos los roles activos.
   *
   * @returns La lista de roles activos, o `[]` si la petición falla.
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
   * Obtiene todos los roles, incluidos los inactivos.
   *
   * @returns La lista completa de roles, o `[]` si la petición falla.
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
   * Obtiene un rol por su ID.
   *
   * @param id - ID del rol.
   * @returns El rol, o `undefined` si el backend no lo devuelve.
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Rol>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Crea un rol nuevo.
   *
   * @param data - Datos del rol a crear.
   * @returns El rol creado, o `undefined` si el backend no devuelve datos.
   */
  crear: async (data: CrearRolRequest) => {
    const response = await apiService.post<Rol>(API_BASE, data);
    return response.data;
  },

  /**
   * Actualiza un rol existente.
   *
   * @param id - ID del rol.
   * @param data - Campos a actualizar.
   * @returns El rol actualizado, o `undefined` si el backend no devuelve datos.
   */
  actualizar: async (id: number, data: EditarRolRequest) => {
    const response = await apiService.put<Rol>(`${API_BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Desactiva (baja lógica) un rol.
   *
   * @param id - ID del rol.
   * @returns `undefined`; el método solo confirma el éxito.
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${API_BASE}/${id}`);
    return response.data;
  },

  /**
   * Reactiva un rol previamente desactivado.
   *
   * @param id - ID del rol.
   * @returns El rol reactivado, o `undefined` si el backend no devuelve datos.
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Rol>(`${API_BASE}/${id}/reactivar`, {});
    return response.data;
  },
};
