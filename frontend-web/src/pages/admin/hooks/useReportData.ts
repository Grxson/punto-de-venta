/**
 * Hook para cargar datos de reportes desde la API
 * Encapsula toda la lógica de llamadas a la API
 */

import { useCallback } from 'react';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { ResumenVentas, ProductoRendimiento, VentaDetalle, GastoDetallado } from '../types/reportTypes';

/** Resultado de una carga de reportes: datos ya normalizados a número. */
interface ReportDataResult {
  /** Totales del rango según el backend; `null` si ese endpoint falló. */
  resumen: ResumenVentas | null;
  /** Ranking de los 10 productos con mayor ingreso en el rango. */
  productosTop: ProductoRendimiento[];
  /** Ventas individuales del rango, base de los cálculos del cliente. */
  ventas: VentaDetalle[];
  /** Suma de los gastos del rango. */
  gastosDia: number;
  /** Gastos del rango con categoría y proveedor resueltos. */
  gastosDetallados: GastoDetallado[];
  /** Mensaje de error legible; `null` si la carga fue correcta. */
  error: string | null;
}

export const useReportData = () => {
  /**
   * Carga en paralelo los datos de reportes para un rango de fechas.
   * @remarks Nunca lanza excepción: los fallos se devuelven en `error` y el resto de
   * campos quedan vacíos, para que el reporte muestre ceros en vez de romperse.
   * Todos los importes pasan por `parseFloat` porque PostgreSQL devuelve los
   * `numeric` como texto.
   * @param desdeISO - Fecha inicial del rango en formato ISO.
   * @param hastaISO - Fecha final del rango en formato ISO.
   * @returns Objeto con los datos normalizados a número o el mensaje de error.
   */
  const loadReportData = useCallback(async (desdeISO: string, hastaISO: string): Promise<ReportDataResult> => {
    const result: ReportDataResult = {
      resumen: null,
      productosTop: [],
      ventas: [],
      gastosDia: 0,
      gastosDetallados: [],
      error: null,
    };

    try {
      const desdeQ = encodeURIComponent(desdeISO);
      const hastaQ = encodeURIComponent(hastaISO);

      // Auditoría 2026-09-11 (T1.3): las peticiones van en paralelo (antes eran
      // secuenciales y la latencia era la suma de los 4 endpoints). Un endpoint
      // agregado tipo /reportes/completo queda pendiente de decisión, ya que
      // implicaría un cambio de contrato.
      const [resumenResponse, productosResponse, ventasResponse, gastosResponse] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.STATS_SALES_RANGE}?desde=${desdeQ}&hasta=${hastaQ}`),
        apiService.get(`${API_ENDPOINTS.STATS_PRODUCTS_RANGE}?desde=${desdeQ}&hasta=${hastaQ}&limite=10`),
        apiService.get(`${API_ENDPOINTS.SALES}/rango?desde=${desdeQ}&hasta=${hastaQ}`),
        apiService.get(`${API_ENDPOINTS.GASTOS}?desde=${desdeQ}&hasta=${hastaQ}`).catch(() => null),
      ]);

      if (resumenResponse.success && resumenResponse.data) {
        const data = resumenResponse.data;
        result.resumen = {
          fecha: data.fecha || '',
          totalVentas: parseFloat(data.totalVentas) || 0,
          totalCostos: parseFloat(data.totalCostos) || 0,
          margenBruto: parseFloat(data.margenBruto) || 0,
          cantidadVentas: data.cantidadVentas || 0,
          itemsVendidos: data.itemsVendidos || 0,
          ticketPromedio: parseFloat(data.ticketPromedio) || 0,
          margenPorcentaje: parseFloat(data.margenPorcentaje) || 0,
        };
      }

      if (productosResponse.success && productosResponse.data) {
        result.productosTop = productosResponse.data.map((p: any) => ({
          productoId: p.productoId,
          nombre: p.nombre,
          precio: parseFloat(p.precio) || 0,
          costoEstimado: parseFloat(p.costoEstimado) || 0,
          margenUnitario: parseFloat(p.margenUnitario) || 0,
          margenPorcentaje: parseFloat(p.margenPorcentaje) || 0,
          unidadesVendidas: p.unidadesVendidas || 0,
          ingresoTotal: parseFloat(p.ingresoTotal) || 0,
          costoTotal: parseFloat(p.costoTotal) || 0,
          margenBrutoTotal: parseFloat(p.margenBrutoTotal) || 0,
        }));
      }

      if (ventasResponse.success && ventasResponse.data) {
        result.ventas = ventasResponse.data;
      }

      if (gastosResponse && gastosResponse.success && Array.isArray(gastosResponse.data)) {
        const desde = new Date(desdeISO);
        const hasta = new Date(hastaISO);

        // El backend no acota por hora, así que el día se recorta aquí: sin esto
        // el total del día arrastraría gastos de la tarde del último día del rango.
        const gastosFiltrados = gastosResponse.data.filter((g: any) => {
          const fechaGasto = g.fecha ? new Date(g.fecha) : null;
          return fechaGasto && fechaGasto >= desde && fechaGasto <= hasta;
        });

        result.gastosDetallados = gastosFiltrados.map((g: any) => ({
          id: g.id,
          monto: parseFloat(g.monto) || 0,
          categoriaGastoNombre: g.categoriaGastoNombre || 'Sin categoría',
          proveedorNombre: g.proveedorNombre || 'Sin proveedor',
          descripcion: g.descripcion || '',
          fecha: g.fecha || '',
        }));

        result.gastosDia = result.gastosDetallados.reduce((sum, gasto) => sum + gasto.monto, 0);
      } else {
        // Si el endpoint de gastos falla, el reporte se muestra sin gastos
        result.gastosDia = 0;
        result.gastosDetallados = [];
      }

      return result;
    } catch (err: any) {
      result.error = err.message || 'Error al cargar reportes';
      return result;
    }
  }, []);

  return {
    loadReportData,
  };
};
