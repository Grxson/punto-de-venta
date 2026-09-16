import apiService from './api.service';

export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion?: string;
  // Nombres del DTO del backend
  costoUnitarioBase?: number;
  unidadBaseId?: number;
  unidadBaseNombre?: string;
  unidadBaseAbreviatura?: string;
  sucursalId?: number;
  activo: boolean;
  // Vinculación con gasto
  gastoId?: number;
  costoTotalGasto?: number;
  unidadGastoId?: number;
  unidadGastoNombre?: string;
  unidadGastoAbreviatura?: string;
  factorConversion?: string;
  // Legacy (para compatibilidad con componentes)
  precioUnitario?: number;
  unidadId?: number;
  unidadNombre?: string;
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

interface ValidationErrorPayload {
  validationErrors: Record<string, unknown>;
}

const isValidationErrorPayload = (value: unknown): value is ValidationErrorPayload => {
  if (!value || typeof value !== 'object' || !('validationErrors' in value)) {
    return false;
  }

  const { validationErrors } = value as { validationErrors?: unknown };
  return Boolean(validationErrors && typeof validationErrors === 'object');
};

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
    // Mapear nombres del frontend a nombres del backend DTO
    const ingredienteDTO = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      costoUnitarioBase: datos.costoUnitarioBase,
      unidadBaseId: datos.unidadBaseId,
      activo: datos.activo,
      // VINCULACIÓN CON GASTO (AHORA INCLUIDA)
      gastoId: datos.gastoId || null,
      unidadGastoId: datos.unidadGastoId || null,
      ...(datos.factorConversion ? { factorConversion: datos.factorConversion } : {}),
      costoTotalGasto: datos.costoTotalGasto || null,
    };
    const response = await apiService.post<Ingrediente | ValidationErrorPayload>(endpoint, ingredienteDTO);
    if (response.error) {
      // Si hay validationErrors, incluirlos en el mensaje
      if (isValidationErrorPayload(response.data)) {
        const detalles = Object.entries(response.data.validationErrors)
          .map(([campo, mensaje]) => `${campo}: ${String(mensaje)}`)
          .join('; ');
        throw new Error(JSON.stringify({ message: detalles, validationErrors: response.data.validationErrors }));
      }
      throw new Error(response.error);
    }

    if (!response.data || isValidationErrorPayload(response.data)) {
      throw new Error('Respuesta inválida al crear el ingrediente');
    }

    return response.data;
  },

  /**
   * Actualizar un ingrediente existente
   */
  async actualizar(id: number, datos: Partial<Ingrediente>): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}/${id}`;
    // Mapear nombres del frontend a nombres del backend DTO
    const ingredienteDTO: any = {};
    if (datos.nombre !== undefined) ingredienteDTO.nombre = datos.nombre;
    if (datos.descripcion !== undefined) ingredienteDTO.descripcion = datos.descripcion;
    if (datos.costoUnitarioBase !== undefined) ingredienteDTO.costoUnitarioBase = datos.costoUnitarioBase;
    if (datos.unidadBaseId !== undefined) ingredienteDTO.unidadBaseId = datos.unidadBaseId;
    if (datos.activo !== undefined) ingredienteDTO.activo = datos.activo;
    // VINCULACIÓN CON GASTO (AHORA INCLUIDA)
    if (datos.gastoId !== undefined) ingredienteDTO.gastoId = datos.gastoId;
    if (datos.unidadGastoId !== undefined) ingredienteDTO.unidadGastoId = datos.unidadGastoId;
    if (datos.factorConversion !== undefined) ingredienteDTO.factorConversion = datos.factorConversion;
    if (datos.costoTotalGasto !== undefined) ingredienteDTO.costoTotalGasto = datos.costoTotalGasto;

    const response = await apiService.put<Ingrediente>(endpoint, ingredienteDTO);
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
