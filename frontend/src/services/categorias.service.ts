/**
 * Servicio de API para Categorías y Subcategorías
 * Funciona con el backend REST en /api/categorias y /api/categorias/{id}/subcategorias
 */

import { apiService } from './api.service';
import {
  Categoria,
  CategoriaWithSubcategorias,
  Subcategoria,
  CreateSubcategoriaRequest,
  UpdateSubcategoriaRequest,
} from '../types/categorias.types';

class CategoriasService {
  private readonly baseUrl = '/categorias-productos';
  private readonly subcategoriasBaseUrl = '/categorias';

  /**
   * Obtener todas las categorías activas
   */
  async obtenerCategorias(): Promise<Categoria[]> {
    try {
      const response = await apiService.get<Categoria[]>(
        `${this.baseUrl}?activa=true`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al obtener categorías');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerCategorias:', error);
      throw error;
    }
  }

  /**
   * Obtener una categoría por ID
   */
  async obtenerCategoriaPorId(id: number): Promise<Categoria> {
    try {
      const response = await apiService.get<Categoria>(
        `${this.baseUrl}/${id}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Categoría no encontrada');
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Error en obtenerCategoriaPorId(${id}):`, error);
      throw error;
    }
  }

  /**
   * Obtener todas las subcategorías activas de una categoría
   */
  async obtenerSubcategorias(categoriaId: number): Promise<Subcategoria[]> {
    try {
      const response = await apiService.get<Subcategoria[]>(
        `${this.subcategoriasBaseUrl}/${categoriaId}/subcategorias`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al obtener subcategorías');
      }

      return response.data;
    } catch (error) {
      console.error(
        `❌ Error en obtenerSubcategorias(${categoriaId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener una categoría con sus subcategorías
   */
  async obtenerCategoriaConSubcategorias(
    categoriaId: number
  ): Promise<CategoriaWithSubcategorias> {
    try {
      const [categoria, subcategorias] = await Promise.all([
        this.obtenerCategoriaPorId(categoriaId),
        this.obtenerSubcategorias(categoriaId),
      ]);

      return {
        ...categoria,
        subcategorias: subcategorias.filter((s) => s.activa),
      };
    } catch (error) {
      console.error(
        `❌ Error en obtenerCategoriaConSubcategorias(${categoriaId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Crear una nueva subcategoría
   */
  async crearSubcategoria(
    categoriaId: number,
    datos: CreateSubcategoriaRequest
  ): Promise<Subcategoria> {
    try {
      const response = await apiService.post<Subcategoria>(
        `${this.subcategoriasBaseUrl}/${categoriaId}/subcategorias`,
        {
          ...datos,
          orden: datos.orden || 0,
          activa: datos.activa !== undefined ? datos.activa : true,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al crear subcategoría');
      }

      return response.data;
    } catch (error) {
      console.error(
        `❌ Error en crearSubcategoria(${categoriaId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualizar una subcategoría existente
   */
  async actualizarSubcategoria(
    categoriaId: number,
    subcategoriaId: number,
    datos: UpdateSubcategoriaRequest
  ): Promise<Subcategoria> {
    try {
      const response = await apiService.put<Subcategoria>(
        `${this.subcategoriasBaseUrl}/${categoriaId}/subcategorias/${subcategoriaId}`,
        datos
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al actualizar subcategoría');
      }

      return response.data;
    } catch (error) {
      console.error(
        `❌ Error en actualizarSubcategoria(${subcategoriaId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Eliminar una subcategoría (borrado lógico)
   */
  async eliminarSubcategoria(
    categoriaId: number,
    subcategoriaId: number
  ): Promise<void> {
    try {
      const response = await apiService.delete<void>(
        `${this.subcategoriasBaseUrl}/${categoriaId}/subcategorias/${subcategoriaId}`
      );

      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar subcategoría');
      }
    } catch (error) {
      console.error(
        `❌ Error en eliminarSubcategoria(${subcategoriaId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener todas las categorías con sus subcategorías
   */
  async obtenerTodasCategoriasConSubcategorias(): Promise<
    CategoriaWithSubcategorias[]
  > {
    try {
      const categorias = await this.obtenerCategorias();

      const categoriasConSubcategorias = await Promise.all(
        categorias.map((categoria) =>
          this.obtenerCategoriaConSubcategorias(categoria.id).catch(() => ({
            ...categoria,
            subcategorias: [],
          }))
        )
      );

      return categoriasConSubcategorias;
    } catch (error) {
      console.error(
        '❌ Error en obtenerTodasCategoriasConSubcategorias:',
        error
      );
      throw error;
    }
  }
}

// Singleton export
export const categoriasService = new CategoriasService();
