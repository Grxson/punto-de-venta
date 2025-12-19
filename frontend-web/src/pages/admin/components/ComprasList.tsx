import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Visibility, MoreVert, Add } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { comprasService, CompraListado } from '../../../services/compras.service';

interface ComprasListProps {
  onEditar: (compraId: number) => void;
  onCrear: () => void;
  refreshTrigger?: number;
}

/**
 * Tabla con listado de compras
 */
export default function ComprasList({ onEditar, onCrear, refreshTrigger = 0 }: ComprasListProps) {
  const [compras, setCompras] = useState<CompraListado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [detalleCompra, setDetalleCompra] = useState<any>(null);
  const [modalDetalles, setModalDetalles] = useState(false);

  const [compraAEliminar, setCompraAEliminar] = useState<number | null>(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement | null;
    compraId: number;
  }>({ element: null, compraId: 0 });

  // Cargar compras cuando cambia la página o el trigger
  useEffect(() => {
    cargarCompras();
  }, [page, rowsPerPage, refreshTrigger]);

  /**
   * Cargar listado de compras
   */
  const cargarCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await comprasService.listar(page, rowsPerPage);
      setCompras(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Error al cargar compras: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ver detalles de una compra
   */
  const verDetalles = async (compraId: number) => {
    try {
      const detalle = await comprasService.obtener(compraId);
      setDetalleCompra(detalle);
      setModalDetalles(true);
    } catch (err) {
      setError('Error al cargar detalles: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  /**
   * Eliminar una compra (delete definitivo)
   */
  const handleEliminar = async () => {
    if (!compraAEliminar) return;

    setLoading(true);
    setError(null);
    try {
      await comprasService.eliminar(compraAEliminar);
      setSuccess('Compra eliminada correctamente');
      setModalConfirmacion(false);
      setCompraAEliminar(null);

      // Recargar
      setTimeout(() => {
        cargarCompras();
      }, 1500);
    } catch (err) {
      setError('Error al eliminar compra: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Colorear estado
   */
  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'recibida':
        return 'success';
      case 'cancelada':
        return 'error';
      case 'rechazada':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Botón Crear */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={onCrear}>
          + Nueva Compra
        </Button>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : compras.length === 0 ? (
        <Alert severity="info">No hay compras registradas</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Proveedor</strong></TableCell>
                  <TableCell align="center"><strong>Fecha</strong></TableCell>
                  <TableCell align="right"><strong>Items</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                  <TableCell align="center" width={150}>
                    <strong>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id} hover>
                    <TableCell>#{compra.id}</TableCell>
                    <TableCell>{compra.proveedorNombre}</TableCell>
                    <TableCell align="center">
                      {format(new Date(compra.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell align="right">{compra.cantidadItems}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${(compra.montoTotal || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={compra.estado}
                        color={getColorEstado(compra.estado) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => setMenuAnchor({ element: e.currentTarget, compraId: compra.id })}
                      >
                        <MoreVert />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor.compraId === compra.id ? menuAnchor.element : null}
                        open={menuAnchor.compraId === compra.id && Boolean(menuAnchor.element)}
                        onClose={() => setMenuAnchor({ element: null, compraId: 0 })}
                      >
                        <MenuItem 
                          onClick={() => {
                            verDetalles(compra.id);
                            setMenuAnchor({ element: null, compraId: 0 });
                          }}
                        >
                          <Visibility fontSize="small" style={{ marginRight: '8px' }} />
                          Ver Detalles
                        </MenuItem>
                        {compra.estado === 'pendiente' && (
                          <>
                            <MenuItem 
                              onClick={() => {
                                onEditar(compra.id);
                                setMenuAnchor({ element: null, compraId: 0 });
                              }}
                            >
                              <Edit fontSize="small" style={{ marginRight: '8px' }} />
                              Editar
                            </MenuItem>
                            <MenuItem 
                              onClick={() => {
                                setCompraAEliminar(compra.id);
                                setModalConfirmacion(true);
                                setMenuAnchor({ element: null, compraId: 0 });
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" style={{ marginRight: '8px' }} />
                              Eliminar
                            </MenuItem>
                          </>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </>
      )}

      {/* Modal: Detalles de Compra */}
      <Dialog open={modalDetalles} onClose={() => setModalDetalles(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de Compra #{detalleCompra?.id}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detalleCompra && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <strong>Proveedor:</strong> {detalleCompra.proveedorNombre}
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Fecha:</strong>{' '}
                {format(new Date(detalleCompra.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Estado:</strong>
                <Chip
                  label={detalleCompra.estado}
                  color={getColorEstado(detalleCompra.estado) as any}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>

              {detalleCompra.observaciones && (
                <Box sx={{ mb: 2 }}>
                  <strong>Observaciones:</strong>
                  <Box sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                    {detalleCompra.observaciones}
                  </Box>
                </Box>
              )}

              {/* Tabla de Items */}
              <Box sx={{ mt: 3 }}>
                <strong>Ingredientes ({detalleCompra.items?.length || 0})</strong>
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableRow>
                        <TableCell>Ingrediente</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleCompra.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.ingredienteNombre}</TableCell>
                          <TableCell align="right">
                            {item.cantidad} {item.unidadAbreviatura}
                          </TableCell>
                          <TableCell align="right">${item.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ${(item.cantidad * item.precioUnitario).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Total */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                Total: ${(detalleCompra?.montoTotal || 0).toFixed(2)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDetalles(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Confirmación Eliminar */}
      <Dialog open={modalConfirmacion} onClose={() => setModalConfirmacion(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro que deseas eliminar esta compra? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalConfirmacion(false)}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
