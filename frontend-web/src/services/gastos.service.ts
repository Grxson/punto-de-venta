import apiService from './api.service';

export interface Gasto {
  id: number;
  categoriaGastoId: number;
  categoriaGastoNombre: string;
  proveedorId?: number;
  proveedorNombre?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  monto: number;
  fecha: string;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  referencia?: string;
  nota?: string;
  comprobanteUrl?: string;
  tipoGasto?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  createdAt?: string;
}

const BASE_URL = '/finanzas/gastos';

export const gastosService = {
  /**
   * Buscar gastos de la categoría "Insumos" para vincular con ingredientes
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
   * Obtener gasto por ID
   */
  async obtenerPorId(id: number): Promise<Gasto> {
    const response = await apiService.get<Gasto>(`${BASE_URL}/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  /**
   * Obtener todos los gastos
   */
  async obtenerTodos(): Promise<Gasto[]> {
    const response = await apiService.get<Gasto[]>(BASE_URL);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },
};
