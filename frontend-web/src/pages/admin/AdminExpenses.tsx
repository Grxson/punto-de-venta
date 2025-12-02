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
  Stack,
  Autocomplete,
} from '@mui/material';
import { Add, Delete, AttachMoney, Edit } from '@mui/icons-material';
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
  tipoGasto?: string;
  comprobanteUrl?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  createdAt: string;
}

interface GastoPendiente {
  tempId: string;
  categoriaGastoId: number;
  proveedorId?: number;
  monto: number;
  nota?: string;
  tipoGasto: string;
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
  const [openNewProveedorDialog, setOpenNewProveedorDialog] = useState(false);
  const [newProveedorName, setNewProveedorName] = useState<string>('');
  
  // Estado para el filtro de fechas
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });

  // Estado para filtro de tipo de gasto
  const [filtroTipoGasto, setFiltroTipoGasto] = useState<'todos' | 'operacional' | 'administrativo'>('todos');

  // Campos comunes para todos los gastos
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');
  const [tipoGasto, setTipoGasto] = useState<string>('Operacional'); // Nuevo: tipo de gasto

  // Campos por-gasto (input temporal)
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [proveedorSearchText, setProveedorSearchText] = useState<string>(''); // Búsqueda editable
  const [monto, setMonto] = useState<string>('');
  const [nota, setNota] = useState<string>('');
  const [referencia, setReferencia] = useState<string>('');

  // Gastos pendientes para registrar
  const [gastosPendientes, setGastosPendientes] = useState<GastoPendiente[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Monitor de cambios en estado de gastos
  useEffect(() => {
    console.log('👀 [useEffect] Estado de gastos cambió:', {
      totalGastos: gastos.length,
      gastos: gastos.map(g => ({ id: g.id, monto: g.monto, fecha: g.fecha, tipo: g.tipoGasto }))
    });
  }, [gastos]);

  // Cuando el diálogo se abre, establecer valores por defecto
  useEffect(() => {
    if (openDialog && categorias.length > 0 && metodosPago.length > 0) {
      if (!editingGasto) {
        // Nuevo gasto: establecer defaults
        const efectivoMethod = metodosPago.find(met => met.nombre.toLowerCase() === 'efectivo');
        if (efectivoMethod) {
          setMetodoPagoId(efectivoMethod.id);
        }
        setFecha(new Date());
        // Defaults para campos por-gasto
        const insumosCategory = categorias.find(cat => cat.nombre.toLowerCase() === 'insumos');
        if (insumosCategory) {
          setCategoriaId(insumosCategory.id);
        }
        setProveedorId('');
        setMonto('');
        setNota('');
      } else {
        // Edición de gasto existente
        setCategoriaId(editingGasto.categoriaGastoId);
        setProveedorId(editingGasto.proveedorId || '');
        setMonto(editingGasto.monto.toString());
        setFecha(new Date(editingGasto.fecha));
        setMetodoPagoId(editingGasto.metodoPagoId || '');
        setNota(editingGasto.nota || '');
      }
    }
  }, [openDialog, editingGasto, categorias, metodosPago]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar gastos
      console.log('� [loadData] Iniciando carga de gastos...');
      console.log('📍 Endpoint:', API_ENDPOINTS.GASTOS);
      const gastosResponse = await apiService.get(API_ENDPOINTS.GASTOS);
      
      console.log('� [loadData] Respuesta completa del API:', gastosResponse);
      
      if (gastosResponse.success && gastosResponse.data) {
        console.log('✅ [loadData] Gastos cargados correctamente. Total:', gastosResponse.data.length);
        console.log('📋 [loadData] Gastos recibidos:', gastosResponse.data.map((g: any) => ({ 
          id: g.id, 
          monto: g.monto, 
          fecha: g.fecha,
          tipoGasto: g.tipoGasto,
          categoriaGasto: g.categoriaGasto?.nombre,
          updatedAt: g.updatedAt
        })));
        
        // Log antes de actualizar estado
        console.log('💾 [loadData] Actualizando estado de gastos...');
        setGastos(gastosResponse.data);
        console.log('✅ [loadData] Estado de gastos actualizado');
      } else {
        console.error('❌ [loadData] Error al cargar gastos:', gastosResponse.error);
        setError(`Error al cargar gastos: ${gastosResponse.error}`);
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
      console.error('🔴 [loadData] Error crítico:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      console.log('🏁 [loadData] Carga completada');
      setLoadingData(false);
    }
  };

  // Filtrar gastos por rango de fechas y tipo
  const gastosFiltrados = useMemo(() => {
    console.log('🔍 [useMemo gastosFiltrados] Iniciando filtrado');
    console.log('📊 Total de gastos en estado:', gastos.length);
    console.log('🗓️ Rango de fechas:', { desde: dateRange.desde, hasta: dateRange.hasta });
    console.log('💰 Filtro tipo gasto:', filtroTipoGasto);
    
    if (!dateRange.desde || !dateRange.hasta) {
      console.log('⚠️ Rango de fechas incompleto, retornando todos los gastos');
      return gastos;
    }
    
    // Crear fechas en zona horaria local
    const desde = new Date(dateRange.desde + 'T00:00:00');
    const hasta = new Date(dateRange.hasta + 'T23:59:59');
    
    console.log('🔍 Filtro aplicado:', {
      desdeISO: desde.toISOString(),
      hastaISO: hasta.toISOString(),
      desdeLocal: desde.toLocaleString(),
      hastaLocal: hasta.toLocaleString(),
      totalGastos: gastos.length,
    });
    
    // Log detallado de todos los gastos
    console.log('📋 Gastos antes de filtro:');
    gastos.forEach((g, idx) => {
      const fechaGasto = new Date(g.fecha);
      const cumpleFiltro = fechaGasto >= desde && fechaGasto <= hasta;
      console.log(`  [${idx}] ID: ${g.id}, Monto: $${g.monto}, Fecha: ${g.fecha} (${fechaGasto.toLocaleString()}), Tipo: ${g.tipoGasto}, ✓Cumple: ${cumpleFiltro}`);
    });
    
    const filtrados = gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fecha);
      const cumpleFechas = fechaGasto >= desde && fechaGasto <= hasta;
      
      // Filtro por tipo de gasto
      let cumpleTipo = true;
      if (filtroTipoGasto === 'operacional') {
        cumpleTipo = !gasto.tipoGasto || gasto.tipoGasto === 'Operacional';
      } else if (filtroTipoGasto === 'administrativo') {
        cumpleTipo = gasto.tipoGasto === 'Administrativo';
      }
      // Si filtroTipoGasto === 'todos', cumpleTipo siempre es true
      
      return cumpleFechas && cumpleTipo;
    });
    
    console.log(`✅ Gastos filtrados: ${filtrados.length} de ${gastos.length}`);
    console.log('📋 Gastos después de filtro:', filtrados.map(g => ({ id: g.id, monto: g.monto, fecha: g.fecha, tipo: g.tipoGasto })));
    
    return filtrados;
  }, [gastos, dateRange, filtroTipoGasto]);

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  const handleOpenDialog = (gasto?: Gasto) => {
    if (gasto) {
      // Modo edición: un gasto existente
      setEditingGasto(gasto);
      setCategoriaId(gasto.categoriaGastoId);
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
    // Limpiar campos del formulario
    setFecha(new Date());
    setMetodoPagoId('');
    setCategoriaId('');
    setProveedorId('');
    setMonto('');
    setNota('');
    setTipoGasto('Operacional');
    setProveedorSearchText('');
    setGastosPendientes([]);
  };

  const handleAgregarGasto = () => {
    // Validar que monto sea mayor a 0
    if (!monto || parseFloat(monto) <= 0) {
      setError('El monto es obligatorio y debe ser mayor a 0.');
      return;
    }

    // categoriaId siempre debe tener un valor (viene preseleccionada como "Insumos")
    const finalCategoriaId = categoriaId || (categorias.find(c => c.nombre === 'Insumos')?.id) || categorias[0]?.id;

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
    const insumosCategory = categorias.find(c => c.nombre === 'Insumos');
    setCategoriaId(insumosCategory?.id || categorias[0]?.id || '');
    setProveedorId('');
    setMonto('');
    setNota('');
    setTipoGasto('Operacional');
    setError(null); // Limpiar errores previos
  };

  const handleRemoverGasto = (tempId: string) => {
    setGastosPendientes(gastosPendientes.filter(g => g.tempId !== tempId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar sucursalId (campo que viene del backend) o idSucursal (compatibilidad)
      const sucursalId = usuario?.sucursalId || usuario?.idSucursal || null;

      if (editingGasto) {
        // Editar gasto existente (flujo antiguo)
        if (!editingGasto.id) {
          setError('Error: No se pudo identificar el gasto a editar.');
          setLoading(false);
          return;
        }

        if (!monto || parseFloat(monto) <= 0) {
          setError('El monto es obligatorio y debe ser mayor a 0.');
          setLoading(false);
          return;
        }

        // Usar defaults si no están seleccionados
        const finalCategoriaId = categoriaId || (categorias.find(c => c.nombre === 'Insumos')?.id) || categorias[0]?.id;
        const finalMetodoPagoId = metodoPagoId || (metodosPago.find(m => m.nombre === 'Efectivo')?.id) || metodosPago[0]?.id;

        // IMPORTANTE: En edición, NO cambiar la fecha si no se modificó
        // Esto previene que al editar solo el monto, se actualice también la fecha
        const fechaOriginal = editingGasto ? new Date(editingGasto.fecha) : null;
        const fechaCambio = fecha && fechaOriginal && 
          fecha.toDateString() !== fechaOriginal.toDateString() 
          ? fecha.toISOString() 
          : undefined;

        const request = {
          categoriaGastoId: finalCategoriaId,
          proveedorId: proveedorId || null,
          sucursalId: sucursalId,
          monto: parseFloat(monto),
          fecha: fechaCambio, // Solo enviar la fecha si cambió
          metodoPagoId: finalMetodoPagoId,
          referencia: referencia || null,
          nota: nota || null,
          tipoGasto: tipoGasto || 'Operacional',
          comprobanteUrl: null,
        };

        try {
          console.log('🔄 [PUT] Enviando solicitud de actualización');
          console.log('🎯 [PUT] Gasto ID:', editingGasto.id);
          console.log('📤 [PUT] Request body:', request);
          
          const response = await apiService.put(`${API_ENDPOINTS.GASTOS}/${editingGasto.id}`, request);
          
          console.log('📥 [PUT] Respuesta completa:', response);
          console.log('📥 [PUT] Success:', response.success);
          console.log('📥 [PUT] Response.data:', response.data);
          console.log('📥 [PUT] Response.error:', response.error);
          
          if (response.success) {
            console.log('✅ [PUT] Actualización exitosa!');
            console.log('🎉 [PUT] Gasto actualizado en BD:', response.data);
            
            handleCloseDialog();
            
            console.log('⏳ [PUT] Llamando a loadData()...');
            await loadData();
            console.log('✅ [PUT] loadData() completado');
          } else {
            console.error('❌ [PUT] Actualización falló:', response.error);
            setError(response.error || 'Error al procesar el gasto.');
          }
        } catch (updateErr: any) {
          console.error('🔴 [PUT] Error crítico:', updateErr);
          setError(updateErr.message || 'Error al actualizar el gasto.');
        }
      } else {
        // Crear múltiples gastos nuevos (o 1 si está en el formulario)
        
        // Si no hay gastos pendientes pero hay datos en el formulario, registrar ese 1 gasto
        if (gastosPendientes.length === 0 && monto && parseFloat(monto) > 0) {
          const finalCategoriaId = categoriaId || (categorias.find(c => c.nombre === 'Insumos')?.id) || categorias[0]?.id;
          const finalMetodoPagoId = metodoPagoId || (metodosPago.find(m => m.nombre === 'Efectivo')?.id) || metodosPago[0]?.id;

          const request = {
            categoriaGastoId: finalCategoriaId,
            proveedorId: proveedorId || null,
            sucursalId: sucursalId,
            monto: parseFloat(monto),
            fecha: fecha ? fecha.toISOString() : undefined,
            metodoPagoId: finalMetodoPagoId,
            referencia: referencia || null,
            nota: nota || null,
            tipoGasto: tipoGasto || 'Operacional',
            comprobanteUrl: null,
          };

          const response = await apiService.post(API_ENDPOINTS.GASTOS, request);
          if (response.success) {
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
          setLoading(false);
          return;
        }

        // Crear todos los gastos pendientes en paralelo
        const requestsPromises = gastosPendientes.map((gasto) => {
          const request = {
            categoriaGastoId: gasto.categoriaGastoId,
            proveedorId: gasto.proveedorId || null,
            sucursalId: sucursalId,
            monto: gasto.monto,
            fecha: fecha ? fecha.toISOString() : undefined,
            metodoPagoId: metodoPagoId || null,
            nota: gasto.nota || null,
            tipoGasto: gasto.tipoGasto || 'Operacional',
            comprobanteUrl: null,
          };
          return apiService.post(API_ENDPOINTS.GASTOS, request);
        });

        const responses = await Promise.all(requestsPromises);

        // Verificar si todos fueron exitosos
        const allSuccess = responses.every(r => r.success);
        const failedCount = responses.filter(r => !r.success).length;

        if (allSuccess) {
          handleCloseDialog();
          loadData();
        } else {
          setError(`${failedCount} de ${gastosPendientes.length} gasto(s) fallaron. Revisa los datos.`);
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

  const handleAgregarNuevoProveedor = async () => {
    if (!newProveedorName.trim()) {
      setError('El nombre del proveedor no puede estar vacío.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newProveedor = {
        nombre: newProveedorName.trim(),
        contacto: '',
        telefono: '',
        email: '',
        activo: true,
      };

      const response = await apiService.post(API_ENDPOINTS.PROVEEDORES, newProveedor);
      
      if (response.success && response.data) {
        // Agregar el nuevo proveedor a la lista
        setProveedores([...proveedores, response.data]);
        // Seleccionar el nuevo proveedor
        setProveedorId(response.data.id);
        setProveedorSearchText(response.data.nombre);
        // Cerrar dialog
        setOpenNewProveedorDialog(false);
        setNewProveedorName('');
        setError(null);
      } else {
        setError(response.error || 'Error al crear el proveedor.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el proveedor');
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de gastos OPERACIONALES (filtrados)
  const totalGastosOperacionalesFiltrados = gastosFiltrados
    .filter(gasto => !gasto.tipoGasto || gasto.tipoGasto === 'Operacional')
    .reduce((sum, gasto) => sum + gasto.monto, 0);

  // Calcular total de gastos ADMINISTRATIVOS (filtrados)
  const totalGastosAdministrativosFiltrados = gastosFiltrados
    .filter(gasto => gasto.tipoGasto === 'Administrativo')
    .reduce((sum, gasto) => sum + gasto.monto, 0);

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

        {/* Filtro de tipo de gasto */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="filtro-tipo-gasto-label">Tipo de Gasto</InputLabel>
            <Select
              labelId="filtro-tipo-gasto-label"
              value={filtroTipoGasto}
              onChange={(e) => setFiltroTipoGasto(e.target.value as 'todos' | 'operacional' | 'administrativo')}
              label="Tipo de Gasto"
            >
              <MenuItem value="todos">Todos los gastos</MenuItem>
              <MenuItem value="operacional">Operacionales</MenuItem>
              <MenuItem value="administrativo">Administrativos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Resumen */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
          {/* Resumen de Gastos Operacionales (Se refleja en Resumen del Día) */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Gastos Operacionales (Resumen del Día)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ${totalGastosOperacionalesFiltrados.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gastosFiltrados.filter(g => !g.tipoGasto || g.tipoGasto === 'Operacional').length} operacionales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Resumen de Gastos Administrativos (NO se refleja en Resumen del Día) */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Gastos Administrativos (NO se incluyen)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    ${totalGastosAdministrativosFiltrados.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {gastosFiltrados.filter(g => g.tipoGasto === 'Administrativo').length} administrativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabla de gastos */}
        <Card>
          <CardContent>
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
                  {gastosFiltrados.length > 0 ? (
                    gastosFiltrados.map((gasto) => (
                      <TableRow key={gasto.id}>
                        <TableCell>
                          {format(new Date(gasto.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={gasto.tipoGasto === 'Administrativo' ? 'Administrativo' : 'Operacional'}
                            size="small"
                            color={gasto.tipoGasto === 'Administrativo' ? 'warning' : 'success'}
                            variant="outlined"
                          />
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
                            color="primary"
                            onClick={() => {
                              setEditingGasto(gasto);
                              setFecha(new Date(gasto.fecha));
                              setMetodoPagoId(gasto.metodoPagoId || '');
                              setCategoriaId(gasto.categoriaGastoId || '');
                              setProveedorId(gasto.proveedorId || '');
                              setMonto(gasto.monto.toString());
                              setNota(gasto.nota || '');
                              setTipoGasto(gasto.tipoGasto || 'Operacional');
                              setOpenDialog(true);
                            }}
                            disabled={loading}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(gasto.id)}
                            disabled={loading}
                            title="Eliminar"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </DialogTitle>
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
                </>
              )}

              {/* Formulario para agregar gastos individuales */}
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {editingGasto ? 'Datos del Gasto' : 'Agregar Gasto'}
                </Typography>

                <Stack spacing={2} sx={{ mb: 2 }}>
                  {/* Fila 1: Tipo de Gasto y Categoría */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                    <FormControl fullWidth>
                      <InputLabel size="small">Tipo de Gasto</InputLabel>
                      <Select
                        value={tipoGasto}
                        onChange={(e) => setTipoGasto(e.target.value)}
                        label="Tipo de Gasto"
                        size="small"
                      >
                        <MenuItem value="Operacional">Operacional</MenuItem>
                        <MenuItem value="Administrativo">Administrativo</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                      <InputLabel id="categoria-label" size="small">Categoría</InputLabel>
                      <Select
                        labelId="categoria-label"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(Number(e.target.value))}
                        label="Categoría"
                        size="small"
                      >
                        {categorias.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Fila 2: Monto y Proveedor (Autocomplete) */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                    <TextField
                      fullWidth
                      label="Monto *"
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      onKeyDown={(e) => {
                        // Si presionas Enter en Monto:
                        // - Si hay gastos pendientes: submit del form (registrar todos)
                        // - Si no hay gastos: agregar el gasto actual
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (gastosPendientes.length > 0) {
                            // Hay gastos pendientes, registrar todos
                            handleSubmit();
                          } else {
                            // No hay gastos, agregar el gasto actual
                            handleAgregarGasto();
                          }
                        }
                      }}
                      inputProps={{ step: '0.01', min: '0.01' }}
                      size="small"
                    />

                    <Autocomplete
                      size="small"
                      options={proveedores}
                      getOptionLabel={(option) => option.nombre}
                      value={proveedores.find(p => p.id === proveedorId) || null}
                      inputValue={proveedorSearchText}
                      onInputChange={(event, newInputValue) => {
                        setProveedorSearchText(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        setProveedorId(newValue?.id || '');
                        setProveedorSearchText(newValue?.nombre || '');
                      }}
                      freeSolo={false}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Proveedor"
                          placeholder="Buscar o crear proveedor"
                        />
                      )}
                      noOptionsText={
                        <Box sx={{ p: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            No hay proveedores que coincidan
                          </Typography>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => {
                              if (proveedorSearchText.trim()) {
                                setNewProveedorName(proveedorSearchText);
                                setOpenNewProveedorDialog(true);
                              }
                            }}
                            disabled={!proveedorSearchText.trim()}
                          >
                            Crear Nuevo
                          </Button>
                        </Box>
                      }
                    />
                  </Box>

                  {/* Fila 3: Concepto o Descripción */}
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

                  {/* Fila 4: Botón Agregar */}
                  {!editingGasto && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAgregarGasto}
                      sx={{ minHeight: '40px' }}
                    >
                      + Agregar
                    </Button>
                  )}
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
                          const categoria = categorias.find(c => c.id === gasto.categoriaGastoId);
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
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<AttachMoney />}
              disabled={loading}
            >
              {loading ? 'Procesando...' : (editingGasto ? 'Actualizar' : `Registrar ${gastosPendientes.length > 0 ? `(${gastosPendientes.length})` : ''}`)}
            </Button>
          </DialogActions>
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

