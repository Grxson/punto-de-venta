/**
 * Producto del catálogo, independiente de la sucursal.
 */
export interface ProductoDTO {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  categoria_id: number;
  precio_base: number;
  activo: boolean;
}

/**
 * Producto con los datos propios de una sucursal (precio y disponibilidad).
 */
export interface ProductoSucursalDTO extends ProductoDTO {
  precio_sucursal: number;
  disponible: number;
  orden_visualizacion: number;
}

/**
 * Categoría del menú.
 */
export interface CategoriaDTO {
  id: number;
  nombre: string;
  icono: string;
  orden: number;
  activa: boolean;
}

/**
 * Artículo del carrito de compra.
 */
export interface CarritoItem {
  producto: ProductoSucursalDTO;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/**
 * Filtros aplicables al menú.
 */
export interface MenuFilters {
  categoria?: number;
  busqueda?: string;
}

/**
 * Contrato del contexto del menú y el carrito.
 */
export interface MenuContextType {
  // Estado
  productos: ProductoSucursalDTO[];
  categorias: CategoriaDTO[];
  carrito: CarritoItem[];
  isLoading: boolean;
  error: string | null;
  
  // Propiedades derivadas
  productosAgrupados: Map<number, ProductoSucursalDTO[]>;
  totalCarrito: number;
  cantidadCarrito: number;
  
  // Métodos
  cargarProductos: (sucursalId: number) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  agregarAlCarrito: (producto: ProductoSucursalDTO, cantidad: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  limpiarCarrito: () => void;
  buscarProducto: (texto: string) => ProductoSucursalDTO[];
  filtrarPorCategoria: (categoriaId: number) => ProductoSucursalDTO[];
}
