import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Chip,
  Popper,
  ClickAwayListener,
  Menu,
  MenuItem,
} from '@mui/material';
import { Edit, Cancel, Delete, MoreVert } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef } from 'react';
import type { Venta } from '../../../hooks/ventas';
import { limpiarNombreProducto } from '../../../utils/stringFormatters';

interface VentasTableProps {
  ventas: Venta[];
  onEdit: (venta: Venta) => void;
  onCancel: (venta: Venta) => void;
  onDelete: (venta: Venta) => void;
  canEdit?: (venta: Venta) => boolean;
  canCancel?: (venta: Venta) => boolean;
  canDelete?: (venta: Venta) => boolean;
  isAdmin?: boolean;
}

const getEstadoColor = (estado: string): 'success' | 'error' | 'warning' | 'default' => {
  if (estado === 'PAGADA') return 'success';
  if (estado === 'CANCELADA') return 'error';
  if (estado === 'PENDIENTE') return 'warning';
  return 'default';
};

/**
 * Tabla reutilizable para mostrar ventas
 */
export default function VentasTable({
  ventas,
  onEdit,
  onCancel,
  onDelete,
  canEdit = () => true,
  canCancel = () => true,
  canDelete = () => true,
  isAdmin = false,
}: VentasTableProps) {
  const [tooltipOpen, setTooltipOpen] = useState<{ [key: number]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const popperRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, venta: Venta) => {
    setAnchorEl(event.currentTarget);
    setSelectedVenta(venta);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVenta(null);
  };

  const handleAction = (action: 'edit' | 'cancel' | 'delete') => {
    if (selectedVenta) {
      if (action === 'edit') onEdit(selectedVenta);
      if (action === 'cancel') onCancel(selectedVenta);
      if (action === 'delete') onDelete(selectedVenta);
    }
    handleMenuClose();
  };

  if (ventas.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Método Pago</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  No hay ventas en este período
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Total
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Método Pago</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ventas.map((venta) => (
            <TableRow key={venta.id} hover>
              <TableCell>#{venta.id}</TableCell>
              <TableCell>
                {format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ${venta.total.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={venta.estado}
                  color={getEstadoColor(venta.estado)}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 250 }}>
                  {venta.items.length === 1 ? (
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {venta.items[0].cantidad}x{' '}
                      {limpiarNombreProducto(venta.items[0].productoNombre)}
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {venta.items.length} productos:
                      </Typography>
                      {venta.items.slice(0, 2).map((item, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          {item.cantidad}x {limpiarNombreProducto(item.productoNombre)}
                        </Typography>
                      ))}
                      {venta.items.length > 2 && (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setTooltipOpen((prev) => ({ ...prev, [venta.id]: true }))}
                        >
                          +{venta.items.length - 2} más
                        </Typography>
                      )}
                      {venta.items.length > 2 && (
                        <Popper
                          open={tooltipOpen[venta.id] || false}
                          anchorEl={() => popperRef.current}
                          placement="right"
                        >
                          <ClickAwayListener
                            onClickAway={() =>
                              setTooltipOpen((prev) => ({ ...prev, [venta.id]: false }))
                            }
                          >
                            <Paper elevation={8} sx={{ p: 2, maxWidth: 300, ml: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Todos los productos:
                              </Typography>
                              {venta.items.map((item, index) => (
                                <Typography key={index} variant="body2" display="block" sx={{ mb: 0.5 }}>
                                  {item.cantidad}x{' '}
                                  {limpiarNombreProducto(item.productoNombre)} - $
                                  {(item.precioUnitario * item.cantidad).toFixed(2)}
                                </Typography>
                              ))}
                            </Paper>
                          </ClickAwayListener>
                        </Popper>
                      )}
                    </Box>
                  )}
                </Box>
              </TableCell>
              <TableCell>{venta.pagos.map((p) => p.metodoPagoNombre).join(', ')}</TableCell>
              <TableCell>{venta.usuarioNombre || 'N/A'}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, venta)}
                  title="Más opciones"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {selectedVenta && canEdit(selectedVenta) && (
          <MenuItem onClick={() => handleAction('edit')}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
          </MenuItem>
        )}
        {selectedVenta && canCancel(selectedVenta) && (
          <MenuItem onClick={() => handleAction('cancel')}>
            <Cancel fontSize="small" sx={{ mr: 1 }} /> Cancelar
          </MenuItem>
        )}
        {selectedVenta && isAdmin && canDelete(selectedVenta) && (
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
          </MenuItem>
        )}
      </Menu>
    </TableContainer>
  );
}
