/**
 * Tipos de las subcategorías de productos.
 *
 * Una subcategoría siempre pertenece a una categoría: se identifica por la
 * pareja (`categoriaId`, `id`), por eso ambos IDs viajan siempre juntos.
 */

/** Subcategoría dentro de una categoría. */
export interface CategoriaSubcategoria {
  /** Ausente antes de guardar la subcategoría. */
  id?: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  orden?: number;
  activa?: boolean;
}

/** Filtros del listado de subcategorías; la categoría es obligatoria. */
export interface CategoriaSubcategoriaFiltros {
  categoriaId: number;
}
