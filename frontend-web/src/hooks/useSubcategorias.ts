/**
 * Hooks de React Query para subcategorías de productos.
 * Implementan `cache` y sincronización de datos con el backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subcategoriasService, type CategoriaSubcategoria, type CreateSubcategoriaRequest } from '../services/subcategorias.service';

/** Fábrica de claves de `cache` de React Query para subcategorías. */
export const subcategoriasKeys = {
  all: ['subcategorias'] as const,
  lists: () => [...subcategoriasKeys.all, 'list'] as const,
  list: (categoriaId: number) => [...subcategoriasKeys.lists(), categoriaId] as const,
};

/**
 * Obtiene las subcategorías de una categoría.
 *
 * @param categoriaId - Id de la categoría; si es `null`, vacío o inválido, la consulta no se ejecuta.
 * @returns Resultado de `useQuery` con las subcategorías. `cache`: 10 minutos.
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
 * Crea una subcategoría e invalida la lista de su categoría.
 *
 * @returns Resultado de `useMutation` que espera `{ categoriaId, data }`.
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
 * Actualiza una subcategoría e invalida la lista de su categoría.
 *
 * @returns Resultado de `useMutation` que espera `{ categoriaId, subcategoriaId, data }`.
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
 * Elimina una subcategoría e invalida la lista de su categoría con `refetch` inmediato.
 *
 * @returns Resultado de `useMutation` que espera `{ categoriaId, subcategoriaId }`.
 */
export const useEliminarSubcategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoriaId, subcategoriaId }: { categoriaId: number; subcategoriaId: number }) =>
      subcategoriasService.eliminar(categoriaId, subcategoriaId),
    onSuccess: (_, variables) => {
      // Invalidar y refetch inmediato de la lista de subcategorías de esa categoría
      queryClient.invalidateQueries({ 
        queryKey: subcategoriasKeys.list(variables.categoriaId),
        refetchType: 'active' // Fuerza refetch inmediato
      });
    },
  });
};
