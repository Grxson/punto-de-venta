/**
 * Hooks de React Query para subcategorías de productos
 * Implementa caché y sincronización de datos con el backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subcategoriasService, type CategoriaSubcategoria, type CreateSubcategoriaRequest } from '../services/subcategorias.service';

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

/**
 * Hook para crear subcategoría
 * Invalida automáticamente el caché de subcategorías
 */
export const useCrearSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, data }: { categoriaId: number; data: CreateSubcategoriaRequest }) =>
      subcategoriasService.crear(categoriaId, data),
    onSuccess: (_, variables) => {
      // Invalidar la lista de subcategorías de esa categoría
      queryClient.invalidateQueries({ queryKey: subcategoriasKeys.list(variables.categoriaId) });
    },
  });
};

/**
 * Hook para actualizar subcategoría
 * Invalida automáticamente el caché
 */
export const useActualizarSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, subcategoriaId, data }: { categoriaId: number; subcategoriaId: number; data: Partial<CreateSubcategoriaRequest> }) =>
      subcategoriasService.actualizar(categoriaId, subcategoriaId, data),
    onSuccess: (_, variables) => {
      // Invalidar la lista de subcategorías de esa categoría
      queryClient.invalidateQueries({ queryKey: subcategoriasKeys.list(variables.categoriaId) });
    },
  });
};

/**
 * Hook para eliminar subcategoría
 * Invalida automáticamente el caché
 */
export const useEliminarSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, subcategoriaId }: { categoriaId: number; subcategoriaId: number }) =>
      subcategoriasService.eliminar(categoriaId, subcategoriaId),
    onSuccess: (_, variables) => {
      // Invalidar la lista de subcategorías de esa categoría
      queryClient.invalidateQueries({ queryKey: subcategoriasKeys.list(variables.categoriaId) });
    },
  });
};
