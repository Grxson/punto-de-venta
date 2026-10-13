/**
 * Servicio de API para Mano de Obra
 */

import { apiService } from './api.service';

interface ManoObra {
  /** Ausente antes de guardar el registro. */
  id?: number;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  /** Puesto o función desempeñada. */
  puesto: string;
  /** Salario mensual, cuando el pago se define por mes. */
  salarioMensual?: number;
  /** Pago por turno, cuando el pago se define por jornada. */
  pagoPorTurno?: number;
  /** Periodo de pago asociado. */
  periodo?: string;
  /** `false` equivale a baja lógica. */
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/mano-obra';

export const manoObraService = {
  /**
   * Obtiene todos los registros de mano de obra.
   *
   * @returns La lista de registros, o `[]` si la petición falla.
   */
  obtenerTodas: async () => {
    try {
      const response = await apiService.get<ManoObra[]>(BASE_URL);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener mano de obra:', response.error);
      return [];
    } catch (error) {
      console.error('Exception al obtener mano de obra:', error);
      return [];
    }
  },

  /**
   * Obtiene los registros de mano de obra activos.
   *
   * @returns La lista de registros activos, o `[]` si la petición falla.
   */
  obtenerActivos: async () => {
    try {
      const response = await apiService.get<ManoObra[]>(`${BASE_URL}/activos`);
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
   * Obtiene un registro de mano de obra por su ID.
   *
   * @param id - ID del registro.
   * @returns El registro, o `null` si no existe o la petición falla.
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<ManoObra>(`${BASE_URL}/${id}`);
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
   * Crea un registro de mano de obra nuevo.
   *
   * @param data - Datos del registro.
   * @returns El registro creado.
   * @throws Error si el backend no devuelve datos o indica fallo.
   */
  crear: async (data: ManoObra) => {
    try {
      const response = await apiService.post<ManoObra>(BASE_URL, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al crear mano de obra');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Actualiza un registro de mano de obra.
   *
   * @param id - ID del registro.
   * @param data - Datos del registro.
   * @returns El registro actualizado.
   * @throws Error si el backend no devuelve datos o indica fallo.
   */
  actualizar: async (id: number, data: ManoObra) => {
    try {
      const response = await apiService.put<ManoObra>(`${BASE_URL}/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al actualizar mano de obra');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Elimina un registro de mano de obra.
   *
   * @param id - ID del registro.
   * @returns `true` si la eliminación fue correcta.
   * @throws Error si el backend indica fallo.
   */
  eliminar: async (id: number) => {
    try {
      const response = await apiService.delete(`${BASE_URL}/${id}`);
      if (response.success) {
        return true;
      }
      throw new Error(response.error || 'Error al eliminar mano de obra');
    } catch (error: any) {
      throw error;
    }
  },
};
