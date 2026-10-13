/**
 * Servicio de API para Sucursales
 */

import { apiService } from './api.service';
import type { Sucursal, CrearSucursalRequest, EditarSucursalRequest } from '../types/sucursal.types';

const BASE_URL = '/sucursales';

export const sucursalesService = {
  /**
   * Obtiene todas las sucursales activas.
   *
   * @returns La lista de sucursales activas, o `[]` si la petición falla.
   */
  obtenerTodas: async () => {
    try {
      const response = await apiService.get<Sucursal[]>(`${BASE_URL}?activo=true`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener sucursales:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener sucursales:', error);
      return [];
    }
  },

  /**
   * Obtiene todas las sucursales, incluidas las inactivas.
   *
   * @returns La lista completa de sucursales, o `[]` si la petición falla.
   */
  obtenerTodosConInactivos: async () => {
    try {
      const response = await apiService.get<Sucursal[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener sucursales con inactivos:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener sucursales con inactivos:', error);
      return [];
    }
  },

  /**
   * Obtiene una sucursal por su ID.
   *
   * @param id - ID de la sucursal.
   * @returns La sucursal, o `undefined` si el backend no la devuelve.
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Sucursal>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crea una sucursal nueva.
   *
   * @param data - Datos de la sucursal a crear.
   * @returns La sucursal creada, o `undefined` si el backend no devuelve datos.
   */
  crear: async (data: CrearSucursalRequest) => {
    const response = await apiService.post<Sucursal>(BASE_URL, data);
    return response.data;
  },

  /**
   * Actualiza una sucursal existente.
   *
   * @param id - ID de la sucursal.
   * @param data - Campos a actualizar.
   * @returns La sucursal actualizada, o `undefined` si el backend no devuelve datos.
   */
  actualizar: async (id: number, data: EditarSucursalRequest) => {
    const response = await apiService.put<Sucursal>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Desactiva (baja lógica) una sucursal.
   *
   * @param id - ID de la sucursal.
   * @returns `undefined`; el método solo confirma el éxito.
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Reactiva una sucursal previamente desactivada.
   *
   * @param id - ID de la sucursal.
   * @returns La sucursal reactivada, o `undefined` si el backend no devuelve datos.
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Sucursal>(`${BASE_URL}/${id}/reactivar`, {});
    return response.data;
  },
};
