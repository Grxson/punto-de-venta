import { useState, useCallback } from 'react';
import apiService from '../../../services/api.service';
import { API_ENDPOINTS } from '../../../config/api.config';
import type { Venta, VentaItem, Pago } from './useVentas';

/**
 * Hook para manejar la edición de una venta
 * 
 * @example
 * const { itemsEditados, pagosEditados, notaEditada, updateItem, ... } = useVentaEdicion(venta);
 */
export function useVentaEdicion(ventaSeleccionada: Venta | null) {
  const [itemsEditados, setItemsEditados] = useState<VentaItem[]>([]);
  const [pagosEditados, setPagosEditados] = useState<Pago[]>([]);
  const [notaEditada, setNotaEditada] = useState('');
  const [fechaEditada, setFechaEditada] = useState<string>('');
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  // Inicializar cuando se abre una venta
  const inicializarEdicion = useCallback((venta: Venta) => {
    setItemsEditados([...venta.items]);
    setPagosEditados([...venta.pagos]);
    setNotaEditada(venta.nota || '');
    setFechaEditada(venta.fecha);
    setErrorEdicion(null);
  }, []);

  const agregarItem = useCallback((nuevoItem: VentaItem) => {
    setItemsEditados((prev) => [...prev, nuevoItem]);
  }, []);

  const actualizarItem = useCallback(
    (index: number, campo: keyof VentaItem, valor: any) => {
      setItemsEditados((prev) => {
        const actualizado = [...prev];
        actualizado[index] = { ...actualizado[index], [campo]: valor };

        // Recalcular subtotal si cambió cantidad o precio
        if (campo === 'cantidad' || campo === 'precioUnitario') {
          actualizado[index].subtotal =
            actualizado[index].cantidad * actualizado[index].precioUnitario;
        }

        return actualizado;
      });
    },
    []
  );

  const eliminarItem = useCallback((index: number) => {
    setItemsEditados((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const agregarPago = useCallback((nuevoPago: Pago) => {
    setPagosEditados((prev) => [...prev, nuevoPago]);
  }, []);

  const actualizarPago = useCallback(
    (index: number, campo: keyof Pago, valor: any) => {
      setPagosEditados((prev) => {
        const actualizado = [...prev];
        actualizado[index] = { ...actualizado[index], [campo]: valor };
        return actualizado;
      });
    },
    []
  );

  const eliminarPago = useCallback((index: number) => {
    setPagosEditados((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const calcularTotal = useCallback((): number => {
    const subtotal = itemsEditados.reduce((sum, item) => sum + item.subtotal, 0);
    return subtotal; // TODO: agregar impuestos y descuento si es necesario
  }, [itemsEditados]);

  const resetear = useCallback(() => {
    setItemsEditados([]);
    setPagosEditados([]);
    setNotaEditada('');
    setFechaEditada('');
    setErrorEdicion(null);
  }, []);

  return {
    itemsEditados,
    pagosEditados,
    notaEditada,
    fechaEditada,
    errorEdicion,
    inicializarEdicion,
    agregarItem,
    actualizarItem,
    eliminarItem,
    agregarPago,
    actualizarPago,
    eliminarPago,
    calcularTotal,
    setNotaEditada,
    setFechaEditada,
    setErrorEdicion,
    resetear,
  };
}
