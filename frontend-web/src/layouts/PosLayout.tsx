import { Outlet, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { ShoppingCart, Home, Logout } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DailyStatsPanel from '../components/DailyStatsPanel';

export default function PosLayout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Punto de Venta
          </Typography>
          {usuario && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {usuario.nombre} ({usuario.rol})
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={() => navigate('/pos')}
            sx={{
              minHeight: '48px',
              marginRight: 1,
            }}
          >
            Inicio
          </Button>
          <Button
            color="inherit"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/pos/cart')}
            sx={{
              minHeight: '48px',
              marginRight: 1,
            }}
          >
            Carrito
          </Button>
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            sx={{
              minHeight: '48px',
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', padding: 2 }}>
        <Outlet />
      </Box>

      {/* Panel de estadísticas del día */}
      <DailyStatsPanel />
    </Box>
  );
}

