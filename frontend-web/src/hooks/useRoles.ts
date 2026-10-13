/**
 * Hooks de React Query para la gestión de roles.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesService } from '../services/roles.service';
import type { CrearRolRequest, EditarRolRequest } from '../types/rol.types';

/** Fábrica de claves de `cache` de React Query para roles. */
export const rolesKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesKeys.all, 'list'] as const,
  listActivos: () => [...rolesKeys.lists(), 'activos'] as const,
  listTodos: () => [...rolesKeys.lists(), 'todos'] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: number) => [...rolesKeys.details(), id] as const,
};

/**
 * Obtiene los roles activos.
 *
 * @returns Resultado de `useQuery` con los roles activos. `cache`: 10 minutos.
 */
export const useRoles = () => {
  return useQuery({
    queryKey: rolesKeys.listActivos(),
    queryFn: () => rolesService.obtenerTodos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Obtiene todos los roles, incluidos los inactivos.
 *
 * @returns Resultado de `useQuery` con la lista completa de roles.
 */
export const useRolesConInactivos = () => {
  return useQuery({
    queryKey: rolesKeys.listTodos(),
    queryFn: () => rolesService.obtenerTodosConInactivos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Obtiene un rol por su id.
 *
 * @param id - Id del rol a consultar.
 * @returns Resultado de `useQuery` con el detalle del rol.
 */
export const useRol = (id: number) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesService.obtenerPorId(id),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Crea un rol e invalida las listas cacheadas.
 *
 * @returns Resultado de `useMutation` que espera un `CrearRolRequest`.
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
 * Actualiza un rol e invalida su detalle y las listas.
 *
 * @returns Resultado de `useMutation` que espera `{ id, data }`.
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
 * Desactiva un rol e invalida las listas.
 *
 * @returns Resultado de `useMutation` que espera el `id` del rol.
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
 * Reactiva un rol e invalida las listas.
 *
 * @returns Resultado de `useMutation` que espera el `id` del rol.
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
