/**
 * Servicio de API para Recetas
 */

import apiService from './api.service';

interface RecetaIngrediente {
  /** ID del ingrediente. */
  ingredienteId: number;
  ingredienteNombre: string;
  /** Cantidad necesaria del ingrediente. */
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  /** Merma teórica esperada del ingrediente, si se conoce. */
  mermaTeorica?: number;
}

interface Receta {
  /** ID del producto al que pertenece la receta. */
  productoId: number;
  productoNombre: string;
  /** Sucursal para la que aplica la receta; `undefined` si es global. */
  sucursalId?: number;
  /** Líneas de ingredientes que componen la receta. */
  ingredientes: RecetaIngrediente[];
  /** Suma del coste de los ingredientes. */
  costoDirecto?: number;
  /** Coste de gastos indirectos imputado. */
  costoIndirecto?: number;
  /** Coste de mano de obra imputado. */
  manoObra?: number;
  /** Coste total (directo + indirecto + mano de obra). */
  costoTotal?: number;
  /** Margen de utilidad objetivo, en porcentaje. */
  porcentajeUtilidadDeseado?: number;
  /** Precio de venta sugerido calculado a partir del coste y el margen. */
  precioSugerido?: number;
}

const BASE_URL = '/recetas';

export const recetasService = {
  /**
   * Obtiene las recetas de la sucursal actual.
   *
   * @returns La lista de recetas, o `[]` si la petición falla.
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
   * Obtiene la receta de un producto.
   *
   * @param productoId - ID del producto.
   * @returns La receta, o `null` si no existe o la petición falla.
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
   * Crea una receta nueva.
   *
   * @param data - Datos de la receta.
   * @returns La receta creada.
   * @throws Error si el backend no devuelve datos o indica fallo.
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
   * Actualiza la receta de un producto.
   *
   * @param productoId - ID del producto.
   * @param data - Datos de la receta.
   * @returns La receta actualizada.
   * @throws Error si el backend no devuelve datos o indica fallo.
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
   * Elimina la receta de un producto.
   *
   * @param productoId - ID del producto.
   * @returns `true` si la eliminación fue correcta.
   * @throws Error si el backend indica fallo.
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
