import { Box, Typography } from '@mui/material';

/**
 * Marcador de posición de la sección de finanzas del panel de administración.
 * @remarks La funcionalidad real (ingresos, cierres de caja, conciliaciones)
 * todavía no está implementada; la ruta existe para no romper los enlaces del menú.
 */
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

