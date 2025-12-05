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
  const [loading, setLoading] = useState(false);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickTimers, setClickTimers] = useState<Record<number, ReturnType<typeof setTimeout> | null>>({});
  const [isProcessing, setIsProcessing] = useState(false); // Prevenir pagos duplicados

  // Obtiene el nombre base sin el sufijo de variante (Chico/Mediano/Grande)
  const obtenerNombreBase = (p: any): string => {
    if (!p?.nombreVariante) return p?.nombre ?? '';
    let nombre = (p?.nombre || '').trim();
    const sufijos = ['Chico', 'Mediano', 'Grande'];
    for (const sufijo of sufijos) {
      const re = new RegExp(`\\s+${sufijo}$`, 'i');
      if (re.test(nombre)) {
        nombre = nombre.replace(re, '').trim();
        break;
      }
    }
    return nombre;
  };

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
    // Prevenir ejecución duplicada si ya está procesando
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
      setIsProcessing(true); // Marcar como procesando
      setLoading(true);
      setError(null);

      // Preparar items de venta (usar overridePrice si fue editado)
      const items = cart.map((item) => {
        const unitPrice = item.overridePrice ?? item.producto.precio;
        return {
          productoId: item.producto.id,
          cantidad: item.cantidad,
          precioUnitario: unitPrice,
          subtotal: unitPrice * item.cantidad,
        };
      });

      // Preparar pago
      const pagos = [
        {
          metodoPagoId: metodoSeleccionado.id,
          monto: total,
          referencia: null, // Siempre null, no se usa
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
        // Guardar indicador de venta exitosa en localStorage como respaldo
        localStorage.setItem('ventaExitosa', 'true');
        // Redirigir a home con mensaje de éxito
        navigate('/pos', { state: { ventaExitosa: true } });
      } else {
        setError(response.error || 'Error al procesar la venta');
        setIsProcessing(false); // Permitir reintentos en caso de error
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      setIsProcessing(false); // Permitir reintentos en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleMetodoClick = (metodo: MetodoPago) => {
    // Prevenir clics si ya está procesando
    if (isProcessing) {
      return;
    }

    // Cancelar timer anterior si existe
    if (clickTimers[metodo.id]) {
      clearTimeout(clickTimers[metodo.id]!);
    }

    // Si ya está seleccionado, es el segundo clic -> procesar pago
    if (metodoSeleccionado?.id === metodo.id) {
      handleProcesarPago();
      return;
    }

    // Primer clic: seleccionar el método
    setMetodoSeleccionado(metodo);
    setError(null);

    // Establecer timer para resetear después de 3 segundos
    const timer = setTimeout(() => {
      setClickTimers(prev => ({ ...prev, [metodo.id]: null }));
    }, 3000);

    setClickTimers(prev => ({ ...prev, [metodo.id]: timer }));
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
            pr: 1, // Padding derecho para separar del scrollbar
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
                        {item.producto.nombreVariante
                          ? `${obtenerNombreBase(item.producto)} - ${item.producto.nombreVariante}`
                          : item.producto.nombre}
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
            {metodoSeleccionado 
              ? '¡Haz doble clic en el método seleccionado para confirmar el pago!' 
              : 'Haz clic para seleccionar un método de pago'}
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
                    ...(metodoSeleccionado?.id === metodo.id && {
                      animation: 'pulse 1s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          transform: 'scale(1)',
                        },
                        '50%': {
                          transform: 'scale(1.05)',
                        },
                      },
                    }),
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
                          (Clic otra vez para pagar)
                        </Box>
                      )}
                    </Box>
                  )}
                </Button>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
