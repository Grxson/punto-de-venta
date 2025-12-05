/**
 * Hooks de React Query para subcategorías de productos
 * Implementa caché y sincronización de datos con el backend
 */

import { useQuery } from '@tanstack/react-query';
import { subcategoriasService, type CategoriaSubcategoria } from '../services/subcategorias.service';

// Query keys para subcategorías
export const subcategoriasKeys = {
  all: ['subcategorias'] as const,
  lists: () => [...subcategoriasKeys.all, 'list'] as const,
  list: (categoriaId: number) => [...subcategoriasKeys.lists(), categoriaId] as const,
};

/**
 * Hook para obtener subcategorías de una categoría
 * Caché: 10 minutos (dato estático)
 */
export const useSubcategorias = (categoriaId: number | null | '') => {
  return useQuery({
    queryKey: subcategoriasKeys.list(Number(categoriaId)),
    queryFn: () => subcategoriasService.obtenerPorCategoria(Number(categoriaId)),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!categoriaId, // Solo ejecutar si hay categoriaId válido
  });
};
