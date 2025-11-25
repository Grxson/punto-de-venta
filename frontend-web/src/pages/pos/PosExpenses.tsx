import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { ArrowBack, AttachMoney } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useAuth } from '../../contexts/AuthContext';

interface CategoriaGasto {
  id: number;
  nombre: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

interface MetodoPago {
  id: number;
  nombre: string;
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
  const [categoriasGasto, setCategoriasGasto] = useState<CategoriaGasto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);

  const [categoriaGastoId, setCategoriaGastoId] = useState<number | ''>('');
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<Date | null>(new Date());
  const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');
  const [referencia, setReferencia] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar categorías activas (sin restricciones)
      const categoriasRes = await apiService.get(`${API_ENDPOINTS.CATEGORIAS_GASTO}/activas`);
      if (categoriasRes.success) {
        setCategoriasGasto(categoriasRes.data || []);
      }

      // Cargar métodos de pago activos (sin restricciones)
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!categoriaGastoId || !monto || parseFloat(monto) <= 0) {
      setError('La categoría y el monto son obligatorios y el monto debe ser mayor a 0.');
      setSubmitting(false);
      return;
    }

    if (!usuario?.sucursalId) {
      setError('No se pudo obtener la sucursal del usuario. Intenta iniciar sesión de nuevo.');
      setSubmitting(false);
      return;
    }

    try {
      const request: CrearGastoRequest = {
        categoriaGastoId: categoriaGastoId as number,
        proveedorId: proveedorId ? (proveedorId as number) : undefined,
        sucursalId: usuario.sucursalId,
        monto: parseFloat(monto),
        fecha: fecha ? fecha.toISOString() : undefined,
        metodoPagoId: metodoPagoId ? (metodoPagoId as number) : undefined,
        referencia: referencia || undefined,
        nota: nota || undefined,
      };

      const response = await apiService.post(API_ENDPOINTS.GASTOS, request);
      if (response.success) {
        setSuccessMessage('Gasto registrado con éxito.');
        // Limpiar formulario
        setCategoriaGastoId('');
        setProveedorId('');
        setMonto('');
        setFecha(new Date());
        setMetodoPagoId('');
        setReferencia('');
        setNota('');
        // Opcional: redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/pos');
        }, 2000);
      } else {
        setError(response.error || 'Error al registrar el gasto.');
      }
    } catch (err: any) {
      setError('Error de conexión al registrar el gasto: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pos')}
          sx={{ mr: 2, minHeight: '48px' }}
        >
          Volver
        </Button>
        <Typography variant="h4">Registrar Gasto</Typography>
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

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Categoría de Gasto *"
                  value={categoriaGastoId}
                  onChange={(e) => setCategoriaGastoId(Number(e.target.value))}
                  required
                  sx={{ minHeight: '56px' }}
                >
                  <MenuItem value="">Selecciona una categoría</MenuItem>
                  {categoriasGasto.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Monto *"
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  inputProps={{ step: '0.01', min: '0.01' }}
                  required
                  sx={{ minHeight: '56px' }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={fecha}
                    onChange={setFecha}
                    slotProps={{ textField: { fullWidth: true, sx: { minHeight: '56px' } } }}
                  />
                </LocalizationProvider>

                <TextField
                  fullWidth
                  select
                  label="Proveedor (Opcional)"
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value ? Number(e.target.value) : '')}
                  sx={{ minHeight: '56px' }}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Método de Pago (Opcional)"
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value ? Number(e.target.value) : '')}
                  sx={{ minHeight: '56px' }}
                >
                  <MenuItem value="">Ninguno</MenuItem>
                  {metodosPago.map((metodo) => (
                    <MenuItem key={metodo.id} value={metodo.id}>
                      {metodo.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label="Referencia (Opcional)"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  sx={{ minHeight: '56px' }}
                />
              </Box>

              <TextField
                fullWidth
                label="Nota (Opcional)"
                multiline
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/pos')}
                  sx={{ minHeight: '48px' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<AttachMoney />}
                  disabled={submitting}
                  sx={{ minHeight: '48px' }}
                >
                  {submitting ? 'Registrando...' : 'Registrar Gasto'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

