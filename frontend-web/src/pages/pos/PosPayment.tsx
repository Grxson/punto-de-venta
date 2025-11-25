import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function PosPayment() {
  const navigate = useNavigate();

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
        <Typography variant="h4">
          Método de Pago
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selecciona el método de pago
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              sx={{ minHeight: '80px', fontSize: '18px' }}
            >
              Efectivo
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ minHeight: '80px', fontSize: '18px' }}
            >
              Tarjeta
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ minHeight: '80px', fontSize: '18px' }}
            >
              Transferencia
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ minHeight: '80px', fontSize: '18px' }}
            >
              Otro
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* TODO: Implementar lógica de pago */}
    </Box>
  );
}

