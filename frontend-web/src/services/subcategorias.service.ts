/**
 * Servicio para gestión de subcategorías de productos
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { CategoriaSubcategoria } from '../types/subcategorias.types';

// Re-exportar tipos para compatibilidad
export type { CategoriaSubcategoria } from '../types/subcategorias.types';

export const subcategoriasService = {
  /**
   * Obtener subcategorías de una categoría
   */
  obtenerPorCategoria: async (categoriaId: number) => {
    return apiService.get<CategoriaSubcategoria[]>(
      `${API_ENDPOINTS.CATEGORIES}/${categoriaId}/subcategorias`
    );
  },
};
