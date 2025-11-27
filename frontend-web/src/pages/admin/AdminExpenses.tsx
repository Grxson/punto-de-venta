import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Delete, AttachMoney } from '@mui/icons-material';
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

export default function AdminExpenses() {
  const { usuario } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  
  // Estado para el filtro de fechas
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  // Form state
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');
  const [referencia, setReferencia] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar gastos
      const gastosResponse = await apiService.get(API_ENDPOINTS.GASTOS);
      if (gastosResponse.success && gastosResponse.data) {
        setGastos(gastosResponse.data);
      }

      // Cargar categorías
      const categoriasResponse = await apiService.get(`${API_ENDPOINTS.CATEGORIAS_GASTO}/activas`);
      if (categoriasResponse.success && categoriasResponse.data) {
        setCategorias(categoriasResponse.data);
      }

      // Cargar proveedores
      const proveedoresResponse = await apiService.get(`${API_ENDPOINTS.PROVEEDORES}/activos`);
      if (proveedoresResponse.success && proveedoresResponse.data) {
        setProveedores(proveedoresResponse.data);
      }

      // Cargar métodos de pago
      const metodosResponse = await apiService.get(`${API_ENDPOINTS.PAYMENT_METHODS}/activos`);
      if (metodosResponse.success && metodosResponse.data) {
        setMetodosPago(metodosResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
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
    
    console.log('Filtro de gastos:', {
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      totalGastos: gastos.length,
      gastosEjemplo: gastos.slice(0, 3).map(g => ({ id: g.id, fecha: g.fecha }))
    });
    
    const filtrados = gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fecha);
      const cumpleFiltro = fechaGasto >= desde && fechaGasto <= hasta;
      
      if (gastos.length <= 5) { // Solo log si hay pocos gastos para no saturar
        console.log('Gasto', gasto.id, {
          fechaGasto: fechaGasto.toISOString(),
          desde: desde.toISOString(),
          hasta: hasta.toISOString(),
          cumpleFiltro
        });
      }
      
      return cumpleFiltro;
    });
    
    console.log('Gastos filtrados:', filtrados.length);
    return filtrados;
  }, [gastos, dateRange]);

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  const handleOpenDialog = (gasto?: Gasto) => {
    if (gasto) {
      setEditingGasto(gasto);
      setCategoriaId(gasto.categoriaGastoId);
      setProveedorId(gasto.proveedorId || '');
      setMonto(gasto.monto.toString());
      setFecha(new Date(gasto.fecha));
      setMetodoPagoId(gasto.metodoPagoId || '');
      setReferencia(gasto.referencia || '');
      setNota(gasto.nota || '');
    } else {
      setEditingGasto(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGasto(null);
    resetForm();
  };

  const resetForm = () => {
    setCategoriaId('');
    setProveedorId('');
    setMonto('');
    setFecha(new Date());
    setMetodoPagoId('');
    setReferencia('');
    setNota('');
  };

  const handleSubmit = async () => {
    if (!categoriaId || !monto || !fecha) {
      setError('Completa los campos obligatorios: Categoría, Monto y Fecha');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fechaISO = fecha!.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss

      const request = {
        categoriaGastoId: categoriaId,
        proveedorId: proveedorId || null,
        sucursalId: usuario?.idSucursal || null,
        monto: parseFloat(monto),
        fecha: fechaISO,
        metodoPagoId: metodoPagoId || null,
        referencia: referencia || null,
        nota: nota || null,
        comprobanteUrl: null,
      };

      if (editingGasto) {
        // TODO: Implementar actualización si es necesario
        setError('La actualización de gastos aún no está implementada');
      } else {
        const response = await apiService.post(API_ENDPOINTS.GASTOS, request);
        if (response.success) {
          handleCloseDialog();
          loadData();
        } else {
          setError(response.error || 'Error al registrar el gasto');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.delete(`${API_ENDPOINTS.GASTOS}/${id}`);
      if (response.success) {
        loadData();
      } else {
        setError(response.error || 'Error al eliminar el gasto');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el gasto');
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de gastos (filtrados)
  const totalGastosFiltrados = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Gastos</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ minHeight: '48px' }}
          >
            Registrar Gasto
          </Button>
        </Box>

        {/* Filtro de fechas */}
        <DateRangeFilter 
          onChange={handleDateRangeChange} 
          initialRange={dateRange}
          label="Filtrar gastos por fecha"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Resumen */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Gastos (rango seleccionado)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${totalGastosFiltrados.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {gastosFiltrados.length} de {gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'}
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
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(gasto.id)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay gastos en el rango de fechas seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Dialog para registrar/editar gasto */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value as number)}
                  label="Categoría"
                >
                  {categorias.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Proveedor (Opcional)</InputLabel>
                <Select
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value as number | '')}
                  label="Proveedor (Opcional)"
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Monto"
                type="number"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />

              <DatePicker
                label="Fecha"
                value={fecha}
                onChange={(newValue) => setFecha(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />

              <FormControl fullWidth>
                <InputLabel>Método de Pago (Opcional)</InputLabel>
                <Select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value as number | '')}
                  label="Método de Pago (Opcional)"
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
                label="Referencia (Opcional)"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Número de factura, autorización, etc."
              />

              <TextField
                fullWidth
                label="Descripción / Nota"
                multiline
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej: Compra de 2 kilos de huevo, Pago de internet del mes, etc."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : editingGasto ? 'Actualizar' : 'Registrar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

