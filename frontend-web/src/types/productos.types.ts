/**
 * Tipos de productos.
 */

/**
 * Producto del catálogo. El mismo tipo sirve para un producto base y para una
 * variante: la jerarquía se expresa con `productoBaseId`, no con un tipo aparte.
 */
export interface Producto {
  /** Ausente mientras el producto aún no se ha guardado. */
  id?: number;
  nombre: string;
  descripcion?: string | null;
  categoriaId?: number | null;
  categoriaNombre?: string | null;
  subcategoria?: string | null;
  precio: number;
  /** Coste estimado, usado para calcular margen y precio sugerido. */
  costoEstimado?: number | null;
  sku?: string | null;
  activo?: boolean;
  /** `true` si el producto aparece en la grilla del POS. */
  disponibleEnMenu?: boolean;
  /** ID del producto base; `null` si este producto no es variante. */
  productoBaseId?: number | null;
  /** Sufijo de la variante, p. ej. "Mediano". */
  nombreVariante?: string | null;
  /** Posición de la variante dentro de las variantes de su base. */
  ordenVariante?: number | null;
  /** Variantes colgantes; se cargan solo cuando la consulta las incluye. */
  variantes?: Producto[];
}

/** Filtros del listado de productos. */
export interface ProductoFiltros {
  activo?: boolean;
  /** Restringe a los productos visibles en el POS. */
  enMenu?: boolean;
  categoriaId?: number;
  /** Búsqueda libre por nombre o SKU. */
  q?: string;
}
