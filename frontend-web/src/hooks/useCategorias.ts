/**
 * Hooks de React Query para categorías de productos.
 * Implementan `cache` y sincronización de datos con el backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasService, type CategoriaProducto, type CategoriaFiltros } from '../services/categorias.service';

/** Fábrica de claves de `cache` de React Query para categorías. */
export const categoriasKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriasKeys.all, 'list'] as const,
  list: (filtros?: CategoriaFiltros) => [...categoriasKeys.lists(), filtros] as const,
  details: () => [...categoriasKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoriasKeys.details(), id] as const,
};

/**
 * Lista categorías, opcionalmente filtradas.
 *
 * @param filtros - Filtros de búsqueda enviados al servicio.
 * @returns Resultado de `useQuery` con la lista de categorías. `cache`: 10 minutos (catálogo estático).
 */
export const useCategorias = (filtros?: CategoriaFiltros) => {
  return useQuery({
    queryKey: categoriasKeys.list(filtros),
    queryFn: () => categoriasService.listar(filtros),
    staleTime: 10 * 60 * 1000, // 10 minutos - dato estático
  });
};

/**
 * Obtiene una categoría específica por su id.
 *
 * @param id - Id de la categoría; si no es válido, la consulta no se ejecuta.
 * @returns Resultado de `useQuery` con el detalle de la categoría.
 */
export const useCategoria = (id: number) => {
  return useQuery({
    queryKey: categoriasKeys.detail(id),
    queryFn: () => categoriasService.obtener(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id, // Solo ejecutar si hay ID válido
  });
};

/**
 * Crea una categoría e invalida las listas cacheadas.
 *
 * @returns Resultado de `useMutation` que expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useCrearCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoria: Omit<CategoriaProducto, 'id'>) => 
      categoriasService.crear(categoria),
    onSuccess: () => {
      // Invalidar todas las listas de categorías
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
    },
  });
};

/**
 * Actualiza una categoría e invalida listas y su detalle.
 *
 * @returns Resultado de `useMutation` que espera `{ id, categoria }`.
 */
export const useActualizarCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, categoria }: { id: number; categoria: Partial<CategoriaProducto> }) =>
      categoriasService.actualizar(id, categoria),
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriasKeys.detail(variables.id) });
    },
  });
};

/**
 * Elimina una categoría e invalida las listas con `refetch` inmediato.
 *
 * @returns Resultado de `useMutation` que espera el `id` de la categoría.
 */
export const useEliminarCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriasService.eliminar(id),
    onSuccess: () => {
      // Invalidar y refetch inmediato de todas las listas de categorías
      queryClient.invalidateQueries({ 
        queryKey: categoriasKeys.lists(),
        refetchType: 'active' // Fuerza refetch inmediato
      });
    },
  });
};
