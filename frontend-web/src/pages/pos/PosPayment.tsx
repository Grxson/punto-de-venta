import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

/** Método de pago configurado por el administrador. */
interface MetodoPago {
  /** Id del método de pago. */
  id: number;
  /** Nombre visible en los botones (Efectivo, Tarjeta, etc.). */
  nombre: string;
  /** Si el cobro exige capturar una referencia (transferencia, cheque). */
  requiereReferencia: boolean;
  /** Sólo se ofrecen los métodos activos. */
  activo: boolean;
  /** Detalle opcional para mostrar al cajero. */
  descripcion?: string;
}

/**
 * Cobro del carrito: resumen de la venta, elección de método y registro de la venta.
 * @remarks Es el paso que descuenta inventario y deja el ticket registrado. Al
 * terminar limpia el carrito y devuelve al cajero al inicio del punto de venta.
 */
export default function PosPayment() {
  const navigate = useNavigate();
  const { cart, total, clearCart } = useCart();
  const { sucursal } = useAuth();
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Los métodos de pago se piden al montar: sin ellos no se puede cobrar
  useEffect(() => {
    loadMetodosPago();
  }, []);

  /**
   * Carga los métodos de pago activos y preselecciona el primero.
   * @remarks Se usa `useEffect` en lugar de React Query porque la lista cambia muy
   * rara vez y sólo se necesita una vez al entrar a la pantalla.
   */
  const loadMetodosPago = async () => {
    try {
      setLoadingMetodos(true);
      setError(null);
      const response = await apiService.get(API_ENDPOINTS.PAYMENT_METHODS + '/activos');
      if (response.success && response.data) {
        setMetodosPago(response.data);
        if (response.data.length > 0) {
          setMetodoSeleccionado(response.data[0]);
        } else {
          setError('No hay métodos de pago disponibles. Contacta al administrador.');
        }
      } else {
        setError(response.error || 'Error al cargar métodos de pago');
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar métodos de pago');
    } finally {
      setLoadingMetodos(false);
    }
  };

  /**
   * Registra la venta con el método elegido y, si el backend responde bien,
   * vacía el carrito y vuelve al inicio del punto de venta.
   * @remarks `isProcessing` bloquea el doble clic para no cobrar dos veces:
   * los botones de método y de confirmación quedan deshabilitados mientras dura
   * la petición. Los fallos lo restablecen para permitir el reintento.
   */
  const handleProcesarPago = async () => {
    if (isProcessing) {
      console.warn('⚠️ Pago ya está siendo procesado, ignora');
      return;
    }

    if (!metodoSeleccionado) {
      setError('Selecciona un método de pago');
      return;
    }

    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    try {
      setIsProcessing(true);
      setLoading(true);
      setError(null);

      // El precio unitario manda el override cuando el cajero lo editó
      const items = cart.map((item) => {
        const unitPrice = item.overridePrice ?? item.producto.precio;
        return {
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: unitPrice,
          subtotal: unitPrice * item.cantidad,
        };
      });

      // El POS cobra un solo método, así que el pago siempre es uno
      const pagos = [
        {
          metodoPagoId: metodoSeleccionado.id,
          monto: total,
          referencia: null,
        },
      ];

      const ventaRequest = {
        // La sucursal sale del JWT del usuario, no se la elige en el formulario
        sucursalId: sucursal?.id || 1,
        items,
        pagos,
        canal: 'POS',
      };

      const response = await apiService.post(API_ENDPOINTS.SALES, ventaRequest);

      if (response.success) {
        clearCart();
        // Respaldo por si el usuario navega fuera antes de leer el aviso
        localStorage.setItem('ventaExitosa', 'true');
        navigate('/pos', { state: { ventaExitosa: true } });
      } else {
        setError(response.error || 'Error al procesar la venta');
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago');
      setIsProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona el método de pago activo y limpia el error anterior.
   * @remarks Seleccionar no cobra: el cobro exige pulsar "Confirmar Pago", para
   * que un toque accidental no cierre la venta.
   * @param metodo - Método de pago que el cajero acaba de elegir.
   */
  const handleMetodoClick = (metodo: MetodoPago) => {
    if (isProcessing) {
      return;
    }
    setMetodoSeleccionado(metodo);
    setError(null);
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
          onClick={() => navigate('/pos')}
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
          <Box sx={{
            mb: 2,
            maxHeight: '300px',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}>
            {cart.map((item) => {
              const unitPrice = item.overridePrice ?? item.producto.precio;
              return (
                <Box key={item.producto.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.producto.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.cantidad} x ${unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      ${(unitPrice * item.cantidad).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
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

          <Alert severity="info" sx={{ mb: 2 }}>
            Selecciona el método de pago y pulsa Confirmar Pago
          </Alert>

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
                  onClick={() => handleMetodoClick(metodo)}
                  disabled={loading || isProcessing}
                  sx={{
                    minHeight: '80px',
                    fontSize: '16px',
                    position: 'relative',
                  }}
                >
                  {loading && metodoSeleccionado?.id === metodo.id ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <span>{metodo.nombre}</span>
                      {metodoSeleccionado?.id === metodo.id && (
                        <Box
                          component="span"
                          sx={{
                            display: 'block',
                            fontSize: '12px',
                            mt: 1,
                            fontWeight: 'normal',
                            textAlign: 'center',
                            width: '100%',
                          }}
                        >
                          Seleccionado
                        </Box>
                      )}
                    </Box>
                  )}
                </Button>
              ))}
            </Box>
          )}

          {/* Confirmación explícita del pago */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!metodoSeleccionado || loading || isProcessing}
            onClick={handleProcesarPago}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Payment />}
            sx={{ mt: 3, minHeight: '56px', fontSize: '18px' }}
          >
            {loading ? 'Procesando pago...' : 'Confirmar Pago'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
