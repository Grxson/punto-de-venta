import apiService from './api.service';

export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion?: string;
  // Nombres usados por el DTO del backend
  /** Coste por unidad base. */
  costoUnitarioBase?: number;
  unidadBaseId?: number;
  unidadBaseNombre?: string;
  unidadBaseAbreviatura?: string;
  sucursalId?: number;
  activo: boolean;
  // Vinculación con gasto
  /** ID del gasto de insumos que respalda el coste. */
  gastoId?: number;
  /** Coste total del gasto asociado. */
  costoTotalGasto?: number;
  unidadGastoId?: number;
  unidadGastoNombre?: string;
  unidadGastoAbreviatura?: string;
  /** Factor para convertir unidades del gasto a unidades base. */
  factorConversion?: string;
  // Campos heredados (compatibilidad con componentes)
  precioUnitario?: number;
  unidadId?: number;
  unidadNombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Unidad de medida usada por ingredientes y recetas. */
export interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
  activo?: boolean;
}

/** Ingrediente dentro de una receta, con su cantidad y unidad. */
export interface IngredienteReceta {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  /** Merma teórica esperada del ingrediente, si se conoce. */
  mermaTeorica?: number;
}

/** Respuesta de validación del backend con errores por campo. */
interface ValidationErrorPayload {
  validationErrors: Record<string, unknown>;
}

/**
 * Comprueba si un valor tiene la forma de `ValidationErrorPayload`.
 *
 * @param value - Valor a inspeccionar.
 * @returns `true` si contiene un objeto `validationErrors` válido.
 */
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
   * Obtiene todos los ingredientes activos de la sucursal actual.
   *
   * @returns La lista de ingredientes activos, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
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
   * Obtiene todos los ingredientes de la sucursal actual.
   *
   * @returns La lista de ingredientes, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
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
   * Obtiene todas las unidades de medida disponibles.
   *
   * @returns La lista de unidades, o `[]` si no hay datos.
   * @throws Error si el backend indica fallo.
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
   * Crea un ingrediente nuevo.
   *
   * @param datos - Datos del ingrediente (sin `id`, `createdAt` ni `updatedAt`).
   * @returns El ingrediente creado.
   * @throws Error si el backend indica fallo, incluida la validación por campo.
   */
  async crear(datos: Omit<Ingrediente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}`;
    // Mapear nombres del frontend a los del DTO del backend
    const ingredienteDTO = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      costoUnitarioBase: datos.costoUnitarioBase,
      unidadBaseId: datos.unidadBaseId,
      activo: datos.activo,
      // Vinculación con gasto (incluida en el DTO)
      gastoId: datos.gastoId || null,
      unidadGastoId: datos.unidadGastoId || null,
      ...(datos.factorConversion ? { factorConversion: datos.factorConversion } : {}),
      costoTotalGasto: datos.costoTotalGasto || null,
    };
    const response = await apiService.post<Ingrediente | ValidationErrorPayload>(endpoint, ingredienteDTO);
    if (response.error) {
      // Si hay validationErrors, se incluyen en el mensaje
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
   * Actualiza un ingrediente existente.
   *
   * @param id - ID del ingrediente.
   * @param datos - Campos a actualizar.
   * @returns El ingrediente actualizado.
   * @throws Error si el backend indica fallo.
   */
  async actualizar(id: number, datos: Partial<Ingrediente>): Promise<Ingrediente> {
    const endpoint = `${BASE_URL}/${id}`;
    // Mapear nombres del frontend a los del DTO del backend
    const ingredienteDTO: any = {};
    if (datos.nombre !== undefined) ingredienteDTO.nombre = datos.nombre;
    if (datos.descripcion !== undefined) ingredienteDTO.descripcion = datos.descripcion;
    if (datos.costoUnitarioBase !== undefined) ingredienteDTO.costoUnitarioBase = datos.costoUnitarioBase;
    if (datos.unidadBaseId !== undefined) ingredienteDTO.unidadBaseId = datos.unidadBaseId;
    if (datos.activo !== undefined) ingredienteDTO.activo = datos.activo;
    // Vinculación con gasto (incluida en el DTO)
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
   * Elimina un ingrediente.
   *
   * @param id - ID del ingrediente.
   * @returns `undefined`; el método solo confirma el éxito.
   * @throws Error si el backend indica fallo.
   */
  async eliminar(id: number): Promise<void> {
    const endpoint = `${BASE_URL}/${id}`;
    const response = await apiService.delete(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Obtiene un ingrediente específico por su ID.
   *
   * @param id - ID del ingrediente.
   * @returns El ingrediente encontrado.
   * @throws Error si el backend indica fallo.
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
