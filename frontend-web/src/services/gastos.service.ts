import apiService from './api.service';

/** Gasto financiero registrado en el sistema. */
export interface Gasto {
  id: number;
  categoriaGastoId: number;
  categoriaGastoNombre: string;
  proveedorId?: number;
  proveedorNombre?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  /** Monto del gasto. */
  monto: number;
  /** Fecha del gasto en formato ISO. */
  fecha: string;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  /** Referencia externa del gasto (p. ej. número de factura). */
  referencia?: string;
  nota?: string;
  /** URL del comprobante adjunto. */
  comprobanteUrl?: string;
  /** Clasificación del gasto (directo, indirecto, etc.). */
  tipoGasto?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  createdAt?: string;
}

const BASE_URL = '/finanzas/gastos';

export const gastosService = {
  /**
   * Busca gastos de la categoría "Insumos" para vincularlos con ingredientes.
   *
   * @param busqueda - Texto opcional de búsqueda.
   * @returns La lista de gastos coincidentes, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
   */
  async buscarInsumos(busqueda?: string): Promise<Gasto[]> {
    const endpoint = `${BASE_URL}/buscar-insumos`;
    const params = new URLSearchParams();
    if (busqueda) {
      params.append('busqueda', busqueda);
    }
    
    const response = await apiService.get<Gasto[]>(`${endpoint}${params.toString() ? '?' + params.toString() : ''}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  /**
   * Obtiene un gasto por su ID.
   *
   * @param id - ID del gasto.
   * @returns El gasto encontrado.
   * @throws Error si el backend indica fallo.
   */
  async obtenerPorId(id: number): Promise<Gasto> {
    const response = await apiService.get<Gasto>(`${BASE_URL}/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  /**
   * Obtiene todos los gastos.
   *
   * @returns La lista de gastos, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
   */
  async obtenerTodos(): Promise<Gasto[]> {
    const response = await apiService.get<Gasto[]>(BASE_URL);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },
};
