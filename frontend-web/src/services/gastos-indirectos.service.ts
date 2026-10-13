/**
 * Servicio de API para Gastos Indirectos
 */

import { apiService } from './api.service';

interface GastoIndirecto {
  /** Ausente antes de guardar el registro. */
  id?: number;
  sucursalId?: number;
  sucursalNombre?: string;
  nombre: string;
  descripcion?: string;
  /** Monto prorrateado a nivel mensual. */
  montoMensual?: number;
  /** Monto prorrateado a nivel semanal. */
  montoSemanal?: number;
  /** Monto prorrateado a nivel diario. */
  montoDiario?: number;
  /** `false` equivale a baja lógica. */
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/gastos-indirectos';

export const gastosIndirectosService = {
  /**
   * Obtiene todos los gastos indirectos.
   *
   * @returns La lista de gastos indirectos, o `[]` si la petición falla.
   */
  obtenerTodos: async () => {
    try {
      const response = await apiService.get<GastoIndirecto[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener gastos indirectos:', response.error);
      return [];
    } catch (error) {
      console.error('Exception al obtener gastos indirectos:', error);
      return [];
    }
  },

  /**
   * Obtiene los gastos indirectos activos.
   *
   * @returns La lista de gastos indirectos activos, o `[]` si la petición falla.
   */
  obtenerActivos: async () => {
    try {
      const response = await apiService.get<GastoIndirecto[]>(`${BASE_URL}/activos`);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Exception:', error);
      return [];
    }
  },

  /**
   * Obtiene un gasto indirecto por su ID.
   *
   * @param id - ID del gasto indirecto.
   * @returns El gasto indirecto, o `null` si no existe o la petición falla.
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<GastoIndirecto>(`${BASE_URL}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Exception:', error);
      return null;
    }
  },

  /**
   * Crea un gasto indirecto nuevo.
   *
   * @param data - Datos del gasto indirecto.
   * @returns El gasto indirecto creado.
   * @throws Error si el backend no devuelve datos o indica fallo.
   */
  crear: async (data: GastoIndirecto) => {
    try {
      const response = await apiService.post<GastoIndirecto>(BASE_URL, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al crear gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Actualiza un gasto indirecto.
   *
   * @param id - ID del gasto indirecto.
   * @param data - Datos del gasto indirecto.
   * @returns El gasto indirecto actualizado.
   * @throws Error si el backend no devuelve datos o indica fallo.
   */
  actualizar: async (id: number, data: GastoIndirecto) => {
    try {
      const response = await apiService.put<GastoIndirecto>(`${BASE_URL}/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al actualizar gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Elimina un gasto indirecto.
   *
   * @param id - ID del gasto indirecto.
   * @returns `true` si la eliminación fue correcta.
   * @throws Error si el backend indica fallo.
   */
  eliminar: async (id: number) => {
    try {
      const response = await apiService.delete(`${BASE_URL}/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Error al eliminar gasto indirecto');
    } catch (error: any) {
      throw error;
    }
  },
};
