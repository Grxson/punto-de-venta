import { Box, Typography } from '@mui/material';

export default function AdminInventory() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventario
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Próximamente: Gestión de inventario, recetas, mermas, alertas de stock...
      </Typography>
    </Box>
  );
}

