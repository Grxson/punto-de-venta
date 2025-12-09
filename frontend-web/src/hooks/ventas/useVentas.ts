import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../config/api.config';

export interface VentaItem {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  costoEstimado?: number;
  nota?: string;
}

export interface Pago {
  id: number;
  metodoPagoId: number;
  metodoPagoNombre: string;
  monto: number;
  referencia?: string;
  fecha: string;
}

export interface Venta {
  id: number;
  sucursalId?: number;
  sucursalNombre?: string;
  fecha: string;
  subtotal: number;
  total: number;
  impuestos: number;
  descuento: number;
  canal: string;
  estado: string;
  nota?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  items: VentaItem[];
  pagos: Pago[];
}

/**
 * Hook para obtener y gestionar lista de ventas
 * 
 * @example
 * const { ventas, loading, error, cargarVentas } = useVentas();
 */
export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarVentas = useCallback(async (desde?: string, hasta?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = API_ENDPOINTS.SALES;
      if (desde && hasta) {
        url += `?desde=${desde}&hasta=${hasta}`;
      }
      
      const response = await apiService.get(url);
      if (response.success) {
        setVentas(response.data);
      } else {
        setError(response.error || 'Error al cargar ventas');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const agregarVenta = useCallback((nuevaVenta: Venta) => {
    setVentas((prev) => [nuevaVenta, ...prev]);
  }, []);

  const actualizarVenta = useCallback((ventaActualizada: Venta) => {
    setVentas((prev) =>
      prev.map((v) => (v.id === ventaActualizada.id ? ventaActualizada : v))
    );
  }, []);

  const eliminarVenta = useCallback((ventaId: number) => {
    setVentas((prev) => prev.filter((v) => v.id !== ventaId));
  }, []);

  return {
    ventas,
    loading,
    error,
    cargarVentas,
    agregarVenta,
    actualizarVenta,
    eliminarVenta,
  };
}
