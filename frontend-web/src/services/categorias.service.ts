/**
 * Servicio para gestión de categorías de productos
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { CategoriaProducto, CategoriaFiltros } from '../types/categorias.types';

// Re-exportar tipos para compatibilidad
export type { CategoriaProducto, CategoriaFiltros } from '../types/categorias.types';

export const categoriasService = {
  /**
   * Lista categorías con filtros opcionales.
   *
   * @param filtros - Filtros de búsqueda (estado activo y texto).
   * @returns La respuesta normalizada con la lista de categorías.
   */
  listar: async (filtros?: CategoriaFiltros) => {
    const params = new URLSearchParams();
    if (filtros?.activa !== undefined) {
      params.append('activa', filtros.activa.toString());
    }
    if (filtros?.q) {
      params.append('q', filtros.q);
    }
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.CATEGORIES}?${queryString}`
      : API_ENDPOINTS.CATEGORIES;
    
    return apiService.get<CategoriaProducto[]>(endpoint);
  },

  /**
   * Obtiene una categoría por su ID.
   *
   * @param id - ID de la categoría.
   * @returns La respuesta normalizada con la categoría.
   */
  obtener: async (id: number) => {
    return apiService.get<CategoriaProducto>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },

  /**
   * Crea una categoría nueva.
   *
   * @param categoria - Datos de la categoría (sin `id`).
   * @returns La respuesta normalizada con la categoría creada.
   */
  crear: async (categoria: Omit<CategoriaProducto, 'id'>) => {
    return apiService.post<CategoriaProducto>(API_ENDPOINTS.CATEGORIES, categoria);
  },

  /**
   * Actualiza una categoría existente.
   *
   * @param id - ID de la categoría.
   * @param categoria - Campos a actualizar (sin `id`).
   * @returns La respuesta normalizada con la categoría actualizada.
   */
  actualizar: async (id: number, categoria: Partial<Omit<CategoriaProducto, 'id'>>) => {
    return apiService.put<CategoriaProducto>(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoria);
  },

  /**
   * Elimina una categoría de forma definitiva (borrado físico).
   *
   * @param id - ID de la categoría.
   * @returns La respuesta normalizada de la eliminación.
   */
  eliminar: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },
};

