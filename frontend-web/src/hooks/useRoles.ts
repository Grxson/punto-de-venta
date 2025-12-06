/**
 * Hooks de React Query para gestión de roles
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../services/roles.service';
import type { CrearRolRequest, EditarRolRequest } from '../types/rol.types';

// Query keys para roles
export const rolesKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesKeys.all, 'list'] as const,
  listActivos: () => [...rolesKeys.lists(), 'activos'] as const,
  listTodos: () => [...rolesKeys.lists(), 'todos'] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: number) => [...rolesKeys.details(), id] as const,
};

/**
 * Hook para obtener roles activos
 * Caché: 10 minutos (datos más estables)
 */
export const useRoles = () => {
  return useQuery({
    queryKey: rolesKeys.listActivos(),
    queryFn: () => rolesService.obtenerTodos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener todos los roles (incluyendo inactivos)
 */
export const useRolesConInactivos = () => {
  return useQuery({
    queryKey: rolesKeys.listTodos(),
    queryFn: () => rolesService.obtenerTodosConInactivos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener un rol por ID
 */
export const useRol = (id: number) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesService.obtenerPorId(id),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para crear un rol
 */
export const useCrearRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearRolRequest) => rolesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un rol
 */
export const useActualizarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarRolRequest }) =>
      rolesService.actualizar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

/**
 * Hook para desactivar un rol
 */
export const useDesactivarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

/**
 * Hook para reactivar un rol
 */
export const useReactivarRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesService.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};
