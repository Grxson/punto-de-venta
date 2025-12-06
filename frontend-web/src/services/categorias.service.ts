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
   * Listar categorías con filtros opcionales
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
   * Obtener categoría por ID
   */
  obtener: async (id: number) => {
    return apiService.get<CategoriaProducto>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },

  /**
   * Crear nueva categoría
   */
  crear: async (categoria: Omit<CategoriaProducto, 'id'>) => {
    return apiService.post<CategoriaProducto>(API_ENDPOINTS.CATEGORIES, categoria);
  },

  /**
   * Actualizar categoría existente
   */
  actualizar: async (id: number, categoria: Partial<Omit<CategoriaProducto, 'id'>>) => {
    return apiService.put<CategoriaProducto>(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoria);
  },

  /**
   * Eliminar categoría (hard delete - eliminación permanente)
   */
  eliminar: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },
};

