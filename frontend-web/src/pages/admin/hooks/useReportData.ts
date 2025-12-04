/**
 * Hook para cargar datos de reportes desde la API
 * Encapsula toda la lógica de llamadas a la API
 */

import { useCallback } from 'react';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { ResumenVentas, ProductoRendimiento, VentaDetalle, GastoDetallado } from '../types/reportTypes';

interface ReportDataResult {
  resumen: ResumenVentas | null;
  productosTop: ProductoRendimiento[];
  ventas: VentaDetalle[];
  gastosDia: number;
  gastosDetallados: GastoDetallado[];
  error: string | null;
}

export const useReportData = () => {
  /**
   * Carga todos los datos de reportes para un rango de fechas
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
      // Cargar resumen de ventas
      const resumenResponse = await apiService.get(
        `${API_ENDPOINTS.STATS_SALES_RANGE}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

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

      // Cargar productos más vendidos
      const productosResponse = await apiService.get(
        `${API_ENDPOINTS.STATS_PRODUCTS_RANGE}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}&limite=10`
      );

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

      // Cargar ventas detalladas
      const ventasResponse = await apiService.get(
        `${API_ENDPOINTS.SALES}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

      if (ventasResponse.success && ventasResponse.data) {
        result.ventas = ventasResponse.data;
      }

      // Cargar gastos
      try {
        const desde = new Date(desdeISO);
        const hasta = new Date(hastaISO);

        const gastosResponse = await apiService.get(
          `${API_ENDPOINTS.GASTOS}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
        );

        if (gastosResponse.success && Array.isArray(gastosResponse.data)) {
          const gastosFiltrados = gastosResponse.data.filter((g: any) => {
            const fechaGasto = g.fecha ? new Date(g.fecha) : null;
            return fechaGasto && fechaGasto >= desde && fechaGasto <= hasta;
          });
          
          // Mapear y almacenar gastos detallados
          result.gastosDetallados = gastosFiltrados.map((g: any) => ({
            id: g.id,
            monto: parseFloat(g.monto) || 0,
            categoriaGastoNombre: g.categoriaGastoNombre || 'Sin categoría',
            proveedorNombre: g.proveedorNombre || 'Sin proveedor',
            descripcion: g.descripcion || '',
            fecha: g.fecha || '',
          }));
          
          // Calcular total
          result.gastosDia = result.gastosDetallados.reduce((sum, gasto) => sum + gasto.monto, 0);
        }
      } catch (err) {
        // Si el endpoint de gastos falla, simplemente no mostrar gastos
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
