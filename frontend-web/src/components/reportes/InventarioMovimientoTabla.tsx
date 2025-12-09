import React, { memo, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { InventarioMovimientoReporteDTO } from '../../types/reportes.types';

interface InventarioMovimientoTablaProps {
  reporte: InventarioMovimientoReporteDTO | null;
  cargando: boolean;
  error?: string | null;
}

/**
 * Tabla optimizada para mostrar movimiento de inventario por producto.
 * - Renderiza solo columnas de días con operación (sin vacías)
 * - Memoizada para evitar renders innecesarios
 * - Estructura flexible que se adapta a cualquier rango de fechas
 */
const InventarioMovimientoTabla = memo(
  ({ reporte, cargando, error }: InventarioMovimientoTablaProps) => {
    if (cargando) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      );
    }

    if (!reporte || reporte.diasOperacion.length === 0) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">No hay datos para el rango seleccionado</Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <EncabezadoColumnas diasOperacion={reporte.diasOperacion} />
          <CuerpoTabla
            productos={reporte.productos}
            diasOperacion={reporte.diasOperacion}
          />
        </Table>
      </TableContainer>
    );
  }
);

InventarioMovimientoTabla.displayName = 'InventarioMovimientoTabla';

/**
 * Encabezado con columnas dinámicas basadas en días de operación.
 */
interface EncabezadoColumnasProps {
  diasOperacion: string[]; // LocalDate[] serializado como strings ISO
}

const EncabezadoColumnas = memo(({ diasOperacion }: EncabezadoColumnasProps) => {
  const diasFormateados = useMemo(
    () =>
      diasOperacion.map(dia => ({
        fecha: new Date(dia),
        texto: format(new Date(dia), 'EEE', { locale: es }).toUpperCase(),
      })),
    [diasOperacion]
  );

  return (
    <TableHead>
      {/* Fila 1: Encabezados de días */}
      <TableRow sx={{ bgcolor: '#FF9800' }}>
        <TableCell
          sx={{
            fontWeight: 'bold',
            fontSize: '14px',
            textAlign: 'center',
            verticalAlign: 'middle',
            rowSpan: 2,
            minWidth: '150px',
          }}
        >
          Producto
        </TableCell>

        {/* Columnas por día */}
        {diasFormateados.map(dia => (
          <TableCell
            key={dia.fecha.toISOString()}
            colSpan={5}
            align="center"
            sx={{
              fontWeight: 'bold',
              fontSize: '13px',
              borderRight: '1px solid #ccc',
            }}
          >
            {dia.texto}
            <br />
            <span style={{ fontSize: '11px', fontWeight: 'normal' }}>
              {format(dia.fecha, 'dd/MM', { locale: es })}
            </span>
          </TableCell>
        ))}

        {/* Columna de totales */}
        <TableCell
          colSpan={5}
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: '13px',
            bgcolor: '#FFE0B2',
          }}
        >
          TOTALES
        </TableCell>
      </TableRow>

      {/* Fila 2: Subcategorías (Inicio, Compra, Venta, Merma, Queda) */}
      <TableRow sx={{ bgcolor: '#FFF3E0' }}>
        {/* Subcategorías por cada día */}
        {diasFormateados.map(dia => (
          <React.Fragment key={`subcategorías-${dia.fecha.toISOString()}`}>
            <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
              Inicio
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
              Compra
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
              Venta
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
              Merma
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
              Queda
            </TableCell>
          </React.Fragment>
        ))}

        {/* Subcategorías para totales */}
        <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
          Compra
        </TableCell>
        <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
          Venta
        </TableCell>
        <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
          Merma
        </TableCell>
        <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 'bold' }}>
          Queda
        </TableCell>
      </TableRow>
    </TableHead>
  );
});

EncabezadoColumnas.displayName = 'EncabezadoColumnas';

/**
 * Cuerpo de la tabla con datos de productos.
 */
interface CuerpoTablaProps {
  productos: InventarioMovimientoReporteDTO['productos'];
  diasOperacion: string[];
}

const CuerpoTabla = memo(({ productos, diasOperacion }: CuerpoTablaProps) => {
  return (
    <TableBody>
      {productos.map((producto, idx) => (
        <FilaProducto
          key={producto.id}
          producto={producto}
          diasOperacion={diasOperacion}
          esAlternado={idx % 2 === 0}
        />
      ))}
    </TableBody>
  );
});

CuerpoTabla.displayName = 'CuerpoTabla';

/**
 * Fila de producto con datos dinámicos por día.
 */
interface FilaProductoProps {
  producto: InventarioMovimientoReporteDTO['productos'][0];
  diasOperacion: string[];
  esAlternado: boolean;
}

const FilaProducto = memo(
  ({ producto, diasOperacion, esAlternado }: FilaProductoProps) => {
    const filaColor = esAlternado ? 'rgba(0,0,0,0.02)' : 'white';

    return (
      <TableRow sx={{ bgcolor: filaColor, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
        {/* Nombre del producto */}
        <TableCell
          sx={{
            fontWeight: 'bold',
            minWidth: '150px',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          {producto.nombre}
        </TableCell>

        {/* Datos por día */}
        {diasOperacion.map(dia => {
          const movimiento = producto.datos[dia];
          if (!movimiento) return null;

          return (
            <React.Fragment key={`${producto.id}-${dia}`}>
              <CeldaNumerico valor={movimiento.inicio} />
              <CeldaNumerico valor={movimiento.compra} />
              <CeldaNumerico valor={movimiento.venta} />
              <CeldaNumerico valor={movimiento.merma} resaltar="rojo" />
              <CeldaNumerico
                valor={movimiento.queda}
                resaltar={movimiento.queda.toNumber() < 0 ? 'rojo' : undefined}
              />
            </React.Fragment>
          );
        })}

        {/* Totales */}
        <CeldaNumerico valor={producto.totales.compra} />
        <CeldaNumerico valor={producto.totales.venta} sx={{ fontWeight: 'bold' }} />
        <CeldaNumerico valor={producto.totales.merma} resaltar="rojo" />
        <CeldaNumerico
          valor={producto.totales.queda}
          resaltar={producto.totales.queda.toNumber() < 0 ? 'rojo' : undefined}
          sx={{ fontWeight: 'bold' }}
        />
      </TableRow>
    );
  }
);

FilaProducto.displayName = 'FilaProducto';

/**
 * Celda numérica optimizada.
 */
interface CeldaNumericoProps {
  valor: number | { toNumber: () => number };
  resaltar?: 'rojo' | 'verde';
  sx?: React.CSSProperties;
}

const CeldaNumerico = memo(({ valor, resaltar, sx }: CeldaNumericoProps) => {
  const numero =
    typeof valor === 'number' ? valor : valor?.toNumber?.() ?? 0;

  const bgcolor =
    resaltar === 'rojo' ? 'error.light' : resaltar === 'verde' ? 'success.light' : 'inherit';

  return (
    <TableCell
      align="center"
      sx={{
        fontSize: '12px',
        bgcolor,
        ...sx,
      }}
    >
      {numero.toFixed(2)}
    </TableCell>
  );
});

CeldaNumerico.displayName = 'CeldaNumerico';

export default InventarioMovimientoTabla;
