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
  Autocomplete,
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
import ExpandableExpenseRow from '../../components/expenses/ExpandableExpenseRow';
import { useGroupExpensesByTime } from '../../hooks/useGroupExpensesByTime';
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
  tipoGasto?: string;
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
  tipoGasto?: string;
  comprobanteUrl?: string;
}

interface GastoPendiente {
  tempId: string; // ID temporal único para esta sesión
  categoriaGastoId: number;
  proveedorId?: number;
  monto: number;
  nota?: string;
  tipoGasto: string;
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

  // Estado del formulario - CAMPOS COMUNES para todos los gastos
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');

  // Estado del formulario - CAMPOS POR GASTO
  const [categoriaGastoId, setCategoriaGastoId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [nota, setNota] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');
  const [tipoGasto, setTipoGasto] = useState<string>('Operacional');
  const [proveedorSearchText, setProveedorSearchText] = useState<string>('');
  const [openNewProveedorDialog, setOpenNewProveedorDialog] = useState(false);
  const [newProveedorName, setNewProveedorName] = useState<string>('');

  // Estado de gastos pendientes (múltiples)
  const [gastosPendientes, setGastosPendientes] = useState<GastoPendiente[]>([]);

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

  // Cuando el diálogo se abre, establecer valores por defecto
  useEffect(() => {
    if (openDialog && categoriasGasto.length > 0 && metodosPago.length > 0) {
      if (!editingGasto) {
        // Nuevo gasto: establecer defaults para campos comunes
        const efectivoMethod = metodosPago.find(met => met.nombre.toLowerCase() === 'efectivo');
        if (efectivoMethod) {
          setMetodoPagoId(efectivoMethod.id);
        }
        setFecha(new Date());
        // Defaults para campos por-gasto
        const insumosCategory = categoriasGasto.find(cat => cat.nombre.toLowerCase() === 'insumos');
        if (insumosCategory) {
          setCategoriaGastoId(insumosCategory.id);
        }
        setProveedorId('');
        setMonto('');
        setNota('');
      } else {
        // Edición de gasto existente (flujo antiguo, mantener compatible)
        setCategoriaGastoId(editingGasto.categoriaGastoId);
        setProveedorId(editingGasto.proveedorId || '');
        setMonto(editingGasto.monto.toString());
        setFecha(new Date(editingGasto.fecha));
        setMetodoPagoId(editingGasto.metodoPagoId || '');
        setNota(editingGasto.nota || '');
      }
    }
  }, [openDialog, editingGasto, categoriasGasto, metodosPago]);

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

  // Calcular total de gastos OPERACIONALES (filtrados) - Se refleja en Resumen del Día
  const totalGastosOperacionales = gastosFiltrados
    .filter(gasto => !gasto.tipoGasto || gasto.tipoGasto === 'Operacional')
    .reduce((sum, gasto) => sum + gasto.monto, 0);

  // Calcular total de gastos ADMINISTRATIVOS (filtrados) - NO se incluye
  const totalGastosAdministrativos = gastosFiltrados
    .filter(gasto => gasto.tipoGasto === 'Administrativo')
    .reduce((sum, gasto) => sum + gasto.monto, 0);

  // Para usuarios no-admin: filtrar solo gastos OPERACIONALES
  // Los usuarios no-admin NUNCA ven gastos administrativos
  const gastosVisiblesEnTabla = gastosFiltrados.filter(gasto => !gasto.tipoGasto || gasto.tipoGasto === 'Operacional');

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  const handleOpenDialog = (gasto?: Gasto) => {
    if (gasto) {
      // Modo edición: un gasto existente
      setEditingGasto(gasto);
      setCategoriaGastoId(gasto.categoriaGastoId);
      setProveedorId(gasto.proveedorId || '');
      setMonto(gasto.monto.toString());
      setFecha(new Date(gasto.fecha));
      setMetodoPagoId(gasto.metodoPagoId || '');
      setReferencia(gasto.referencia || '');
      setNota(gasto.nota || '');
    } else {
      // Modo nuevo: múltiples gastos
      setEditingGasto(null);
      setGastosPendientes([]); // Limpiar lista
      // Valores por defecto se establecen en useEffect
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGasto(null);
    setError(null);
  };

  const handleAgregarGasto = () => {
    // Validar que monto sea mayor a 0
    if (!monto || parseFloat(monto) <= 0) {
      setError('El monto es obligatorio y debe ser mayor a 0.');
      return;
    }

    // categoriaGastoId siempre debe tener un valor (viene preseleccionada como "Insumos")
    const finalCategoriaId = categoriaGastoId || (categoriasGasto.find(c => c.nombre === 'Insumos')?.id) || categoriasGasto[0]?.id;

    const nuevoGasto: GastoPendiente = {
      tempId: `gasto-${Date.now()}-${Math.random()}`,
      categoriaGastoId: finalCategoriaId as number,
      proveedorId: proveedorId ? (proveedorId as number) : undefined,
      monto: parseFloat(monto),
      nota: nota || undefined,
      tipoGasto: tipoGasto || 'Operacional',
    };

    setGastosPendientes([...gastosPendientes, nuevoGasto]);
    // Limpiar campos por-gasto para el siguiente, PERO MANTENER categoría en "Insumos" y tipo en "Operacional"
    const insumosCategory = categoriasGasto.find(c => c.nombre === 'Insumos');
    setCategoriaGastoId(insumosCategory?.id || categoriasGasto[0]?.id || '');
    setProveedorId('');
    setMonto('');
    setNota('');
    setTipoGasto('Operacional');
    setError(null); // Limpiar errores previos
  };

  const handleRemoverGasto = (tempId: string) => {
    setGastosPendientes(gastosPendientes.filter(g => g.tempId !== tempId));
  };

  const handleAgregarNuevoProveedor = async () => {
    if (!newProveedorName.trim()) {
      setError('El nombre del proveedor es requerido.');
      return;
    }

    try {
      const response = await apiService.post(API_ENDPOINTS.PROVEEDORES, {
        nombre: newProveedorName.trim(),
      });

      if (response.success && response.data) {
        // Agregar el nuevo proveedor a la lista
        setProveedores([...proveedores, response.data]);
        // Seleccionar el nuevo proveedor
        setProveedorId(response.data.id);
        // Cerrar el dialog
        setOpenNewProveedorDialog(false);
        setNewProveedorName('');
        setError(null);
      } else {
        setError(response.error || 'Error al crear el proveedor.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el proveedor.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Usar sucursalId (campo que viene del backend) o idSucursal (compatibilidad)
    const sucursalId = usuario?.sucursalId || usuario?.idSucursal;
    
    if (!sucursalId) {
      setError('No se pudo obtener la sucursal del usuario. Intenta iniciar sesión de nuevo.');
      setSubmitting(false);
      return;
    }

    try {
      if (editingGasto) {
        // Editar gasto existente (flujo antiguo)
        if (!monto || parseFloat(monto) <= 0) {
          setError('El monto es obligatorio y debe ser mayor a 0.');
          setSubmitting(false);
          return;
        }

        // Usar defaults si no están seleccionados
        const finalCategoriaId = categoriaGastoId || (categoriasGasto.find(c => c.nombre === 'Insumos')?.id) || categoriasGasto[0]?.id;
        const finalMetodoPagoId = metodoPagoId || (metodosPago.find(m => m.nombre === 'Efectivo')?.id) || metodosPago[0]?.id;

        // IMPORTANTE: En edición, NO cambiar la fecha si no se modificó
        // Esto previene que al editar solo el monto, se actualice también la fecha
        const fechaOriginal = editingGasto ? new Date(editingGasto.fecha) : null;
        const fechaCambio = fecha && fechaOriginal && 
          fecha.toDateString() !== fechaOriginal.toDateString() 
          ? fecha.toISOString() 
          : undefined;

        const request: CrearGastoRequest = {
          categoriaGastoId: finalCategoriaId as number,
          proveedorId: proveedorId ? (proveedorId as number) : undefined,
          sucursalId: sucursalId,
          monto: parseFloat(monto),
          fecha: fechaCambio, // Solo enviar la fecha si cambió
          metodoPagoId: finalMetodoPagoId as number,
          referencia: referencia || undefined,
          nota: nota || undefined,
          tipoGasto: tipoGasto || 'Operacional',
        };

        const response = await apiService.put(`${API_ENDPOINTS.GASTOS}/${editingGasto.id}`, request);
        if (response.success) {
          setSuccessMessage('Gasto actualizado con éxito.');
          handleCloseDialog();
          loadData();
        } else {
          setError(response.error || 'Error al procesar el gasto.');
        }
      } else {
        // Crear múltiples gastos nuevos (o 1 si está en el formulario)
        
        // Si no hay gastos pendientes pero hay datos en el formulario, registrar ese 1 gasto
        if (gastosPendientes.length === 0 && monto && parseFloat(monto) > 0) {
          const finalCategoriaId = categoriaGastoId || (categoriasGasto.find(c => c.nombre === 'Insumos')?.id) || categoriasGasto[0]?.id;
          const finalMetodoPagoId = metodoPagoId || (metodosPago.find(m => m.nombre === 'Efectivo')?.id) || metodosPago[0]?.id;

          const request: CrearGastoRequest = {
            categoriaGastoId: finalCategoriaId as number,
            proveedorId: proveedorId ? (proveedorId as number) : undefined,
            sucursalId: sucursalId,
            monto: parseFloat(monto),
            fecha: fecha ? fecha.toISOString() : undefined,
            metodoPagoId: finalMetodoPagoId as number,
            referencia: referencia || undefined,
            nota: nota || undefined,
            tipoGasto: tipoGasto || 'Operacional',
          };

          const response = await apiService.post(API_ENDPOINTS.GASTOS, request);
          if (response.success) {
            setSuccessMessage('Gasto registrado con éxito.');
            handleCloseDialog();
            loadData();
          } else {
            setError(response.error || 'Error al procesar el gasto.');
          }
          return;
        }

        // Si no hay gastos pendientes y tampoco datos en formulario, mostrar error
        if (gastosPendientes.length === 0) {
          setError('Debe agregar al menos un gasto.');
          setSubmitting(false);
          return;
        }

        // Crear todos los gastos pendientes en paralelo
        const requestsPromises = gastosPendientes.map((gasto) => {
          const request: CrearGastoRequest = {
            categoriaGastoId: gasto.categoriaGastoId,
            proveedorId: gasto.proveedorId,
            sucursalId: sucursalId,
            monto: gasto.monto,
            fecha: fecha ? fecha.toISOString() : undefined,
            metodoPagoId: metodoPagoId ? (metodoPagoId as number) : undefined,
            nota: gasto.nota,
            tipoGasto: gasto.tipoGasto || 'Operacional',
          };
          return apiService.post(API_ENDPOINTS.GASTOS, request);
        });

        const responses = await Promise.all(requestsPromises);

        // Verificar si todos fueron exitosos
        const allSuccess = responses.every(r => r.success);
        const failedCount = responses.filter(r => !r.success).length;

        if (allSuccess) {
          setSuccessMessage(`${gastosPendientes.length} gasto(s) registrado(s) con éxito.`);
          handleCloseDialog();
          loadData();
        } else {
          setError(`${failedCount} de ${gastosPendientes.length} gasto(s) fallaron. Revisa los datos.`);
        }
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

        {/* Resumen - Solo para usuarios no-admin: Solo Gastos Operacionales */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Gastos Registrados (Resumen del Día)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ${totalGastosOperacionales.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gastosFiltrados.filter(g => !g.tipoGasto || g.tipoGasto === 'Operacional').length} gastos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabla de gastos */}
        <Card>
          <CardContent>
            {/* Hook para agrupar gastos por hora */}
            {(() => {
              const gastoGrouped = useGroupExpensesByTime(gastosVisiblesEnTabla);
              return (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Proveedor</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Método de Pago</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gastoGrouped.length > 0 ? (
                        gastoGrouped.map((group) => (
                          <ExpandableExpenseRow
                            key={group.timeGroup}
                            gastos={group.gastos}
                            timeGroup={group.timeGroup}
                            onEdit={(gasto) => {
                              if (isAdmin) {
                                handleOpenDialog(gasto);
                              }
                            }}
                            onDelete={(gastoId) => {
                              if (isAdmin) {
                                handleDelete(gastoId);
                              }
                            }}
                            isLoading={loading}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No hay gastos registrados para el rango de fechas seleccionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              );
            })()}
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
                {/* Campos comunes: Fecha y Método de Pago */}
                {!editingGasto && (
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Datos comunes para todos los gastos
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <DatePicker
                        label="Fecha"
                        value={fecha}
                        onChange={setFecha}
                        slotProps={{ textField: { fullWidth: true } }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="metodo-label">Método de Pago</InputLabel>
                        <Select
                          labelId="metodo-label"
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
                    </Box>
                  </Box>
                )}

                {/* Campos por gasto (o campos completos si está en modo edición) */}
                {editingGasto && (
                  <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                      <DatePicker
                        label="Fecha"
                        value={fecha}
                        onChange={setFecha}
                        slotProps={{ textField: { fullWidth: true } }}
                      />

                      <FormControl fullWidth>
                        <InputLabel id="metodo-label">Método de Pago</InputLabel>
                        <Select
                          labelId="metodo-label"
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
                    </Box>
                  </>
                )}

                {/* Formulario para agregar gastos individuales */}
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {editingGasto ? 'Datos del Gasto' : 'Agregar Gasto'}
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 2 }}>
                    {/* Row 1: Tipo de Gasto y Categoría */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Tipo de Gasto"
                        value="Operacional"
                        disabled
                        size="small"
                      />

                      <FormControl fullWidth required>
                        <InputLabel id="categoria-label" size="small">Categoría</InputLabel>
                        <Select
                          labelId="categoria-label"
                          value={categoriaGastoId}
                          onChange={(e) => setCategoriaGastoId(Number(e.target.value))}
                          label="Categoría"
                          size="small"
                        >
                          {categoriasGasto.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Row 2: Monto y Proveedor Autocomplete */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Monto *"
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (gastosPendientes.length > 0) {
                              handleSubmit(e as any);
                            } else {
                              handleAgregarGasto();
                            }
                          }
                        }}
                        inputProps={{ step: '0.01', min: '0.01' }}
                        size="small"
                      />

                      <Autocomplete
                        freeSolo={false}
                        options={proveedores}
                        getOptionLabel={(prov) => (typeof prov === 'string' ? prov : prov.nombre || '')}
                        value={proveedores.find(p => p.id === proveedorId) || null}
                        onChange={(event, newValue) => {
                          if (newValue && typeof newValue !== 'string') {
                            setProveedorId(newValue.id);
                          } else {
                            setProveedorId('');
                          }
                        }}
                        inputValue={proveedorSearchText}
                        onInputChange={(event, value) => {
                          setProveedorSearchText(value);
                        }}
                        noOptionsText={
                          <Button
                            fullWidth
                            variant="text"
                            size="small"
                            onClick={() => {
                              setNewProveedorName(proveedorSearchText);
                              setOpenNewProveedorDialog(true);
                            }}
                            disabled={!proveedorSearchText.trim()}
                          >
                            + Crear Nuevo: "{proveedorSearchText}"
                          </Button>
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Proveedor"
                            placeholder="Buscar o crear proveedor"
                            size="small"
                          />
                        )}
                      />
                    </Box>

                    {/* Row 3: Concepto */}
                    <TextField
                      fullWidth
                      label="Concepto o Descripción"
                      multiline
                      rows={1}
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Describe el concepto del gasto"
                      size="small"
                    />

                    {/* Row 4: Botón Agregar */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAgregarGasto}
                      sx={{ minHeight: '40px' }}
                    >
                      + Agregar
                    </Button>
                  </Stack>
                </Box>

                {/* Tabla de gastos pendientes (solo en modo nuevo) */}
                {!editingGasto && gastosPendientes.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Gastos a Registrar ({gastosPendientes.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell>Categoría</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell>Proveedor</TableCell>
                            <TableCell>Concepto</TableCell>
                            <TableCell align="center">Acción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {gastosPendientes.map((gasto) => {
                            const categoria = categoriasGasto.find(c => c.id === gasto.categoriaGastoId);
                            const proveedor = gasto.proveedorId ? proveedores.find(p => p.id === gasto.proveedorId) : null;
                            return (
                              <TableRow key={gasto.tempId}>
                                <TableCell>{categoria?.nombre || '-'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  ${gasto.monto.toFixed(2)}
                                </TableCell>
                                <TableCell>{proveedor?.nombre || '-'}</TableCell>
                                <TableCell>{gasto.nota || '-'}</TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoverGasto(gasto.tempId)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AttachMoney />}
                disabled={submitting}
              >
                {submitting ? 'Procesando...' : (editingGasto ? 'Actualizar' : `Registrar ${gastosPendientes.length > 0 ? `(${gastosPendientes.length})` : ''}`)}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Dialog para crear nuevo proveedor */}
        <Dialog
          open={openNewProveedorDialog}
          onClose={() => {
            setOpenNewProveedorDialog(false);
            setNewProveedorName('');
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nombre del Proveedor"
              value={newProveedorName}
              onChange={(e) => setNewProveedorName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAgregarNuevoProveedor();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenNewProveedorDialog(false);
                setNewProveedorName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarNuevoProveedor}
              variant="contained"
              disabled={!newProveedorName.trim()}
            >
              Crear
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

