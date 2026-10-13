/**
 * Hooks de React Query para la gestión de sucursales.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sucursalesService } from '../services/sucursales.service';
import type { CrearSucursalRequest, EditarSucursalRequest } from '../types/sucursal.types';

/** Fábrica de claves de `cache` de React Query para sucursales. */
export const sucursalesKeys = {
  all: ['sucursales'] as const,
  lists: () => [...sucursalesKeys.all, 'list'] as const,
  listActivas: () => [...sucursalesKeys.lists(), 'activas'] as const,
  listTodas: () => [...sucursalesKeys.lists(), 'todas'] as const,
  details: () => [...sucursalesKeys.all, 'detail'] as const,
  detail: (id: number) => [...sucursalesKeys.details(), id] as const,
};

/**
 * Obtiene las sucursales activas.
 *
 * @returns Resultado de `useQuery` con las sucursales activas. `cache`: 10 minutos.
 */
export const useSucursales = () => {
  return useQuery({
    queryKey: sucursalesKeys.listActivas(),
    queryFn: () => sucursalesService.obtenerTodas(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Obtiene todas las sucursales, incluidas las inactivas.
 *
 * @returns Resultado de `useQuery` con la lista completa de sucursales.
 */
export const useSucursalesConInactivas = () => {
  return useQuery({
    queryKey: sucursalesKeys.listTodas(),
    queryFn: () => sucursalesService.obtenerTodosConInactivos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Obtiene una sucursal por su id.
 *
 * @param id - Id de la sucursal a consultar.
 * @returns Resultado de `useQuery` con el detalle de la sucursal.
 */
export const useSucursal = (id: number) => {
  return useQuery({
    queryKey: sucursalesKeys.detail(id),
    queryFn: () => sucursalesService.obtenerPorId(id),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Crea una sucursal e invalida las listas cacheadas.
 *
 * @returns Resultado de `useMutation` que espera un `CrearSucursalRequest`.
 */
export const useCrearSucursal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearSucursalRequest) => sucursalesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() });
    },
  });
};

/**
 * Actualiza una sucursal e invalida su detalle y las listas.
 *
 * @returns Resultado de `useMutation` que espera `{ id, data }`.
 */
export const useActualizarSucursal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditarSucursalRequest }) =>
      sucursalesService.actualizar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() });
    },
  });
};

/**
 * Desactiva una sucursal e invalida las listas.
 *
 * @returns Resultado de `useMutation` que espera el `id` de la sucursal.
 */
export const useDesactivarSucursal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sucursalesService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() });
    },
  });
};

/**
 * Reactiva una sucursal e invalida las listas.
 *
 * @returns Resultado de `useMutation` que espera el `id` de la sucursal.
 */
export const useReactivarSucursal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sucursalesService.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sucursalesKeys.lists() });
    },
  });
};
