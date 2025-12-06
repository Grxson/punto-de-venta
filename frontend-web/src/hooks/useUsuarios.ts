/**
 * Hooks de React Query para gestión de usuarios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../types/usuario.types';

// Query keys para usuarios
export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  listBySucursal: (sucursalId: number, activo?: boolean) =>
    [...usuariosKeys.lists(), { sucursalId, activo }] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
};

/**
 * Hook para obtener usuarios de una sucursal
 * Caché: 5 minutos
 */
export const useUsuarios = (sucursalId: number, activo?: boolean) => {
  return useQuery({
    queryKey: usuariosKeys.listBySucursal(sucursalId, activo),
    queryFn: () => usuariosService.obtenerPorSucursal(sucursalId, activo),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener un usuario por ID
 */
export const useUsuario = (id: number) => {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => usuariosService.obtenerPorId(id),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para crear un usuario
 */
export const useCrearUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearUsuarioRequest) => usuariosService.crear(data),
    onSuccess: () => {
      // Invalidar cache de usuarios
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un usuario
 */
export const useActualizarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarUsuarioRequest }) =>
      usuariosService.actualizar(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar cache específico del usuario y lista
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};

/**
 * Hook para cambiar rol de un usuario
 */
export const useCambiarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rolId }: { id: number; rolId: number }) =>
      usuariosService.cambiarRol(id, rolId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};

/**
 * Hook para desactivar un usuario
 */
export const useDesactivarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
};

/**
 * Hook para reactivar un usuario
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
