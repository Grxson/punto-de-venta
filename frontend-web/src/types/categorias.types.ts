/**
 * Tipos de las categorías de productos.
 */

/** Categoría de productos del catálogo. */
export interface CategoriaProducto {
  /** Ausente antes de guardar la categoría. */
  id?: number;
  nombre: string;
  descripcion?: string | null;
  /** Posición de la categoría en el menú; menor valor, más arriba. */
  orden?: number;
  activa?: boolean;
}

/** Filtros del listado de categorías. */
export interface CategoriaFiltros {
  activa?: boolean;
  /** Búsqueda libre por nombre. */
  q?: string;
}
