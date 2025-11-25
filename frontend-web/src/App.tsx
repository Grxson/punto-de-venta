import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
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
        </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
