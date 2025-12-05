/**
 * Hook personalizado para gestionar categorías y subcategorías
 */

import { useState, useCallback, useEffect } from 'react';
import { categoriasService } from '../services/categorias.service';
import {
  Categoria,
  Subcategoria,
  CategoriaWithSubcategorias,
  CreateSubcategoriaRequest,
  UpdateSubcategoriaRequest,
} from '../types/categorias.types';

interface UseCategoriesState {
  categorias: Categoria[];
  categoriasConSubs: CategoriaWithSubcategorias[];
  subcategorias: Subcategoria[];
  loading: boolean;
  error: string | null;
}

interface UseCategoriesActions {
  cargarCategorias: () => Promise<void>;
  cargarSubcategorias: (categoriaId: number) => Promise<void>;
  cargarTodasConSubcategorias: () => Promise<void>;
  crearSubcategoria: (
    categoriaId: number,
    datos: CreateSubcategoriaRequest
  ) => Promise<Subcategoria>;
  actualizarSubcategoria: (
    categoriaId: number,
    subcategoriaId: number,
    datos: UpdateSubcategoriaRequest
  ) => Promise<Subcategoria>;
  eliminarSubcategoria: (
    categoriaId: number,
    subcategoriaId: number
  ) => Promise<void>;
  limpiarError: () => void;
}

export interface UseCategoriasReturn extends UseCategoriesState, UseCategoriesActions {}

/**
 * Hook para gestionar categorías y subcategorías
 * 
 * Ejemplo de uso:
 * 
 * const {
 *   categorias,
 *   subcategorias,
 *   loading,
 *   error,
 *   cargarCategorias,
 *   crearSubcategoria,
 * } = useCategorias();
 * 
 * useEffect(() => {
 *   cargarCategorias();
 * }, []);
 */
export function useCategorias(): UseCategoriasReturn {
  const [state, setState] = useState<UseCategoriesState>({
    categorias: [],
    categoriasConSubs: [],
    subcategorias: [],
    loading: false,
    error: null,
  });

  // Cargar todas las categorías
  const cargarCategorias = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const categorias = await categoriasService.obtenerCategorias();
      setState((prev) => ({
        ...prev,
        categorias,
        loading: false,
      }));
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        error: mensaje,
        loading: false,
      }));
      console.error('❌ Error al cargar categorías:', error);
    }
  }, []);

  // Cargar subcategorías de una categoría
  const cargarSubcategorias = useCallback(async (categoriaId: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const subcategorias =
        await categoriasService.obtenerSubcategorias(categoriaId);
      setState((prev) => ({
        ...prev,
        subcategorias,
        loading: false,
      }));
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        error: mensaje,
        loading: false,
      }));
      console.error('❌ Error al cargar subcategorías:', error);
    }
  }, []);

  // Cargar todas las categorías con sus subcategorías
  const cargarTodasConSubcategorias = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const categoriasConSubs =
        await categoriasService.obtenerTodasCategoriasConSubcategorias();
      setState((prev) => ({
        ...prev,
        categoriasConSubs,
        loading: false,
      }));
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({
        ...prev,
        error: mensaje,
        loading: false,
      }));
      console.error('❌ Error al cargar categorías con subcategorías:', error);
    }
  }, []);

  // Crear subcategoría
  const crearSubcategoria = useCallback(
    async (
      categoriaId: number,
      datos: CreateSubcategoriaRequest
    ): Promise<Subcategoria> => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const subcategoria = await categoriasService.crearSubcategoria(
          categoriaId,
          datos
        );

        // Actualizar lista local si está disponible
        setState((prev) => ({
          ...prev,
          subcategorias: [...prev.subcategorias, subcategoria],
        }));

        return subcategoria;
      } catch (error) {
        const mensaje =
          error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          error: mensaje,
        }));
        throw error;
      }
    },
    []
  );

  // Actualizar subcategoría
  const actualizarSubcategoria = useCallback(
    async (
      categoriaId: number,
      subcategoriaId: number,
      datos: UpdateSubcategoriaRequest
    ): Promise<Subcategoria> => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const subcategoriaActualizada =
          await categoriasService.actualizarSubcategoria(
            categoriaId,
            subcategoriaId,
            datos
          );

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          subcategorias: prev.subcategorias.map((s) =>
            s.id === subcategoriaId ? subcategoriaActualizada : s
          ),
        }));

        return subcategoriaActualizada;
      } catch (error) {
        const mensaje =
          error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          error: mensaje,
        }));
        throw error;
      }
    },
    []
  );

  // Eliminar subcategoría
  const eliminarSubcategoria = useCallback(
    async (categoriaId: number, subcategoriaId: number): Promise<void> => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await categoriasService.eliminarSubcategoria(
          categoriaId,
          subcategoriaId
        );

        // Actualizar lista local
        setState((prev) => ({
          ...prev,
          subcategorias: prev.subcategorias.filter(
            (s) => s.id !== subcategoriaId
          ),
        }));
      } catch (error) {
        const mensaje =
          error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({
          ...prev,
          error: mensaje,
        }));
        throw error;
      }
    },
    []
  );

  // Limpiar error
  const limpiarError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    cargarCategorias,
    cargarSubcategorias,
    cargarTodasConSubcategorias,
    crearSubcategoria,
    actualizarSubcategoria,
    eliminarSubcategoria,
    limpiarError,
  };
}
