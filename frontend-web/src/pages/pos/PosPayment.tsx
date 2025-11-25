import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

interface MetodoPago {
  id: number;
  nombre: string;
  requiereReferencia: boolean;
  activo: boolean;
  descripcion?: string;
}

export default function PosPayment() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(null);
  const [referencia, setReferencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetodosPago();
  }, []);

  const loadMetodosPago = async () => {
    try {
      setLoadingMetodos(true);
      setError(null);
      const response = await apiService.get(API_ENDPOINTS.PAYMENT_METHODS + '/activos');
      if (response.success && response.data) {
        setMetodosPago(response.data);
        // Seleccionar el primer método por defecto
        if (response.data.length > 0) {
          setMetodoSeleccionado(response.data[0]);
        } else {
          setError('No hay métodos de pago disponibles. Contacta al administrador.');
        }
      } else {
        setError(response.error || 'Error al cargar métodos de pago');
      }
    } catch (err: any) {
      console.error('Error al cargar métodos de pago:', err);
      setError(err.message || 'Error al cargar métodos de pago');
    } finally {
      setLoadingMetodos(false);
    }
  };

  const handleProcesarPago = async () => {
    if (!metodoSeleccionado) {
      setError('Selecciona un método de pago');
      return;
    }

    if (metodoSeleccionado.requiereReferencia && !referencia.trim()) {
      setError('Este método de pago requiere una referencia');
      return;
    }

    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar items de venta
      const items = cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
      }));

      // Preparar pago
      const pagos = [
        {
          metodoPagoId: metodoSeleccionado.id,
          monto: total,
          referencia: metodoSeleccionado.requiereReferencia ? referencia : null,
        },
      ];

      // Crear venta
      const ventaRequest = {
        sucursalId: 1, // TODO: Obtener de usuario o contexto
        items,
        pagos,
        canal: 'POS',
      };

      const response = await apiService.post(API_ENDPOINTS.SALES, ventaRequest);

      if (response.success) {
        // Limpiar carrito
        clearCart();
        // Redirigir a home con mensaje de éxito
        navigate('/pos', { state: { ventaExitosa: true } });
      } else {
        setError(response.error || 'Error al procesar la venta');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (loadingMetodos) {
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
          onClick={() => navigate('/pos/cart')}
          sx={{ mr: 2, minHeight: '48px' }}
        >
          Volver
        </Button>
        <Typography variant="h4">Método de Pago</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Resumen de la venta */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen de la Venta
          </Typography>
          
          {/* Lista de productos */}
          <Box sx={{ mb: 2, maxHeight: '300px', overflowY: 'auto' }}>
            {cart.map((item) => (
              <Box key={item.producto.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {item.producto.nombre}
                      {item.producto.nombreVariante && (
                        <Typography component="span" variant="body2" color="primary" sx={{ ml: 1, fontWeight: 'bold' }}>
                          ({item.producto.nombreVariante})
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.cantidad} x ${item.producto.precio.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Total de productos:</Typography>
            <Typography variant="body1" fontWeight="bold">
              {cart.reduce((sum, item) => sum + item.cantidad, 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total a pagar:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Métodos de pago */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selecciona el método de pago
          </Typography>

          {metodosPago.length === 0 ? (
            <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No hay métodos de pago disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contacta al administrador para configurar métodos de pago
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                gap: 2,
                mt: 2,
              }}
            >
              {metodosPago.map((metodo) => (
                <Button
                  key={metodo.id}
                  variant={metodoSeleccionado?.id === metodo.id ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => {
                    setMetodoSeleccionado(metodo);
                    setReferencia('');
                    setError(null);
                  }}
                  sx={{ minHeight: '80px', fontSize: '16px' }}
                >
                  {metodo.nombre}
                </Button>
              ))}
            </Box>
          )}

          {metodoSeleccionado?.requiereReferencia && (
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Referencia"
                placeholder="Número de referencia, transacción, etc."
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                required
                sx={{ minHeight: '48px' }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Botón de procesar pago */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
        onClick={handleProcesarPago}
        disabled={loading || !metodoSeleccionado || cart.length === 0}
        sx={{ minHeight: '60px', fontSize: '18px', fontWeight: 'bold' }}
      >
        {loading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
      </Button>
    </Box>
  );
}
