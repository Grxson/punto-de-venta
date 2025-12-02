import { Box, Typography, Card, CardContent, Button, IconButton, Divider, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { Add, Remove, Delete, ArrowBack, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function PosCart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, total, updateItemPrice } = useCart();
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/pos')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          Carrito de Compras
        </Typography>
      </Box>

      {cart.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              El carrito está vacío
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/pos')}
              sx={{ mt: 2, minHeight: '48px' }}
            >
              Agregar Productos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack spacing={2}>
            {cart.map((item) => (
              <Card key={item.producto.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div">
                        {item.producto?.nombre || 'Producto'}
                      </Typography>
                      {item.producto?.nombreVariante && (
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                          Tamaño: {item.producto.nombreVariante}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {editingPriceId === item.producto.id ? (
                          <TextField
                            autoFocus
                            size="small"
                            type="number"
                            inputProps={{ step: '0.01', min: '0' }}
                            value={(item.overridePrice ?? item.producto?.precio ?? 0).toFixed(2)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateItemPrice(item.producto.id, isNaN(val) ? 0 : val);
                            }}
                            onBlur={() => setEditingPriceId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingPriceId(null);
                              if (e.key === 'Escape') {
                                // Reset a precio original al cancelar
                                updateItemPrice(item.producto.id, item.producto?.precio ?? 0);
                                setEditingPriceId(null);
                              }
                            }}
                            sx={{ maxWidth: 120 }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.25, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setEditingPriceId(item.producto.id)}
                          >
                            ${(item.overridePrice ?? item.producto?.precio ?? 0).toFixed(2)}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          c/u
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
                        {item.cantidad}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.producto.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Card sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<Payment />}
                onClick={() => navigate('/pos/payment')}
                sx={{ minHeight: '48px' }}
              >
                Proceder al Pago
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

