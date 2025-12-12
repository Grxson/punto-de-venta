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
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ 
          minWidth: 650,
          '& td, & th': {
            padding: '8px 6px',
            border: '1px solid #ddd',
          }
        }}>
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
      diasOperacion.map(dia => {
        // Convertir string ISO date (YYYY-MM-DD) a Date sin desfase de zona horaria
        const [year, month, day] = dia.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        return {
          fecha,
          texto: format(fecha, 'EEE', { locale: es }).toUpperCase(),
        };
      }),
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
            minWidth: '120px',
            bgcolor: '#FFF3E0',
            borderRight: '2px solid #ccc',
          }}
        >
          Producto
        </TableCell>

        {/* Columna "Inicio" que abarca 2 filas */}
        <TableCell
          sx={{
            fontWeight: 'bold',
            fontSize: '12px',
            textAlign: 'center',
            verticalAlign: 'middle',
            rowSpan: 2,
            minWidth: '60px',
            bgcolor: '#FFF3E0',
            borderRight: '1px solid #ccc',
          }}
        >
          Inicio
        </TableCell>

        {/* Columnas por día */}
        {diasFormateados.map(dia => (
          <TableCell
            key={dia.fecha.toISOString()}
            colSpan={4}
            align="center"
            sx={{
              fontWeight: 'bold',
              fontSize: '12px',
              color: '#fff',
              borderRight: '1px solid #fff',
              paddingY: '4px',
            }}
          >
            {dia.texto}
            <br />
            <span style={{ fontSize: '10px', fontWeight: 'normal' }}>
              {format(dia.fecha, 'dd/MM')}
            </span>
          </TableCell>
        ))}

        {/* Columna de totales */}
        <TableCell
          colSpan={3}
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: '12px',
            color: '#fff',
            bgcolor: '#F57C00',
          }}
        >
          TOTALES
        </TableCell>
      </TableRow>

      {/* Fila 2: Subcategorías */}
      <TableRow sx={{ bgcolor: '#FFF3E0' }}>
        {/* Celda vacía para alineación con nombre del producto */}
        <TableCell
          align="center"
          sx={{
            fontSize: '10px',
            fontWeight: 'bold',
            minWidth: '120px',
            borderRight: '2px solid #ccc',
          }}
        >
          {/* Vacío */}
        </TableCell>

        {/* Columna "Inicio" separada */}
        <TableCell
          align="center"
          sx={{
            fontSize: '10px',
            fontWeight: 'bold',
            minWidth: '60px',
            borderRight: '1px solid #ddd',
          }}
        >
          Inicio
        </TableCell>

        {/* Subcategorías por cada día (Compra, Venta, Merma, Queda) */}
        {diasFormateados.map(dia => (
          <React.Fragment key={`subcategorías-${dia.fecha.toISOString()}`}>
            <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              Compra
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              Venta
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              Merma
            </TableCell>
            <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
              Queda
            </TableCell>
          </React.Fragment>
        ))}

        {/* Subcategorías para totales - Compra, Venta, Queda (SIN Merma) */}
        <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
          Compra
        </TableCell>
        <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
          Venta
        </TableCell>
        <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 'bold' }}>
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
    const filaColor = esAlternado ? '#F5F5F5' : '#FAFAFA';
    const primerDia = diasOperacion[0];
    const primerMovimiento = producto.datos[primerDia];

    return (
      <TableRow sx={{ 
        bgcolor: filaColor,
        fontSize: '12px',
        '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.05)' }
      }}>
        {/* Nombre del producto */}
        <TableCell
          sx={{
            fontWeight: '600',
            minWidth: '120px',
            textAlign: 'left',
            fontSize: '12px',
            paddingY: '6px',
            paddingX: '8px',
            borderRight: '2px solid #ccc',
          }}
        >
          {producto.nombre}
        </TableCell>

        {/* Columna "Inicio" separada */}
        <TableCell
          sx={{
            textAlign: 'center',
            minWidth: '60px',
            fontSize: '12px',
            paddingY: '6px',
            paddingX: '4px',
            borderRight: '1px solid #ddd',
          }}
        >
          {primerMovimiento ? (
            <ContenidoNumerico valor={primerMovimiento.inicio} />
          ) : (
            <span>0.00</span>
          )}
        </TableCell>

        {/* Datos por día (solo Compra, Venta, Merma, Queda) */}
        {diasOperacion.map(dia => {
          const movimiento = producto.datos[dia];
          if (!movimiento) return null;

          return (
            <React.Fragment key={`${producto.id}-${dia}`}>
              <CeldaNumerico valor={movimiento.compra} />
              <CeldaNumerico valor={movimiento.venta} />
              <CeldaNumerico valor={movimiento.merma} />
              <CeldaNumerico
                valor={movimiento.queda}
                resaltar="rojo"
              />
            </React.Fragment>
          );
        })}

        {/* Totales - Compra, Venta, Queda (SIN Merma, SIN Inicio) */}
        <CeldaNumerico valor={producto.totales.compra} />
        <CeldaNumerico valor={producto.totales.venta} />
        <CeldaNumerico
          valor={producto.totales.queda}
          resaltar="rojo"
          sx={{ fontWeight: 'bold' }}
        />
      </TableRow>
    );
  }
);

FilaProducto.displayName = 'FilaProducto';

/**
 * Contenido numérico formateado (sin TableCell).
 */
interface ContenidoNumericoProps {
  valor: number | { toNumber: () => number };
}

const ContenidoNumerico = memo(({ valor }: ContenidoNumericoProps) => {
  const numero =
    typeof valor === 'number' ? valor : valor?.toNumber?.() ?? 0;
  return <span>{numero.toFixed(2)}</span>;
});

ContenidoNumerico.displayName = 'ContenidoNumerico';

/**
 * Celda numérica con TableCell (para uso fuera de TableCell).
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
    resaltar === 'rojo' ? '#FFCDD2' : resaltar === 'verde' ? '#C8E6C9' : 'inherit';

  return (
    <TableCell
      align="center"
      sx={{
        fontSize: '11px',
        padding: '4px 6px',
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
