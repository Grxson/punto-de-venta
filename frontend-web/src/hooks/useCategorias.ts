/**
 * Hooks de React Query para categorías de productos
 * Implementa caché y sincronización de datos con el backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasService, type CategoriaProducto, type CategoriaFiltros } from '../services/categorias.service';

// Query keys para categorías
export const categoriasKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriasKeys.all, 'list'] as const,
  list: (filtros?: CategoriaFiltros) => [...categoriasKeys.lists(), filtros] as const,
  details: () => [...categoriasKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoriasKeys.details(), id] as const,
};

/**
 * Hook para listar categorías
 * Caché: 10 minutos (estático - catálogo)
 */
export const useCategorias = (filtros?: CategoriaFiltros) => {
  return useQuery({
    queryKey: categoriasKeys.list(filtros),
    queryFn: () => categoriasService.listar(filtros),
    staleTime: 10 * 60 * 1000, // 10 minutos - dato estático
  });
};

/**
 * Hook para obtener una categoría específica
 * Caché: 10 minutos (estático - catálogo)
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
 * Hook para crear categoría
 * Invalida automáticamente el caché de categorías
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
 * Hook para actualizar categoría
 * Invalida automáticamente el caché
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
 * Hook para eliminar categoría
 * Invalida automáticamente el caché
 */
export const useEliminarCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriasService.eliminar(id),
    onSuccess: () => {
      // Invalidar todas las listas de categorías
      queryClient.invalidateQueries({ queryKey: categoriasKeys.lists() });
    },
  });
};
