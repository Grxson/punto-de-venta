/**
 * Hook para cálculos comunes en reportes
 * Agrupa lógica reutilizable para evitar código duplicado
 */

import type { VentaDetalle, ProductoAgrupado, MetodosPago, GananciaCalculada, NetosCalculados, GastoDetallado, GastosPorCategoria, GastosPorCategoriaYProveedor, GastoPorProveedor } from '../types/reportTypes';

export const useReportCalculations = () => {
  /**
   * Agrupa ventas por producto
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
   * Agrupa métodos de pago de las ventas
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
   * Calcula el total de ventas
   */
  const calcularTotalVentas = (ventas: VentaDetalle[]): number => {
    return ventas.reduce((sum, v) => sum + v.total, 0);
  };

  /**
   * Calcula el total de items vendidos
   */
  const calcularTotalItems = (ventas: VentaDetalle[]): number => {
    return ventas.reduce((sum, v) => sum + v.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0);
  };

  /**
   * Calcula ganancia neta
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
   * Calcula netos (dos formas)
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
   * Agrupa gastos por categoría Y proveedor (anidado)
   * Nivel 1: Categoría (Insumos, Salarios, etc.)
   * Nivel 2: Proveedor (dentro de cada categoría)
   * Incluye los gastos individuales para tooltip
   */
  const agruparGastosPorCategoriaYProveedor = (gastos: GastoDetallado[]): GastosPorCategoriaYProveedor[] => {
    // Paso 1: Agrupar por categoría, manteniendo gastos originales
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

    // Paso 2: Para cada categoría, agrupar proveedores y calcular totales
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

      // Convertir map a array y ordenar por monto
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

    // Paso 3: Ordenar categorías por gasto total (mayor primero)
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
