/**
 * Tipos para productos
 */

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  categoriaId?: number | null;
  categoriaNombre?: string | null;
  precio: number;
  costoEstimado?: number | null;
  sku?: string | null;
  activo?: boolean;
  disponibleEnMenu?: boolean;
  productoBaseId?: number | null;
  nombreVariante?: string | null;
  ordenVariante?: number | null;
  variantes?: Producto[];
}

export interface ProductoFiltros {
  activo?: boolean;
  enMenu?: boolean;
  categoriaId?: number;
  q?: string;
}

