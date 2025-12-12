/**
 * Servicio de API para Recetas
 */

import apiService from './api.service';

interface RecetaIngrediente {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  mermaTeorica?: number;
}

interface Receta {
  productoId: number;
  productoNombre: string;
  sucursalId?: number;
  ingredientes: RecetaIngrediente[];
  costoDirecto?: number;
  costoIndirecto?: number;
  manoObra?: number;
  costoTotal?: number;
  porcentajeUtilidadDeseado?: number;
  precioSugerido?: number;
}

const BASE_URL = '/recetas';

export const recetasService = {
  /**
   * Obtener recetas de la sucursal actual
   */
  obtenerTodas: async (): Promise<Receta[]> => {
    try {
      const response = await apiService.get<Receta[]>(BASE_URL);
      if (response.data) {
        return response.data;
      }
      console.warn('Error al obtener recetas:', response.error);
      return [];
    } catch (error) {
      console.error('Exception al obtener recetas:', error);
      return [];
    }
  },

  /**
   * Obtener una receta por ID de producto
   */
  obtenerPorProducto: async (productoId: number): Promise<Receta | null> => {
    try {
      const response = await apiService.get<Receta>(`${BASE_URL}/producto/${productoId}`);
      if (response.data) {
        return response.data;
      }
      console.warn('Error al obtener receta:', response.error);
      return null;
    } catch (error) {
      console.error('Exception al obtener receta:', error);
      return null;
    }
  },

  /**
   * Crear una nueva receta
   */
  crear: async (data: Receta): Promise<Receta> => {
    try {
      const response = await apiService.post<Receta>(BASE_URL, data);
      if (response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al crear receta');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Actualizar una receta
   */
  actualizar: async (productoId: number, data: Receta): Promise<Receta> => {
    try {
      const response = await apiService.put<Receta>(`${BASE_URL}/producto/${productoId}`, data);
      if (response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Error al actualizar receta');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Eliminar una receta
   */
  eliminar: async (productoId: number): Promise<boolean> => {
    try {
      const response = await apiService.delete(`${BASE_URL}/producto/${productoId}`);
      if (!response.error) {
        return true;
      }
      throw new Error(response.error || 'Error al eliminar receta');
    } catch (error: any) {
      throw error;
    }
  },
};
