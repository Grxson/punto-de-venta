/**
 * Servicio para gestión de subcategorías de productos
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { CategoriaSubcategoria } from '../types/subcategorias.types';

// Re-exportar tipos para compatibilidad
export type { CategoriaSubcategoria } from '../types/subcategorias.types';

export interface CreateSubcategoriaRequest {
  nombre: string;
  descripcion?: string;
  orden?: number;
  activa?: boolean;
}

export const subcategoriasService = {
  /**
   * Obtener subcategorías de una categoría
   */
  obtenerPorCategoria: async (categoriaId: number) => {
    return apiService.get<CategoriaSubcategoria[]>(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias`
    );
  },

  /**
   * Obtener subcategoría específica
   */
  obtener: async (categoriaId: number, subcategoriaId: number) => {
    return apiService.get<CategoriaSubcategoria>(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`
    );
  },

  /**
   * Crear nueva subcategoría
   */
  crear: async (categoriaId: number, data: CreateSubcategoriaRequest) => {
    return apiService.post<CategoriaSubcategoria>(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias`,
      data
    );
  },

  /**
   * Actualizar subcategoría
   */
  actualizar: async (categoriaId: number, subcategoriaId: number, data: Partial<CreateSubcategoriaRequest>) => {
    return apiService.put<CategoriaSubcategoria>(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`,
      data
    );
  },

  /**
   * Eliminar subcategoría (borrado lógico)
   */
  eliminar: async (categoriaId: number, subcategoriaId: number) => {
    return apiService.delete(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`
    );
  },
};
