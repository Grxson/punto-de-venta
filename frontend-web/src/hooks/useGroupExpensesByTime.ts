import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Gasto {
  id: number;
  categoriaGastoId: number;
  categoriaGastoNombre: string;
  proveedorId?: number;
  proveedorNombre?: string;
  monto: number;
  fecha: string;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  referencia?: string;
  nota?: string;
  tipoGasto?: string;
  comprobanteUrl?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  createdAt: string;
}

interface GastoGroup {
  timeGroup: string; // Formato: "HH:mm"
  gastos: Gasto[];
  totalMonto: number;
}

/**
 * Hook para agrupar gastos por hora de registro
 * Retorna una lista de grupos donde cada grupo contiene gastos del mismo minuto/hora
 * Los gastos se ordenan por hora descendente (más recientes primero)
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
