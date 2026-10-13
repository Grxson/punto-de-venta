/**
 * Hooks de React Query para productos.
 * Implementan `cache` y sincronización de datos con el backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosService, type Producto, type ProductoFiltros } from '../services/productos.service';

/** Fábrica de claves de `cache` de React Query para productos. */
export const productosKeys = {
  all: ['productos'] as const,
  lists: () => [...productosKeys.all, 'list'] as const,
  list: (filtros?: ProductoFiltros) => [...productosKeys.lists(), filtros] as const,
  details: () => [...productosKeys.all, 'detail'] as const,
  detail: (id: number) => [...productosKeys.details(), id] as const,
};

/**
 * Lista productos, opcionalmente filtrados.
 *
 * @param filtros - Filtros de búsqueda enviados al servicio.
 * @returns Resultado de `useQuery` con la lista de productos. `cache`: 5 minutos.
 */
export const useProductos = (filtros?: ProductoFiltros) => {
  return useQuery({
    queryKey: productosKeys.list(filtros),
    queryFn: () => productosService.listar(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Obtiene un producto específico por su id.
 *
 * @param id - Id del producto; si no es válido, la consulta no se ejecuta.
 * @returns Resultado de `useQuery` con el detalle del producto. `cache`: 5 minutos.
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
 * Crea un producto e invalida las listas cacheadas.
 *
 * @returns Resultado de `useMutation` que espera los datos del producto sin `id` ni `variantes`.
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
 * Actualiza un producto e invalida listas y su detalle.
 * Lanza un error si el servicio responde sin éxito.
 *
 * @returns Resultado de `useMutation` que espera `{ id, producto }`.
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
 * Elimina un producto mediante borrado lógico e invalida las listas.
 *
 * @returns Resultado de `useMutation` que espera el `id` del producto.
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
 * Elimina un producto de forma definitiva e invalida las listas.
 * Lanza un error si el servicio responde sin éxito.
 *
 * @returns Resultado de `useMutation` que espera el `id` del producto.
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
 * Crea una variante de un producto e invalida las listas.
 * Lanza un error si el servicio responde sin éxito.
 *
 * @returns Resultado de `useMutation` que espera `{ productoBaseId, variante }`.
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
