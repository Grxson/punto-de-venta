/**
 * Tipos para categorías de productos
 */

export interface CategoriaProducto {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  orden?: number;
  activa?: boolean;
}

export interface CategoriaFiltros {
  activa?: boolean;
  q?: string;
}

