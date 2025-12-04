/**
 * Tipos para reportes y cortes
 */

export interface ResumenVentas {
  fecha: string;
  totalVentas: number;
  totalCostos: number;
  margenBruto: number;
  cantidadVentas: number;
  itemsVendidos: number;
  ticketPromedio: number;
  margenPorcentaje: number;
}

export interface ProductoRendimiento {
  productoId: number;
  nombre: string;
  precio: number;
  costoEstimado: number;
  margenUnitario: number;
  margenPorcentaje: number;
  unidadesVendidas: number;
  ingresoTotal: number;
  costoTotal: number;
  margenBrutoTotal: number;
}

export interface VentaDetalle {
  id: number;
  folio: string;
  fecha: string;
  total: number;
  items: {
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  pagos: {
    metodoPagoNombre: string;
    monto: number;
  }[];
}

export interface ProductoAgrupado {
  nombre: string;
  cantidad: number;
  total: number;
  precioUnitario: number;
}

export interface MetodosPago {
  [metodo: string]: number;
}

export interface GananciaCalculada {
  neta: number;
  porcentaje: number;
  esPositiva: boolean;
}

export interface NetosCalculados {
  efectivoMenosGastos: number;
  ventasMenosGastos: number;
}

export interface GastoDetallado {
  id: number;
  monto: number;
  categoriaGastoNombre: string;
  proveedorNombre?: string;
  nota: string;
  fecha: string;
}

export interface GastoPorProveedor {
  proveedorNombre: string;
  monto: number;
  gastosIndividuales?: GastoDetallado[]; // Gastos individuales de este proveedor
}

export interface GastosPorCategoria {
  categoriaNombre: string;
  totalGastos: number;
  cantidad: number;
}

export interface GastosPorCategoriaYProveedor {
  categoriaNombre: string;
  totalGastos: number;
  cantidad: number;
  gastosDetallados: GastoPorProveedor[];
}
