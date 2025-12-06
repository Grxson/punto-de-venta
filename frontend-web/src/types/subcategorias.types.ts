/**
 * Tipos para subcategorías de productos
 */

export interface CategoriaSubcategoria {
  id?: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  orden?: number;
  activa?: boolean;
}

export interface CategoriaSubcategoriaFiltros {
  categoriaId: number;
}
