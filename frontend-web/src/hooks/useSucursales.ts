/**
 * Hooks de React Query para gestión de sucursales
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sucursalesService } from '../services/sucursales.service';
import type { CrearSucursalRequest, EditarSucursalRequest } from '../types/sucursal.types';

// Query keys para sucursales
export const sucursalesKeys = {
  all: ['sucursales'] as const,
  lists: () => [...sucursalesKeys.all, 'list'] as const,
  listActivas: () => [...sucursalesKeys.lists(), 'activas'] as const,
  listTodas: () => [...sucursalesKeys.lists(), 'todas'] as const,
  details: () => [...sucursalesKeys.all, 'detail'] as const,
  detail: (id: number) => [...sucursalesKeys.details(), id] as const,
};

/**
 * Hook para obtener sucursales activas
 * Caché: 10 minutos (datos muy estables)
 */
export const useSucursales = () => {
  return useQuery({
    queryKey: sucursalesKeys.listActivas(),
    queryFn: () => sucursalesService.obtenerTodas(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener todas las sucursales incluyendo inactivas
 */
export const useSucursalesConInactivas = () => {
  return useQuery({
    queryKey: sucursalesKeys.listTodas(),
    queryFn: () => sucursalesService.obtenerTodosConInactivos(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener una sucursal por ID
 */
export const useSucursal = (id: number) => {
  return useQuery({
    queryKey: sucursalesKeys.detail(id),
    queryFn: () => sucursalesService.obtenerPorId(id),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para crear una sucursal
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
 * Hook para actualizar una sucursal
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
 * Hook para desactivar una sucursal
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
 * Hook para reactivar una sucursal
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
