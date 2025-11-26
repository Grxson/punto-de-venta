import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { DashboardProvider, useDashboard } from './contexts/DashboardContext';
import { websocketService } from './services/websocket.service';
import { userPreferencesService } from './services/userPreferences.service';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layouts
import PosLayout from './layouts/PosLayout';
import AdminLayout from './layouts/AdminLayout';

// POS Routes
import PosHome from './pages/pos/PosHome';
import PosCart from './pages/pos/PosCart';
import PosPayment from './pages/pos/PosPayment';
import PosExpenses from './pages/pos/PosExpenses';
import PosSales from './pages/pos/PosSales';

// Admin Routes
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminInventory from './pages/admin/AdminInventory';
import AdminFinances from './pages/admin/AdminFinances';
import AdminExpenses from './pages/admin/AdminExpenses';
import AdminSales from './pages/admin/AdminSales';

// Auth
import Login from './pages/auth/Login';

// Theme optimizado para táctil
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '48px', // Tamaño mínimo para táctil
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '12px 24px',
          touchAction: 'manipulation', // Optimización táctil
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  typography: {
    fontSize: 16,
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    button: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
  },
});

function WebSocketHandlers() {
  const { triggerRefresh } = useDashboard();

  useEffect(() => {
    websocketService.connect();

    // Handler global para estadísticas
    const unsubscribeEstadisticas = websocketService.on('estadisticas', (message) => {
      if (message.tipo === 'ESTADISTICAS_ACTUALIZADAS') {
        triggerRefresh();
      }
    });

    // Handler global para ventas
    const unsubscribeVentas = websocketService.on('ventas', (message) => {
      if (message.tipo === 'VENTA_CREADA') {
        triggerRefresh();
      }
    });

    return () => {
      unsubscribeEstadisticas();
      unsubscribeVentas();
    };
  }, [triggerRefresh]);

  return null;
}

/**
 * Componente que guarda la ruta actual en las preferencias del usuario
 */
function RouteTracker() {
  const location = useLocation();
  const { usuario } = useAuth();

  useEffect(() => {
    // Solo guardar rutas si el usuario está autenticado
    if (usuario && location.pathname !== '/login' && location.pathname !== '/') {
      userPreferencesService.setLastRoute(location.pathname);
    }
  }, [location.pathname, usuario]);

  return null;
}

/**
 * Componente que restaura la última ruta visitada al iniciar sesión
 * Solo se ejecuta una vez cuando el usuario se autentica por primera vez
 */
function RouteRestorer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    // Solo restaurar una vez cuando el usuario se autentica y estamos en la ruta raíz o login
    if (usuario && !hasRestored && (location.pathname === '/' || location.pathname === '/login')) {
      const lastRoute = userPreferencesService.getLastRoute();
      if (lastRoute && lastRoute !== '/login' && lastRoute !== '/') {
        // Verificar que la ruta sea válida antes de navegar
        navigate(lastRoute, { replace: true });
      } else {
        // Si no hay última ruta guardada, ir a POS por defecto
        navigate('/pos', { replace: true });
      }
      setHasRestored(true);
    }
  }, [usuario, navigate, location.pathname, hasRestored]);

  // Resetear el flag cuando el usuario cierra sesión
  useEffect(() => {
    if (!usuario) {
      setHasRestored(false);
    }
  }, [usuario]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <RouteTracker />
      <RouteRestorer />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* POS Routes - Protegidas */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <PosLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PosHome />} />
          <Route path="cart" element={<PosCart />} />
          <Route path="payment" element={<PosPayment />} />
          <Route path="expenses" element={<PosExpenses />} />
          <Route path="sales" element={<PosSales />} />
        </Route>

        {/* Admin Routes - Protegidas con verificación de rol */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="finances" element={<AdminFinances />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="sales" element={<AdminSales />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/pos" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <DashboardProvider>
            <WebSocketHandlers />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </DashboardProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
