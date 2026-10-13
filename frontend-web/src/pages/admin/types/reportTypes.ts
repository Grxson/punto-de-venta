/**
 * Tipos de la pantalla de Reportes y Cortes.
 * Reflejan los cálculos derivados de las respuestas de la API, ya normalizados
 * a `number` (PostgreSQL devuelve los `numeric` como texto).
 */

/** Totales agregados de un rango de fechas, calculados por el backend. */
export interface ResumenVentas {
  /** Fecha de referencia del resumen. */
  fecha: string;
  /** Ingreso bruto del rango. */
  totalVentas: number;
  /** Costo de los insumos consumidos en el rango. */
  totalCostos: number;
  /** Gastos operativos del rango, si el backend los incluye. */
  totalGastos?: number;
  /** Diferencia entre ventas y costos. */
  margenBruto: number;
  /** Número de tickets emitidos en el rango. */
  cantidadVentas: number;
  /** Unidades vendidas (suma de cantidades, no de líneas de venta). */
  itemsVendidos: number;
  /** `totalVentas / cantidadVentas`, en cero si no hubo ventas. */
  ticketPromedio: number;
  /** `margenBruto` expresado como porcentaje sobre las ventas. */
  margenPorcentaje: number;
}

/** Ficha de rendimiento de un producto dentro del rango. */
export interface ProductoRendimiento {
  /** Id del producto en catálogo. */
  productoId: number;
  /** Nombre del producto. */
  nombre: string;
  /** Precio de venta unitario. */
  precio: number;
  /** Costo estimado por unidad según la receta. */
  costoEstimado: number;
  /** `precio - costoEstimado`. */
  margenUnitario: number;
  /** `margenUnitario` como porcentaje sobre el precio. */
  margenPorcentaje: number;
  /** Unidades vendidas en el rango. */
  unidadesVendidas: number;
  /** `precio * unidadesVendidas`. */
  ingresoTotal: number;
  /** `costoEstimado * unidadesVendidas`. */
  costoTotal: number;
  /** `ingresoTotal - costoTotal`. */
  margenBrutoTotal: number;
}

/** Venta individual tal como la devuelve el endpoint de rango. */
export interface VentaDetalle {
  /** Id de la venta. */
  id: number;
  /** Folio legible del ticket. */
  folio: string;
  /** Fecha y hora de la venta en formato ISO. */
  fecha: string;
  /** Total cobrado del ticket. */
  total: number;
  /** Líneas de producto del ticket. */
  items: {
    /** Nombre del producto vendido. */
    productoNombre: string;
    /** Cantidad vendida. */
    cantidad: number;
    /** Precio unitario aplicado en la venta. */
    precioUnitario: number;
    /** `cantidad * precioUnitario`. */
    subtotal: number;
  }[];
  /** Pagos del ticket; hay más de uno cuando el cobro es mixto. */
  pagos: {
    /** Nombre del método de pago (Efectivo, Tarjeta, etc.). */
    metodoPagoNombre: string;
    /** Importe cubierto con este método. */
    monto: number;
  }[];
}

/** Acumulado por nombre de producto tras recorrer las ventas del rango. */
export interface ProductoAgrupado {
  /** Nombre del producto. */
  nombre: string;
  /** Suma de unidades vendidas. */
  cantidad: number;
  /** Suma de los subtotales. */
  total: number;
  /** Precio unitario de referencia. */
  precioUnitario: number;
}

/** Mapa método de pago -> importe cobrado. */
export interface MetodosPago {
  [metodo: string]: number;
}

/** Resultado de restar gastos a las ventas del rango. */
export interface GananciaCalculada {
  /** `totalVentas - gastos`. */
  neta: number;
  /** `neta` como porcentaje sobre `totalVentas`. */
  porcentaje: number;
  /** `true` si la ganancia es cero o positiva. */
  esPositiva: boolean;
}

/** Los dos netos que muestra el reporte de corte. */
export interface NetosCalculados {
  /** Efectivo cobrado menos gastos: el saldo real de caja. */
  efectivoMenosGastos: number;
  /** Todas las ventas menos gastos. */
  ventasMenosGastos: number;
}

/** Gasto individual del rango, ya con su categoría y proveedor resueltos. */
export interface GastoDetallado {
  /** Id del gasto. */
  id: number;
  /** Importe del gasto. */
  monto: number;
  /** Categoría del gasto (Insumos, Salarios, etc.). */
  categoriaGastoNombre: string;
  /** Proveedor asociado; `undefined` si el gasto no tiene. */
  proveedorNombre?: string;
  /** Nota o descripción del gasto. */
  nota: string;
  /** Fecha del gasto en formato ISO. */
  fecha: string;
}

/** Acumulado de gastos de un proveedor dentro de una categoría. */
export interface GastoPorProveedor {
  /** Nombre del proveedor, o `Sin proveedor`. */
  proveedorNombre: string;
  /** Suma de los gastos del proveedor en esa categoría. */
  monto: number;
  /** Gastos sueltos, para mostrarlos en tooltips. */
  gastosIndividuales?: GastoDetallado[];
}

/** Totales de una categoría de gasto. */
export interface GastosPorCategoria {
  /** Nombre de la categoría. */
  categoriaNombre: string;
  /** Suma de los gastos de la categoría. */
  totalGastos: number;
  /** Número de gastos incluidos en la categoría. */
  cantidad: number;
}

/** Vista anidada categoría -> proveedor usada en la tabla de gastos. */
export interface GastosPorCategoriaYProveedor {
  /** Nombre de la categoría. */
  categoriaNombre: string;
  /** Suma de los gastos de la categoría. */
  totalGastos: number;
  /** Número de proveedores de la categoría. */
  cantidad: number;
  /** Desglose por proveedor, ordenado de mayor a menor gasto. */
  gastosDetallados: GastoPorProveedor[];
}