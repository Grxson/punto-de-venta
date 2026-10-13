import { useState, useRef } from 'react';
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
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/** Gasto registrado, con los datos ya resueltos que necesita la fila. */
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

interface ExpandableExpenseRowProps {
  /** Gastos que comparten el mismo grupo horario. */
  gastos: Gasto[];
  /** Hora del grupo en formato "HH:mm". */
  timeGroup: string; // Formato: "HH:mm"
  /** Abre la edición de un gasto concreto. */
  onEdit?: (gasto: Gasto) => void;
  /** Solicita la eliminación de un gasto por su id. */
  onDelete?: (gastoId: number) => void;
  /** Indica que hay una operación en curso para deshabilitar las acciones. */
  isLoading?: boolean;
}

/**
 * Fila expandible con gastos agrupados por hora.
 * Muestra un resumen compacto del grupo y permite expandirlo para ver cada gasto
 * o verlos todos en un Popper cuando el grupo tiene varias entradas.
 *
 * @param props - Propiedades descritas en {@link ExpandableExpenseRowProps}.
 */
export default function ExpandableExpenseRow({
  gastos,
  timeGroup,
  onEdit,
  onDelete,
  isLoading = false,
}: ExpandableExpenseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [popperOpen, setPopperOpen] = useState(false);
  const popperRef = useRef<HTMLElement | null>(null);

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {showExpandIcon && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                disabled={isLoading}
                sx={{ p: 0.2, minWidth: 32, minHeight: 32 }}
              >
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {timeGroup}
            </Typography>
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
          <Box>
            <Typography variant="body2">
              {firstGasto.nota || '-'}
            </Typography>
            {countGastos > 1 && (
              <Typography 
                ref={(el) => {
                  if (el) popperRef.current = el;
                }}
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 0.5,
                  color: 'primary.main',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    fontWeight: 'bold'
                  }
                }}
                onClick={() => setPopperOpen(!popperOpen)}
              >
                +{countGastos - 1} más... (ver todos)
              </Typography>
            )}
          </Box>
        </TableCell>

        {/* Columna Proveedor */}
        <TableCell>{firstGasto.proveedorNombre || '-'}</TableCell>

        {/* Columna Monto */}
        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
          ${totalMonto.toFixed(2)}
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
              {/* Indentación visual y solo fecha */}
              <TableCell sx={{ pl: 5 }}>
                <Typography variant="caption">
                  {format(new Date(gasto.fecha), 'dd/MM/yyyy', {
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

      {/* Popper mostrando todos los gastos - Idéntico formato que ventas */}
      {popperOpen && popperRef.current && (
        <Popper
          open={true}
          anchorEl={popperRef.current}
          placement="right-start"
          sx={{ zIndex: 1200 }}
          disablePortal={false}
          modifiers={[
            {
              name: 'offset',
              enabled: true,
              options: {
                offset: [0, 1],
              },
            },
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: 'document',
              },
            },
          ]}
        >
          <ClickAwayListener onClickAway={() => setPopperOpen(false)}>
            <Paper
              elevation={8}
              sx={{
                p: 2,
                maxWidth: 300
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Todos los gastos:
              </Typography>
              {gastos.map((gasto, index) => (
                <Typography key={index} variant="body2" display="block" sx={{ mb: 0.5 }}>
                  {gasto.nota || 'Sin descripción'} - ${gasto.monto.toFixed(2)}
                </Typography>
              ))}
            </Paper>
          </ClickAwayListener>
        </Popper>
      )}
    </>
  );
}
