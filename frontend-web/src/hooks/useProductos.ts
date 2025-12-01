/**
 * Hooks de React Query para productos
 * Implementa caché y sincronización de datos con el backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosService, type Producto, type ProductoFiltros } from '../services/productos.service';

// Query keys para productos
export const productosKeys = {
  all: ['productos'] as const,
  lists: () => [...productosKeys.all, 'list'] as const,
  list: (filtros?: ProductoFiltros) => [...productosKeys.lists(), filtros] as const,
  details: () => [...productosKeys.all, 'detail'] as const,
  detail: (id: number) => [...productosKeys.details(), id] as const,
};

/**
 * Hook para listar productos
 * Caché: 5 minutos (semi-estático)
 */
export const useProductos = (filtros?: ProductoFiltros) => {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => productosService.listar(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un producto específico
 * Caché: 5 minutos (semi-estático)
 */
export const useProducto = (id: number) => {
  return useQuery({
    queryKey: productosKeys.detail(id),
    queryFn: () => productosService.obtener(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id, // Solo ejecutar si hay ID válido
  });
};

/**
 * Hook para crear producto
 * Invalida automáticamente el caché de productos
 */
export const useCrearProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (producto: Omit<Producto, 'id' | 'variantes'>) => 
      productosService.crear(producto),
    onSuccess: () => {
      // Invalidar todas las listas de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar producto
 * Invalida automáticamente el caché
 */
export const useActualizarProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, producto }: { id: number; producto: Partial<Producto> }) => {
      const response = await productosService.actualizar(id, producto);
      
      // Si no fue exitoso, lanzar error con mensaje descriptivo
      if (!response.success) {
        const error = new Error(response.error || 'Error al actualizar el producto') as Error & { response?: typeof response };
        error.response = response;
        throw error;
      }
      
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidar listas y el detalle específico
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productosKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar producto (borrado lógico)
 * Invalida automáticamente el caché
 */
export const useEliminarProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productosService.eliminar(id),
    onSuccess: () => {
      // Invalidar todas las listas de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
    },
  });
};

/**
 * Hook para eliminar producto permanentemente
 * Invalida automáticamente el caché
 */
export const useEliminarProductoPermanente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await productosService.eliminarDefinitivamente(id);
      
      // Si no fue exitoso, lanzar error con mensaje descriptivo
      if (!response.success) {
        // response.error contiene el mensaje del servidor o genérico
        const error = new Error(response.error || 'Error al eliminar el producto') as Error & { response?: typeof response };
        // Adjuntar la respuesta completa para acceso posterior
        error.response = response;
        throw error;
      }
      
      return response;
    },
    onSuccess: () => {
      // Invalidar todas las listas de productos
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
    },
  });
};

/**
 * Hook para crear variante de un producto
 * Invalida automáticamente el caché
 */
export const useCrearVariante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productoBaseId, variante }: { productoBaseId: number; variante: Omit<Producto, 'id' | 'variantes'> }) => {
      const response = await productosService.crearVariante(productoBaseId, variante);
      
      // Si no fue exitoso, lanzar error con mensaje descriptivo
      if (!response.success) {
        const error = new Error(response.error || 'Error al crear la variante') as Error & { response?: typeof response };
        error.response = response;
        throw error;
      }
      
      return response;
    },
    onSuccess: () => {
      // Invalidar todas las listas de productos para refrescar
      queryClient.invalidateQueries({ queryKey: productosKeys.lists() });
    },
  });
};
