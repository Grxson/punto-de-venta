import apiService from './api.service';

/**
 * DTO de Compra - Representa una compra de ingredientes
 */
export interface CompraListado {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  fecha: string;
  estado: 'pendiente' | 'recibida' | 'cancelada' | 'rechazada';
  montoTotal: number;
  cantidadItems: number;
  numeroFactura?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompraDetalle extends CompraListado {
  items: CompraItem[];
  montoTotal: number;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  numeroFactura?: string;
  notas?: string;
}

export interface CompraItem {
  id: number;
  compraId: number;
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  precioUnitario: number;
  subtotal: number;
  cantidadRecibida?: number;
}

/**
 * Request para crear una compra
 */
export interface CrearCompraRequest {
  proveedorId: number;
  fecha: string;
  items: {
    ingredienteId: number;
    cantidad: number;
    unidadId: number;
    precioUnitario: number;
  }[];
  observaciones?: string;
}

/**
 * Request para actualizar una compra
 */
export interface ActualizarCompraRequest {
  proveedorId: number;
  fecha: string;
  items: {
    ingredienteId: number;
    cantidad: number;
    unidadId: number;
    precioUnitario: number;
  }[];
  observaciones?: string;
}

/**
 * Request para recibir una compra
 */
export interface RecibirCompraRequest {
  items: {
    compraItemId: number;
    cantidadRecibida: number;
  }[];
}

const BASE_URL = '/compras';

/**
 * Servicio para gestión de compras
 */
export const comprasService = {
  /**
   * Listar todas las compras de la sucursal actual (paginadas)
   */
  async listar(page: number = 0, size: number = 20): Promise<any> {
    const endpoint = `${BASE_URL}?page=${page}&size=${size}`;
    const response = await apiService.get<any>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { content: [], totalElements: 0 };
  },

  /**
   * Obtener una compra completa por ID
   */
  async obtener(id: number): Promise<CompraDetalle> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.get<CompraDetalle>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || ({} as CompraDetalle);
  },

  /**
   * Crear una nueva compra
   */
  async crear(data: CrearCompraRequest): Promise<CompraDetalle> {
    const endpoint = BASE_URL;
    const response = await apiService.post<CompraDetalle>(endpoint, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || ({} as CompraDetalle);
  },

  /**
   * Actualizar una compra existente
   */
  async actualizar(id: number, data: ActualizarCompraRequest): Promise<CompraDetalle> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.put<CompraDetalle>(endpoint, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || ({} as CompraDetalle);
  },

  /**
   * Eliminar una compra (delete definitivo)
   */
  async eliminar(id: number): Promise<void> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.delete<void>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Registrar recepción de una compra (cambiar estado a recibida)
   */
  async recibirCompra(id: number, data: RecibirCompraRequest): Promise<CompraDetalle> {
    const endpoint = `${BASE_URL}/${id}/recibir`;
    const response = await apiService.post<CompraDetalle>(endpoint, data);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || ({} as CompraDetalle);
  },

  /**
   * Obtener compras por proveedor
   */
  async obtenerPorProveedor(proveedorId: number, page: number = 0, size: number = 20): Promise<any> {
    const endpoint = `${BASE_URL}/proveedor/${proveedorId}?page=${page}&size=${size}`;
    const response = await apiService.get<any>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { content: [], totalElements: 0 };
  },

  /**
   * Filtrar compras por rango de fechas y estado
   */
  async filtrar(
    inicio: string,
    fin: string,
    estado: 'pendiente' | 'recibida' | 'cancelada' | 'rechazada' = 'pendiente'
  ): Promise<CompraDetalle[]> {
    const endpoint = `${BASE_URL}/filtro?inicio=${inicio}&fin=${fin}&estado=${estado}`;
    const response = await apiService.get<CompraDetalle[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },
};
