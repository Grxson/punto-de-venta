import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/** Gasto con los datos necesarios para agrupar y mostrar en la tabla. */
interface Gasto {
  /** Identificador del gasto. */
  id: number;
  /** Id de la categoría de gasto. */
  categoriaGastoId: number;
  /** Nombre de la categoría de gasto. */
  categoriaGastoNombre: string;
  /** Id del proveedor, si se registró. */
  proveedorId?: number;
  /** Nombre del proveedor, si se registró. */
  proveedorNombre?: string;
  /** Monto del gasto. */
  monto: number;
  /** Fecha del gasto en formato ISO. */
  fecha: string;
  /** Id del método de pago utilizado. */
  metodoPagoId?: number;
  /** Nombre del método de pago utilizado. */
  metodoPagoNombre?: string;
  /** Referencia o folio del comprobante. */
  referencia?: string;
  /** Nota o descripción libre del gasto. */
  nota?: string;
  /** Tipo de gasto (por ejemplo, Administrativo u Operacional). */
  tipoGasto?: string;
  /** URL del comprobante adjunto. */
  comprobanteUrl?: string;
  /** Id del usuario que registró el gasto. */
  usuarioId?: number;
  /** Nombre del usuario que registró el gasto. */
  usuarioNombre?: string;
  /** Fecha de creación del registro. */
  createdAt: string;
}

/** Grupo de gastos que comparten la misma hora de registro. */
interface GastoGroup {
  /** Hora del grupo en formato "HH:mm". */
  timeGroup: string; // Formato: "HH:mm"
  /** Gastos pertenecientes al grupo. */
  gastos: Gasto[];
  /** Suma de los montos del grupo. */
  totalMonto: number;
}

/**
 * Agrupa gastos por hora de registro.
 * Cada grupo reúne los gastos del mismo minuto/hora y se ordenan por hora
 * descendente (los más recientes primero).
 *
 * @param gastos - Lista de gastos a agrupar.
 * @returns Arreglo de grupos con su hora, sus gastos y el total del grupo.
 */
export function useGroupExpensesByTime(gastos: Gasto[]): GastoGroup[] {
  return useMemo(() => {
    if (!gastos || gastos.length === 0) {
      return [];
    }

    // Agrupar por hora (HH:mm)
    const grouped = gastos.reduce<Record<string, Gasto[]>>((acc, gasto) => {
      const timeKey = format(new Date(gasto.fecha), 'HH:mm', { locale: es });

      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }

      acc[timeKey].push(gasto);
      return acc;
    }, {});

    // Convertir a array de grupos
    const groups: GastoGroup[] = Object.entries(grouped).map(
      ([timeGroup, groupedGastos]) => ({
        timeGroup,
        gastos: groupedGastos.sort(
          (a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        ),
        totalMonto: groupedGastos.reduce((sum, g) => sum + g.monto, 0),
      })
    );

    // Ordenar grupos por hora descendente (más recientes primero)
    return groups.sort((a, b) => {
      const timeA = a.timeGroup.split(':').map(Number);
      const timeB = b.timeGroup.split(':').map(Number);

      const minutesA = timeA[0] * 60 + timeA[1];
      const minutesB = timeB[0] * 60 + timeB[1];

      return minutesB - minutesA;
    });
  }, [gastos]);
}
