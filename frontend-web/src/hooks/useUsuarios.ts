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
export const useCrearUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearUsuarioRequest) => usuariosService.crear(data),
    onSuccess: (_, data) => {
      console.log('✅ Usuario creado:', data);
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
 * Hook para actualizar un usuario
 */
export const useActualizarUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarUsuarioRequest }) =>
      usuariosService.actualizar(id, data),
    onSuccess: (_, { id, data }) => {
      console.log('✅ Usuario actualizado:', id);
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
 * Hook para cambiar rol de un usuario
 */
export const useCambiarRol = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rolId }: { id: number; rolId: number }) =>
      usuariosService.cambiarRol(id, rolId),
    onSuccess: (_, { id }) => {
      console.log('✅ Rol cambiado:', id);
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
 * Hook para desactivar un usuario
 */
export const useDesactivarUsuario = (sucursalId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.desactivar(id),
    onSuccess: (_, id) => {
      console.log('✅ Usuario desactivado:', id);
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
