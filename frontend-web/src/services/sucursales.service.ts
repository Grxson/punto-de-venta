/**
 * Servicio de API para Sucursales
 */

import { apiService } from './api.service';
import type { Sucursal, CrearSucursalRequest, EditarSucursalRequest } from '../types/sucursal.types';

const BASE_URL = '/api/sucursales';

export const sucursalesService = {
  /**
   * Obtener todas las sucursales activas
   */
  obtenerTodas: async () => {
    const response = await apiService.get<Sucursal[]>(`${BASE_URL}?activo=true`);
    return response.data;
  },

  /**
   * Obtener todas las sucursales incluyendo inactivas
   */
  obtenerTodosConInactivos: async () => {
    const response = await apiService.get<Sucursal[]>(BASE_URL);
    return response.data;
  },

  /**
   * Obtener una sucursal por ID
   */
  obtenerPorId: async (id: number) => {
    const response = await apiService.get<Sucursal>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crear una nueva sucursal
   */
  crear: async (data: CrearSucursalRequest) => {
    const response = await apiService.post<Sucursal>(BASE_URL, data);
    return response.data;
  },

  /**
   * Actualizar una sucursal
   */
  actualizar: async (id: number, data: EditarSucursalRequest) => {
    const response = await apiService.put<Sucursal>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Desactivar una sucursal
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Reactivar una sucursal
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Sucursal>(`${BASE_URL}/${id}/reactivar`, {});
    return response.data;
  },
};
