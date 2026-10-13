/**
 * Hook para cálculos comunes en reportes
 * Agrupa lógica reutilizable para evitar código duplicado
 */

import type { VentaDetalle, ProductoAgrupado, MetodosPago, GananciaCalculada, NetosCalculados, GastoDetallado, GastosPorCategoria, GastosPorCategoriaYProveedor, GastoPorProveedor } from '../types/reportTypes';

export const useReportCalculations = () => {
  /**
   * Consolida los items de todas las ventas por nombre de producto.
   * @remarks El nombre es la clave porque el POS no garantiza el mismo id de
   * producto entre ventas antiguas y actuales.
   * @param ventas - Ventas del rango seleccionado en el filtro de reportes.
   * @returns Productos agrupados, ordenados de mayor a menor ingreso.
   */
  const agruparProductos = (ventas: VentaDetalle[]): ProductoAgrupado[] => {
    const productosAgrupados = ventas.reduce((acc, venta) => {
      venta.items.forEach((item) => {
        const key = item.productoNombre;
        if (!acc[key]) {
          acc[key] = {
            nombre: item.productoNombre,
            cantidad: 0,
            total: 0,
            precioUnitario: item.precioUnitario,
          };
        }
        acc[key].cantidad += item.cantidad;
        acc[key].total += item.subtotal;
      });
      return acc;
    }, {} as Record<string, ProductoAgrupado>);

    return Object.values(productosAgrupados).sort((a, b) => b.total - a.total);
  };

  /**
   * Suma los importes cobrados por cada método de pago.
   * @remarks Una venta puede tener varios pagos (pago mixto), por eso se recorren todos.
   * @param ventas - Ventas del rango seleccionado en el filtro de reportes.
   * @returns Mapa método de pago -> importe total cobrado.
   */
  const agruparMetodosPago = (ventas: VentaDetalle[]): MetodosPago => {
    return ventas.reduce((acc, venta) => {
      venta.pagos.forEach((pago) => {
        const metodo = pago.metodoPagoNombre;
        acc[metodo] = (acc[metodo] || 0) + pago.monto;
      });
      return acc;
    }, {} as MetodosPago);
  };

  /**
   * Suma el total cobrado en las ventas del rango.
   * @param ventas - Ventas del rango seleccionado en el filtro de reportes.
   * @returns Suma de los totales de las ventas.
   */
  const calcularTotalVentas = (ventas: VentaDetalle[]): number => {
    return ventas.reduce((sum, v) => sum + v.total, 0);
  };

  /**
   * Cuenta las unidades vendidas, no las líneas de venta.
   * @param ventas - Ventas del rango seleccionado en el filtro de reportes.
   * @returns Suma de la cantidad de items de todas las ventas.
   */
  const calcularTotalItems = (ventas: VentaDetalle[]): number => {
    return ventas.reduce((sum, v) => sum + v.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0);
  };

  /**
   * Calcula la ganancia neta restando los gastos a las ventas.
   * @param totalVentas - Ingreso total del periodo.
   * @param gastos - Gastos totales del periodo.
   * @returns Ganancia neta, su porcentaje sobre ventas y si es positiva.
   */
  const calcularGanancia = (totalVentas: number, gastos: number): GananciaCalculada => {
    const gananciaNeta = totalVentas - gastos;
    const gananciaPorcentaje = totalVentas > 0 ? (gananciaNeta / totalVentas) * 100 : 0;

    return {
      neta: gananciaNeta,
      porcentaje: gananciaPorcentaje,
      esPositiva: gananciaNeta >= 0,
    };
  };

  /**
   * Calcula los dos netos que muestra el reporte: sólo efectivo y ventas completas.
   * @remarks El neto por efectivo es el que el negocio usa para caja real, porque
   * las ventas con tarjeta no dejan saldo en el cajero.
   * @param metodosPago - Mapa método de pago -> importe cobrado.
   * @param totalVentas - Ingreso total del periodo.
   * @param gastos - Gastos totales del periodo.
   * @returns Neto del efectivo y neto de todas las ventas, ya descontados gastos.
   */
  const calcularNetos = (metodosPago: MetodosPago, totalVentas: number, gastos: number): NetosCalculados => {
    const efectivo = metodosPago['Efectivo'] || 0;
    const netoEfectivo = efectivo - gastos;
    const netoVentas = totalVentas - gastos;

    return {
      efectivoMenosGastos: netoEfectivo,
      ventasMenosGastos: netoVentas,
    };
  };

  /**
   * Agrupa gastos por categoría y, dentro de cada una, por proveedor.
   * @remarks Nivel 1: categoría (Insumos, Salarios, etc.). Nivel 2: proveedor.
   * Se conservan los gastos individuales para poder mostrarlos en tooltips.
   * @param gastos - Gastos filtrados por el rango de fechas del reporte.
   * @returns Categorías ordenadas de mayor a menor gasto, con sus proveedores.
   */
  const agruparGastosPorCategoriaYProveedor = (gastos: GastoDetallado[]): GastosPorCategoriaYProveedor[] => {
    // Paso 1: agrupar por categoría, conservando los gastos sin procesar
    const porCategoria = gastos.reduce((acc, gasto) => {
      const categoria = acc.find(g => g.categoriaNombre === gasto.categoriaGastoNombre);
      
      if (categoria) {
        categoria.gastosOriginales.push(gasto);
      } else {
        acc.push({
          categoriaNombre: gasto.categoriaGastoNombre,
          gastosOriginales: [gasto],
        });
      }
      
      return acc;
    }, [] as Array<{ categoriaNombre: string; gastosOriginales: GastoDetallado[] }>);

    // Paso 2: para cada categoría, agrupar por proveedor y calcular su total
    const resultado = porCategoria.map(cat => {
      // Agrupar por proveedor dentro de la categoría
      const proveedoresMap = new Map<string, { monto: number; gastos: GastoDetallado[] }>();
      let totalCategoria = 0;

      cat.gastosOriginales.forEach(gasto => {
        const proveedorNombre = gasto.proveedorNombre || 'Sin proveedor';
        const existing = proveedoresMap.get(proveedorNombre) || { monto: 0, gastos: [] };
        existing.monto += gasto.monto;
        existing.gastos.push(gasto);
        proveedoresMap.set(proveedorNombre, existing);
        totalCategoria += gasto.monto;
      });

      // El tooltip del proveedor se ordena del gasto más reciente al más antiguo
      const gastosOrdenados: GastoPorProveedor[] = Array.from(
        proveedoresMap,
        ([proveedorNombre, { monto, gastos }]) => ({
          proveedorNombre,
          monto,
          gastosIndividuales: gastos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
        })
      ).sort((a, b) => b.monto - a.monto);

      return {
        categoriaNombre: cat.categoriaNombre,
        totalGastos: totalCategoria,
        cantidad: gastosOrdenados.length,
        gastosDetallados: gastosOrdenados,
      };
    });

    // Paso 3: ordenar categorías por gasto total, de mayor a menor
    return resultado.sort((a, b) => b.totalGastos - a.totalGastos);
  };

  return {
    agruparProductos,
    agruparMetodosPago,
    calcularTotalVentas,
    calcularTotalItems,
    calcularGanancia,
    calcularNetos,
    agruparGastosPorCategoriaYProveedor,
  };
};
