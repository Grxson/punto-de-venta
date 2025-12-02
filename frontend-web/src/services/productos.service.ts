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
   * Listar productos con filtros opcionales
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
   * Obtener producto por ID
   */
  obtener: async (id: number) => {
    return apiService.get<Producto>(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Crear nuevo producto
   */
  crear: async (producto: Omit<Producto, 'id' | 'variantes'>) => {
    return apiService.post<Producto>(API_ENDPOINTS.PRODUCTS, producto);
  },

  /**
   * Actualizar producto existente
   */
  actualizar: async (id: number, producto: Partial<Omit<Producto, 'id' | 'variantes'>>) => {
    return apiService.put<Producto>(`${API_ENDPOINTS.PRODUCTS}/${id}`, producto);
  },

  /**
   * Cambiar estado del producto (activar/desactivar - borrado lógico)
   */
  cambiarEstado: async (id: number, activo: boolean) => {
    return apiService.patch<Producto>(
      `${API_ENDPOINTS.PRODUCTS}/${id}/estado?activo=${activo}`,
      null
    );
  },

  /**
   * Eliminar producto (borrado lógico)
   */
  eliminar: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  /**
   * Eliminar producto definitivamente (hard delete) - Solo ADMIN
   */
  eliminarDefinitivamente: async (id: number) => {
    return apiService.delete(`${API_ENDPOINTS.PRODUCTS}/${id}/permanente`);
  },

  /**
   * Crear variante de un producto base
   */
  crearVariante: async (productoBaseId: number, variante: Omit<Producto, 'id' | 'variantes'>) => {
    return apiService.post<Producto>(`${API_ENDPOINTS.PRODUCTS}/${productoBaseId}/variantes`, variante);
  },
};

