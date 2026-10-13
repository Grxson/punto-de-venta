/**
 * Servicio para gestión de productos
 */

import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { Producto, ProductoFiltros } from '../types/productos.types';

// Re-exportar tipos para compatibilidad
export type { Producto, ProductoFiltros } from '../types/productos.types';

export const productosService = {
  /**
   * Lista productos con filtros opcionales.
   *
   * @param filtros - Filtros de búsqueda (activo, enMenu, categoría, texto).
   * @returns La respuesta normalizada con la lista de productos.
   */
  listar: async (filtros?: ProductoFiltros) => {
    const params = new URLSearchParams();
    if (filtros?.activo !== undefined) {
      params.append('activo', filtros.activo.toString());
    }
    if (filtros?.enMenu !== undefined) {
      params.append('enMenu', filtros.enMenu.toString());
    }
    if (filtros?.categoriaId) {
      params.append('categoriaId', filtros.categoriaId.toString());
    }
    if (filtros?.q) {
      params.append('q', filtros.q);
    }
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `${API_ENDPOINTS.PRODUCTS}?${queryString}`
      : API_ENDPOINTS.PRODUCTS;
    
    return apiService.get<Producto[]>(endpoint);
  },

  /**
   * Obtiene un producto por su ID.
   *
   * @param id - ID del producto.
   * @returns La respuesta normalizada con el producto.
   */
  obtener: async (id: number) => {
    return apiService.get<Producto>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Crea un producto nuevo.
   *
   * @param producto - Datos del producto (sin `id` ni `variantes`).
   * @returns La respuesta normalizada con el producto creado.
   */
  crear: async (producto: Omit<Producto, 'id' | 'variantes'>) => {
    return apiService.post<Producto>(API_ENDPOINTS.PRODUCTS, producto);
  },

  /**
   * Actualiza un producto existente.
   *
   * @param id - ID del producto.
   * @param producto - Campos a actualizar (sin `id` ni `variantes`).
   * @returns La respuesta normalizada con el producto actualizado.
   */
  actualizar: async (id: number, producto: Partial<Omit<Producto, 'id' | 'variantes'>>) => {
    return apiService.put<Producto>(`${API_ENDPOINTS.PRODUCTS}/${id}`, producto);
  },

  /**
   * Cambia el estado del producto (activar o desactivar mediante baja lógica).
   *
   * @param id - ID del producto.
   * @param activo - Estado destino.
   * @returns La respuesta normalizada con el producto actualizado.
   */
  cambiarEstado: async (id: number, activo: boolean) => {
    return apiService.patch<Producto>(
      `${API_ENDPOINTS.PRODUCTS}/${id}/estado?activo=${activo}`,
      null
    );
  },

  /**
   * Elimina un producto mediante baja lógica.
   *
   * @param id - ID del producto.
   * @returns La respuesta normalizada de la eliminación.
   */
  eliminar: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Elimina un producto de forma definitiva (borrado físico); solo ADMIN.
   *
   * @param id - ID del producto.
   * @returns La respuesta normalizada de la eliminación.
   */
  eliminarDefinitivamente: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.PRODUCTS}/${id}/permanente`);
  },

  /**
   * Crea una variante de un producto base.
   *
   * @param productoBaseId - ID del producto base.
   * @param variante - Datos de la variante (sin `id` ni `variantes`).
   * @returns La respuesta normalizada con la variante creada.
   */
  crearVariante: async (productoBaseId: number, variante: Omit<Producto, 'id' | 'variantes'>) => {
    return apiService.post<Producto>(`${API_ENDPOINTS.PRODUCTS}/${productoBaseId}/variantes`, variante);
  },
};

