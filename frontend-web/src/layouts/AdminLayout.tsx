import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Assessment, Inventory, AccountBalance, AttachMoney, PointOfSale, Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
      { text: 'Ventas', icon: <PointOfSale />, path: '/admin/sales' },
      { text: 'Reportes', icon: <Assessment />, path: '/admin/reports' },
      { text: 'Inventario', icon: <Inventory />, path: '/admin/inventory' },
      { text: 'Finanzas', icon: <AccountBalance />, path: '/admin/finances' },
      { text: 'Gastos', icon: <AttachMoney />, path: '/admin/expenses' },
    ];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
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
            Panel Administrativo
          </Typography>
          {usuario && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {usuario.nombre} ({usuario.rol || usuario.rolNombre || 'Usuario'})
            </Typography>
          )}
          <Button
            color="inherit"
            onClick={() => navigate('/pos')}
            sx={{ minHeight: '48px', mr: 1 }}
          >
            Ir a POS
          </Button>
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

      {/* Drawer */}
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
          padding: 3,
          marginTop: '64px',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

