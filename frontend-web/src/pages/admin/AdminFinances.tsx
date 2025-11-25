import { Box, Typography } from '@mui/material';

export default function AdminFinances() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Finanzas
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Próximamente: Ingresos, gastos, cierres de caja, conciliaciones...
      </Typography>
    </Box>
  );
}

