import { useState } from 'react';
import {
  Box,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Typography,
  Collapse,
  Table,
  TableBody,
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Delete } from '@mui/icons-material';
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

interface ExpandableExpenseRowProps {
  gastos: Gasto[];
  timeGroup: string; // Formato: "HH:mm"
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (gastoId: number) => void;
  isLoading?: boolean;
}

/**
 * Fila expandible de gastos agrupados por hora
 * Muestra un resumen compacto y permite expandir para ver detalles
 */
export default function ExpandableExpenseRow({
  gastos,
  timeGroup,
  onEdit,
  onDelete,
  isLoading = false,
}: ExpandableExpenseRowProps) {
  const [expanded, setExpanded] = useState(false);

  // Calcular totales
  const totalMonto = gastos.reduce((sum, g) => sum + g.monto, 0);

  // Información del primer gasto (para mostrar en resumen)
  const firstGasto = gastos[0];

  // Contador de gastos
  const countGastos = gastos.length;
  const showExpandIcon = countGastos > 1;

  return (
    <>
      {/* Fila principal/resumen */}
      <TableRow
        sx={{
          backgroundColor: expanded ? 'action.selected' : 'inherit',
          cursor: showExpandIcon ? 'pointer' : 'default',
          transition: 'background-color 0.2s ease',
          '&:hover': showExpandIcon
            ? { backgroundColor: 'action.hover' }
            : undefined,
        }}
      >
        {/* Columna Fecha/Hora con indicador expandible */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showExpandIcon && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                disabled={isLoading}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {timeGroup}
            </Typography>
            {countGastos > 1 && (
              <Chip
                label={`${countGastos} gastos`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </TableCell>

        {/* Columna Tipo */}
        <TableCell>
          <Chip
            label={
              firstGasto.tipoGasto === 'Administrativo'
                ? 'Administrativo'
                : 'Operacional'
            }
            size="small"
            color={
              firstGasto.tipoGasto === 'Administrativo' ? 'warning' : 'success'
            }
            variant="outlined"
          />
        </TableCell>

        {/* Columna Categoría */}
        <TableCell>
          <Chip
            label={firstGasto.categoriaGastoNombre}
            size="small"
            color="primary"
          />
        </TableCell>

        {/* Columna Descripción */}
        <TableCell>
          {firstGasto.nota || '-'}
          {countGastos > 1 && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              +{countGastos - 1} más...
            </Typography>
          )}
        </TableCell>

        {/* Columna Proveedor */}
        <TableCell>{firstGasto.proveedorNombre || '-'}</TableCell>

        {/* Columna Monto (Total si hay múltiples) */}
        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
          {countGastos > 1 ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${totalMonto.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (promedio: ${(totalMonto / countGastos).toFixed(2)})
              </Typography>
            </Box>
          ) : (
            `$${firstGasto.monto.toFixed(2)}`
          )}
        </TableCell>

        {/* Columna Método de Pago */}
        <TableCell>{firstGasto.metodoPagoNombre || '-'}</TableCell>

        {/* Columna Acciones */}
        <TableCell align="center">
          {countGastos === 1 ? (
            <>
              {onEdit && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onEdit(firstGasto)}
                  disabled={isLoading}
                  title="Editar"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(firstGasto.id)}
                  disabled={isLoading}
                  title="Eliminar"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Ver detalles
            </Typography>
          )}
        </TableCell>
      </TableRow>

      {/* Filas expandidas (solo si hay múltiples gastos) */}
      {showExpandIcon && expanded && (
        <>
          {gastos.map((gasto, idx) => (
            <TableRow
              key={gasto.id}
              sx={{
                backgroundColor: 'action.hover',
                '&:hover': { backgroundColor: 'grey.100' },
              }}
            >
              {/* Indentación visual y timestamp completo */}
              <TableCell sx={{ pl: 5 }}>
                <Typography variant="caption">
                  {format(new Date(gasto.fecha), 'dd/MM/yyyy HH:mm:ss', {
                    locale: es,
                  })}
                </Typography>
              </TableCell>

              {/* Tipo */}
              <TableCell>
                <Chip
                  label={
                    gasto.tipoGasto === 'Administrativo'
                      ? 'Administrativo'
                      : 'Operacional'
                  }
                  size="small"
                  color={
                    gasto.tipoGasto === 'Administrativo' ? 'warning' : 'success'
                  }
                  variant="outlined"
                />
              </TableCell>

              {/* Categoría */}
              <TableCell>
                <Chip
                  label={gasto.categoriaGastoNombre}
                  size="small"
                  color="primary"
                />
              </TableCell>

              {/* Descripción */}
              <TableCell>{gasto.nota || '-'}</TableCell>

              {/* Proveedor */}
              <TableCell>{gasto.proveedorNombre || '-'}</TableCell>

              {/* Monto */}
              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                ${gasto.monto.toFixed(2)}
              </TableCell>

              {/* Método de Pago */}
              <TableCell>{gasto.metodoPagoNombre || '-'}</TableCell>

              {/* Acciones */}
              <TableCell align="center">
                {onEdit && (
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(gasto)}
                    disabled={isLoading}
                    title="Editar"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(gasto.id)}
                    disabled={isLoading}
                    title="Eliminar"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </>
      )}
    </>
  );
}
