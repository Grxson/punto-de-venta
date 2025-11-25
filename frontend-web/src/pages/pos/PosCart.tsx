import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, IconButton, Divider, Stack } from '@mui/material';
import { Add, Remove, Delete, ArrowBack, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// TODO: Implementar estado global del carrito
// Por ahora, placeholder
export default function PosCart() {
  const navigate = useNavigate();
  const [cart] = useState<any[]>([]);

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
            {cart.map((item, index) => (
              <Card key={index}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{item.producto?.nombre || 'Producto'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.producto?.precio?.toFixed(2) || '0.00'} c/u
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Decrementar cantidad
                        }}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center' }}>
                        {item.cantidad || 0}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // TODO: Incrementar cantidad
                        }}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          // TODO: Eliminar del carrito
                        }}
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
                  $0.00
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

