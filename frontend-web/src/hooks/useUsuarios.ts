/**
 * Hooks de React Query para gestión de usuarios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../types/usuario.types';

/**
 * Fábrica de claves de caché de React Query para usuarios.
 * Centralizarlas permite invalidar listas y detalles de forma coherente.
 */
export const usuariosKeys = {
  /** Prefijo común de todas las claves de usuarios. */
  all: ['usuarios'] as const,
  /** Prefijo de las listas de usuarios. */
  lists: () => [...usuariosKeys.all, 'list'] as const,
  /** Lista de usuarios de una sucursal, opcionalmente filtrada por estado activo. */
  listBySucursal: (sucursalId: number, activo?: boolean) =>
    [...usuariosKeys.lists(), { sucursalId, activo }] as const,
  /** Prefijo de los detalles de usuario. */
  details: () => [...usuariosKeys.all, 'detail'] as const,
  /** Detalle de un usuario concreto. */
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

/**
 * Hook para obtener usuarios de una sucursal.
 *
 * @param sucursalId - Id de la sucursal cuyos usuarios se quieren listar.
 * @param activo - Filtro opcional de estado: `true` solo activos, `false` solo inactivos, `undefined` ambos.
 * @returns Resultado de `useQuery` con la lista de usuarios de la sucursal.
 */
export const useUsuarios = (sucursalId: number, activo?: boolean) => {
  return useQuery({
    queryKey: usuariosKeys.listBySucursal(sucursalId, activo),
    queryFn: () => usuariosService.obtenerPorSucursal(sucursalId, activo),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener un usuario por su id.
 *
 * @param id - Id del usuario a consultar.
 * @returns Resultado de `useQuery` con el usuario solicitado.
 */
export const useUsuario = (id: number) => {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => usuariosService.obtenerPorId(id),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para crear un usuario.
 *
 * @param sucursalId - Sucursal cuya lista se invalida al terminar. Si se omite, se usa la del usuario creado.
 * @returns Resultado de `useMutation` que expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useCrearUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearUsuarioRequest) => usuariosService.crear(data),
    onSuccess: (_, data) => {
      // Invalidar cache específico de la sucursal si se conoce
      if (sucursalId) {
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(sucursalId) 
        });
      } else if (data.sucursalId) {
        // Si no se pasó sucursalId como param, usar del data
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(data.sucursalId) 
        });
      } else {
        // Último recurso: invalidar toda la caché de usuarios
        queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('❌ Error al crear usuario:', error);
    },
  });
};

/**
 * Hook para actualizar un usuario.
 *
 * @param sucursalId - Sucursal cuya lista se invalida al terminar. Si se omite, se usa la de los datos enviados.
 * @returns Resultado de `useMutation` que espera `{ id, data }` y expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useActualizarUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarUsuarioRequest }) =>
      usuariosService.actualizar(id, data),
    onSuccess: (_, { id, data }) => {
      // Invalidar cache específico del usuario y la sucursal
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      
      if (sucursalId) {
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(sucursalId) 
        });
      } else if (data.sucursalId) {
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(data.sucursalId) 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('❌ Error al actualizar usuario:', error);
    },
  });
};

/**
 * Hook para cambiar el rol de un usuario.
 *
 * @param sucursalId - Sucursal cuya lista se invalida al terminar.
 * @returns Resultado de `useMutation` que espera `{ id, rolId }` y expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useCambiarRol = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rolId }: { id: number; rolId: number }) =>
      usuariosService.cambiarRol(id, rolId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      
      if (sucursalId) {
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(sucursalId) 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('❌ Error al cambiar rol:', error);
    },
  });
};

/**
 * Hook para desactivar (borrado lógico) un usuario.
 *
 * @param sucursalId - Sucursal cuya lista se invalida al terminar.
 * @returns Resultado de `useMutation` que espera el `id` del usuario y expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useDesactivarUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.desactivar(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      
      if (sucursalId) {
        queryClient.invalidateQueries({ 
          queryKey: usuariosKeys.listBySucursal(sucursalId) 
        });
      } else {
        queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('❌ Error al desactivar usuario:', error);
    },
  });
};

/**
 * Hook para reactivar un usuario.
 *
 * @returns Resultado de `useMutation` que espera el `id` del usuario y expone `mutate`/`mutateAsync`, `isPending`, `error`, etc.
 */
export const useReactivarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};
