import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ShoppingCart, Home, Logout, AdminPanelSettings, Menu as MenuIcon, AttachMoney, PointOfSale } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DailyStatsPanel from '../components/DailyStatsPanel';

export default function PosLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'Inicio', icon: <Home />, path: '/pos' },
    { text: 'Mis Ventas', icon: <PointOfSale />, path: '/pos/sales' },
    { text: 'Registrar Gasto', icon: <AttachMoney />, path: '/pos/expenses' },
  ];

  // Agregar Admin solo para ADMIN y GERENTE
  if (usuario && ((usuario.rol || usuario.rolNombre) === 'ADMIN' || (usuario.rol || usuario.rolNombre) === 'GERENTE')) {
    menuItems.push({ text: 'Panel Admin', icon: <AdminPanelSettings />, path: '/admin' });
  }

  const isActiveRoute = (path: string) => {
    if (path === '/pos') {
      return location.pathname === '/pos';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Button
            color="inherit"
            startIcon={<MenuIcon />}
            onClick={() => setDrawerOpen(true)}
            sx={{ minHeight: '48px', marginRight: 2 }}
          >
            Menú
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Punto de Venta
          </Typography>
          {usuario && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {usuario.nombre} ({usuario.rol || usuario.rolNombre || 'Usuario'})
            </Typography>
          )}
          <Button
            color="inherit"
            startIcon={<Logout />}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            sx={{ minHeight: '48px' }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer (Sidebar) */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            marginTop: '64px',
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                selected={isActiveRoute(item.path)}
                sx={{ minHeight: '56px' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 2,
          marginTop: '64px',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>

      {/* Panel de estadísticas del día */}
      <DailyStatsPanel />
    </Box>
  );
}

