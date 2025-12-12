import apiService from './api.service';

export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion?: string;
  precioUnitario?: number;
  unidadId?: number;
  unidadNombre?: string;
  sucursalId?: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
  activo?: boolean;
}

export interface IngredienteReceta {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  mermaTeorica?: number;
}

const BASE_URL = '/ingredientes';

export const ingredientesService = {
  /**
   * Obtener todos los ingredientes activos de la sucursal actual
   */
  async obtenerActivos(): Promise<Ingrediente[]> {
    const endpoint = `/ingredientes/activos`;
    const response = await apiService.get<Ingrediente[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  /**
   * Obtener todos los ingredientes de la sucursal actual
   */
  async obtenerTodos(): Promise<Ingrediente[]> {
    const endpoint = `${BASE_URL}`;
    const response = await apiService.get<Ingrediente[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  /**
   * Obtener todas las unidades de medida disponibles
   */
  async obtenerUnidades(): Promise<Unidad[]> {
    const endpoint = `${BASE_URL}/unidades`;
    const response = await apiService.get<Unidad[]>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  /**
   * Crear un nuevo ingrediente
   */
  async crear(datos: Omit<Ingrediente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}`;
    const response = await apiService.post<Ingrediente>(endpoint, datos);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  /**
   * Actualizar un ingrediente existente
   */
  async actualizar(id: number, datos: Partial<Ingrediente>): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.put<Ingrediente>(endpoint, datos);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  /**
   * Eliminar un ingrediente
   */
  async eliminar(id: number): Promise<void> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.delete(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Obtener un ingrediente específico por ID
   */
  async obtenerPorId(id: number): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.get<Ingrediente>(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },
};
