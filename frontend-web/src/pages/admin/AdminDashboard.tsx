import { Box, Typography, Card, CardContent } from '@mui/material';
import { TrendingUp, ShoppingCart, Inventory, AccountBalance } from '@mui/icons-material';

export default function AdminDashboard() {
  // TODO: Cargar datos reales del backend
  const stats = [
    { title: 'Ventas Hoy', value: '$0.00', icon: <TrendingUp />, color: '#1976d2' },
    { title: 'Tickets', value: '0', icon: <ShoppingCart />, color: '#2e7d32' },
    { title: 'Productos', value: '0', icon: <Inventory />, color: '#ed6c02' },
    { title: 'Inventario', value: '$0.00', icon: <AccountBalance />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mt: 2,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, fontSize: '3rem' }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* TODO: Agregar gráficos y más información */}
    </Box>
  );
}

