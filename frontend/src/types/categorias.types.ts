/**
 * Tipos e interfaces para Categorías y Subcategorías
 */

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface CategoriaWithSubcategorias extends Categoria {
  subcategorias?: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
}

export interface CreateSubcategoriaRequest {
  nombre: string;
  descripcion?: string;
  orden?: number;
  activa?: boolean;
}

export interface UpdateSubcategoriaRequest extends CreateSubcategoriaRequest {
  id?: number;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
