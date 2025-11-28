import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { ArrowBack, AttachMoney, Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useAuth } from '../../contexts/AuthContext';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import type { DateRangeValue } from '../../types/dateRange.types';

interface CategoriaGasto {
  id: number;
  nombre: string;
  descripcion?: string;
  presupuestoMensual?: number;
  activo: boolean;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

interface MetodoPago {
  id: number;
  nombre: string;
  requiereReferencia: boolean;
  activo: boolean;
}

interface Gasto {
  id: number;
  categoriaGastoId: number;
  categoriaGastoNombre: string;
  proveedorId?: number;
  proveedorNombre?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  monto: number;
  fecha: string;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  referencia?: string;
  nota?: string;
  comprobanteUrl?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  createdAt: string;
}

interface CrearGastoRequest {
  categoriaGastoId: number;
  proveedorId?: number;
  sucursalId: number;
  monto: number;
  fecha?: string;
  metodoPagoId?: number;
  referencia?: string;
  nota?: string;
  comprobanteUrl?: string;
}

export default function PosExpenses() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categoriasGasto, setCategoriasGasto] = useState<CategoriaGasto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  
  // Estado para el filtro de fechas
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  // Estado del formulario
  const [categoriaGastoId, setCategoriaGastoId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');
  const [referencia, setReferencia] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  // Estado de la UI
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  // Verificar si el usuario es administrador
  const isAdmin = usuario?.rolNombre === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [dateRange]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar gastos con filtro de fecha
      const gastosResponse = await apiService.get(`${API_ENDPOINTS.GASTOS}?fechaInicio=${dateRange.desde}&fechaFin=${dateRange.hasta}`);
      if (gastosResponse.success && gastosResponse.data) {
        setGastos(gastosResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoadingData(true);
    setError(null);
    try {
      // Cargar categorías activas
      const categoriasRes = await apiService.get(`${API_ENDPOINTS.CATEGORIAS_GASTO}/activas`);
      if (categoriasRes.success) {
        setCategoriasGasto(categoriasRes.data || []);
      }

      // Cargar métodos de pago activos
      const metodosPagoRes = await apiService.get(API_ENDPOINTS.PAYMENT_METHODS_ACTIVOS);
      if (metodosPagoRes.success) {
        setMetodosPago(metodosPagoRes.data || []);
      }

      // Intentar cargar proveedores activos (puede fallar si no tiene permisos)
      try {
        const proveedoresRes = await apiService.get(`${API_ENDPOINTS.PROVEEDORES}/activos`);
        if (proveedoresRes.success) {
          setProveedores(proveedoresRes.data || []);
        }
      } catch (err) {
        // Si no tiene permisos para ver proveedores, simplemente no cargar (es opcional)
        console.log('No se pudieron cargar proveedores (puede requerir permisos adicionales)');
      }

    } catch (err: any) {
      setError('Error al cargar datos iniciales: ' + (err.message || 'Error de conexión'));
    } finally {
      setLoadingData(false);
    }
  };

  // Filtrar gastos por rango de fechas
  const gastosFiltrados = useMemo(() => {
    if (!dateRange.desde || !dateRange.hasta) return gastos;
    
    // Crear fechas en zona horaria local
    const desde = new Date(dateRange.desde + 'T00:00:00');
    const hasta = new Date(dateRange.hasta + 'T23:59:59');
    
    return gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fecha);
      return fechaGasto >= desde && fechaGasto <= hasta;
    });
  }, [gastos, dateRange]);

  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  const handleOpenDialog = (gasto?: Gasto) => {
    if (gasto) {
      setEditingGasto(gasto);
      setCategoriaGastoId(gasto.categoriaGastoId);
      setProveedorId(gasto.proveedorId || '');
      setMonto(gasto.monto.toString());
      setFecha(new Date(gasto.fecha));
      setMetodoPagoId(gasto.metodoPagoId || '');
      setReferencia(gasto.referencia || '');
      setNota(gasto.nota || '');
    } else {
      setEditingGasto(null);
      setCategoriaGastoId('');
      setProveedorId('');
      setMonto('');
      setFecha(new Date());
      setMetodoPagoId('');
      setReferencia('');
      setNota('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGasto(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!categoriaGastoId || !monto || parseFloat(monto) <= 0) {
      setError('La categoría y el monto son obligatorios y el monto debe ser mayor a 0.');
      setSubmitting(false);
      return;
    }

    // Usar sucursalId (campo que viene del backend) o idSucursal (compatibilidad)
    const sucursalId = usuario?.sucursalId || usuario?.idSucursal;
    
    if (!sucursalId) {
      setError('No se pudo obtener la sucursal del usuario. Intenta iniciar sesión de nuevo.');
      setSubmitting(false);
      return;
    }

    try {
      const request: CrearGastoRequest = {
        categoriaGastoId: categoriaGastoId as number,
        proveedorId: proveedorId ? (proveedorId as number) : undefined,
        sucursalId: sucursalId,
        monto: parseFloat(monto),
        fecha: fecha ? fecha.toISOString() : undefined,
        metodoPagoId: metodoPagoId ? (metodoPagoId as number) : undefined,
        referencia: referencia || undefined,
        nota: nota || undefined,
      };

      let response;
      if (editingGasto) {
        // Editar gasto existente
        response = await apiService.put(`${API_ENDPOINTS.GASTOS}/${editingGasto.id}`, request);
      } else {
        // Crear nuevo gasto
        response = await apiService.post(API_ENDPOINTS.GASTOS, request);
      }

      if (response.success) {
        setSuccessMessage(editingGasto ? 'Gasto actualizado con éxito.' : 'Gasto registrado con éxito.');
        handleCloseDialog();
        loadData(); // Recargar la lista de gastos
      } else {
        setError(response.error || 'Error al procesar el gasto.');
      }
    } catch (err: any) {
      setError('Error de conexión: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (gastoId: number) => {
    if (!isAdmin) {
      setError('Solo los administradores pueden eliminar gastos.');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.delete(`${API_ENDPOINTS.GASTOS}/${gastoId}`);
      if (response.success) {
        setSuccessMessage('Gasto eliminado con éxito.');
        loadData(); // Recargar la lista
      } else {
        setError(response.error || 'Error al eliminar el gasto.');
      }
    } catch (err: any) {
      setError('Error de conexión: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/pos')}
              sx={{ mr: 2, minHeight: '48px' }}
            >
              Volver
            </Button>
            <Typography variant="h4">Gestión de Gastos</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ minHeight: '48px' }}
            >
              Registrar Gasto
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Snackbar
            open={!!successMessage}
            autoHideDuration={6000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>
        )}

        <DateRangeFilter onChange={handleDateRangeChange} initialRange={dateRange} />

        {/* Resumen */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Gastos Registrados ({gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'gasto' : 'gastos'})
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${totalGastos.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabla de gastos */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell>Método de Pago</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gastosFiltrados.length > 0 ? (
                    gastosFiltrados.map((gasto) => (
                      <TableRow key={gasto.id}>
                        <TableCell>
                          {format(new Date(gasto.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Chip label={gasto.categoriaGastoNombre} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{gasto.nota || '-'}</TableCell>
                        <TableCell>{gasto.proveedorNombre || '-'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          ${gasto.monto.toFixed(2)}
                        </TableCell>
                        <TableCell>{gasto.metodoPagoNombre || '-'}</TableCell>
                        <TableCell align="center">
                          {isAdmin && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(gasto)}
                                disabled={loading}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(gasto.id)}
                                disabled={loading}
                              >
                                <Delete />
                              </IconButton>
                            </>
                          )}
                          {!isAdmin && (
                            <Typography variant="caption" color="text.secondary">
                              Solo lectura
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay gastos registrados para el rango de fechas seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog para registrar/editar gasto */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Categoría de Gasto</InputLabel>
                    <Select
                      value={categoriaGastoId}
                      onChange={(e) => setCategoriaGastoId(Number(e.target.value))}
                      label="Categoría de Gasto"
                    >
                      {categoriasGasto.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Monto *"
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    inputProps={{ step: '0.01', min: '0.01' }}
                    required
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <DatePicker
                    label="Fecha"
                    value={fecha}
                    onChange={setFecha}
                    slotProps={{ textField: { fullWidth: true } }}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Proveedor</InputLabel>
                    <Select
                      value={proveedorId}
                      onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : '')}
                      label="Proveedor"
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {proveedores.map((prov) => (
                        <MenuItem key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={metodoPagoId}
                      onChange={(e) => setMetodoPagoId(e.target.value ? Number(e.target.value) : '')}
                      label="Método de Pago"
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {metodosPago.map((metodo) => (
                        <MenuItem key={metodo.id} value={metodo.id}>
                          {metodo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Nota"
                  multiline
                  rows={3}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AttachMoney />}
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : (editingGasto ? 'Actualizar' : 'Registrar')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

