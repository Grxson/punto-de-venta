/**
 * Servicio para gestión de subcategorías de productos
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { CategoriaSubcategoria } from '../types/subcategorias.types';

// Re-exportar tipos para compatibilidad
export type { CategoriaSubcategoria } from '../types/subcategorias.types';

export interface CreateSubcategoriaRequest {
  /** Nombre visible de la subcategoría. */
  nombre: string;
  descripcion?: string;
  /** Posición en el listado; menor valor, más arriba. */
  orden?: number;
  /** `false` equivale a baja lógica. */
  activa?: boolean;
}

export const subcategoriasService = {
  /**
   * Obtiene las subcategorías de una categoría.
   *
   * @param categoriaId - ID de la categoría padre.
   * @returns La respuesta normalizada con la lista de subcategorías.
   */
  obtenerPorCategoria: async (categoriaId: number) => {
    return apiService.get<CategoriaSubcategoria[]>(
      `${API_ENDPOINTS.SUBCATEGORIES}/${categoriaId}/subcategorias`
    );
  },

  /**
   * Obtiene una subcategoría concreta.
   *
   * @param categoriaId - ID de la categoría padre.
   * @param subcategoriaId - ID de la subcategoría.
   * @returns La respuesta normalizada con la subcategoría.
   */
  obtener: async (categoriaId: number, subcategoriaId: number) => {
    return apiService.get<CategoriaSubcategoria>(
      `${API_ENDPOINTS.SUBCATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`
    );
  },

  /**
   * Crea una subcategoría nueva dentro de una categoría.
   *
   * @param categoriaId - ID de la categoría padre.
   * @param data - Datos de la subcategoría a crear.
   * @returns La respuesta normalizada con la subcategoría creada.
   */
  crear: async (categoriaId: number, data: CreateSubcategoriaRequest) => {
    return apiService.post<CategoriaSubcategoria>(
      `${API_ENDPOINTS.SUBCATEGORIES}/${categoriaId}/subcategorias`,
      data
    );
  },

  /**
   * Actualiza una subcategoría existente.
   *
   * @param categoriaId - ID de la categoría padre.
   * @param subcategoriaId - ID de la subcategoría.
   * @param data - Campos a actualizar.
   * @returns La respuesta normalizada con la subcategoría actualizada.
   */
  actualizar: async (categoriaId: number, subcategoriaId: number, data: Partial<CreateSubcategoriaRequest>) => {
    return apiService.put<CategoriaSubcategoria>(
      `${API_ENDPOINTS.SUBCATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`,
      data
    );
  },

  /**
   * Elimina una subcategoría de forma definitiva (borrado físico).
   *
   * @param categoriaId - ID de la categoría padre.
   * @param subcategoriaId - ID de la subcategoría.
   * @returns La respuesta normalizada de la eliminación.
   */
  eliminar: async (categoriaId: number, subcategoriaId: number) => {
    return apiService.delete(
      `${API_ENDPOINTS.SUBCATEGORIES}/${categoriaId}/subcategorias/${subcategoriaId}`
    );
  },
};
