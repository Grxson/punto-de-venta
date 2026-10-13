import apiService from './api.service';

/**
 * DTO de Compra - Representa una compra de ingredientes
 */
export interface CompraListado {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  /** Fecha de la compra. */
  fecha: string;
  /** Estado del ciclo de vida de la compra. */
  estado: 'pendiente' | 'recibida' | 'cancelada' | 'rechazada';
  /** Importe total de la compra. */
  montoTotal: number;
  /** Número de líneas de la compra. */
  cantidadItems: number;
  /** Número de factura del proveedor, si lo hay. */
  numeroFactura?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Detalle completo de una compra, con sus líneas. */
export interface CompraDetalle extends CompraListado {
  /** Líneas de detalle de la compra. */
  items: CompraItem[];
  montoTotal: number;
  sucursalId?: number;
  sucursalNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  numeroFactura?: string;
  notas?: string;
}

/** Línea de detalle de una compra. */
export interface CompraItem {
  id: number;
  compraId: number;
  ingredienteId: number;
  ingredienteNombre: string;
  /** Cantidad pedida. */
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  /** Importe total de la línea. */
  precioTotal: number;
  /** Precio por unidad. */
  precioUnitario: number;
  /** Importe de la línea. */
  subtotal: number;
  /** Cantidad efectivamente recibida. */
  cantidadRecibida?: number;
}

/**
 * Request para crear una compra
 */
export interface CrearCompraRequest {
  proveedorId: number;
  fecha: string;
  /** Líneas de la compra. */
  items: {
    ingredienteId: number;
    /** Cantidad pedida. */
    cantidad: number;
    unidadId: number;
    /** Importe total de la línea. */
    precioTotal: number;
  }[];
  /** Observaciones libres sobre la compra. */
  observaciones?: string;
}

/**
 * Request para actualizar una compra
 */
export interface ActualizarCompraRequest {
  proveedorId: number;
  fecha: string;
  /** Líneas de la compra. */
  items: {
    ingredienteId: number;
    /** Cantidad pedida. */
    cantidad: number;
    unidadId: number;
    /** Importe total de la línea. */
    precioTotal: number;
  }[];
  /** Observaciones libres sobre la compra. */
  observaciones?: string;
}

/**
 * Request para recibir una compra
 */
export interface RecibirCompraRequest {
  /** Cantidades recibidas por cada línea de la compra. */
  items: {
    compraItemId: number;
    /** Cantidad efectivamente recibida. */
    cantidadRecibida: number;
  }[];
}

const BASE_URL = '/compras';

/**
 * Servicio para gestión de compras
 */
export const comprasService = {
  /**
   * Lista las compras de la sucursal actual (paginadas).
   *
   * @param page - Número de página (base 0).
   * @param size - Tamaño de página.
   * @returns El payload paginado de compras; si no hay datos, un objeto vacío.
   * @throws Error si el backend indica fallo.
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
   * Obtiene una compra completa por su ID.
   *
   * @param id - ID de la compra.
   * @returns El detalle de la compra.
   * @throws Error si el backend indica fallo.
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
   * Crea una compra nueva.
   *
   * @param data - Datos de la compra.
   * @returns El detalle de la compra creada.
   * @throws Error si el backend indica fallo.
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
   * Actualiza una compra existente.
   *
   * @param id - ID de la compra.
   * @param data - Datos de la compra.
   * @returns El detalle de la compra actualizada.
   * @throws Error si el backend indica fallo.
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
   * Elimina una compra de forma definitiva.
   *
   * @param id - ID de la compra.
   * @returns `undefined`; el método solo confirma el éxito.
   * @throws Error si el backend indica fallo.
   */
  async eliminar(id: number): Promise<void> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.delete<void>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Registra la recepción de una compra (cambia su estado a recibida).
   *
   * @param id - ID de la compra.
   * @param data - Cantidades recibidas por línea.
   * @returns El detalle de la compra recibida.
   * @throws Error si el backend indica fallo.
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
   * Obtiene las compras asociadas a un proveedor.
   *
   * @param proveedorId - ID del proveedor.
   * @param page - Número de página (base 0).
   * @param size - Tamaño de página.
   * @returns El payload paginado de compras; si no hay datos, un objeto vacío.
   * @throws Error si el backend indica fallo.
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
   * Filtra compras por rango de fechas y estado.
   *
   * @param inicio - Fecha inicial del rango.
   * @param fin - Fecha final del rango.
   * @param estado - Estado por el que filtrar; por defecto `pendiente`.
   * @returns La lista de compras coincidentes, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
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
