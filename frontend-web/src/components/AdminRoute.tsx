import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Alert } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}
export default function AdminRoute({ children }: AdminRouteProps) {
  // Usar useContext directamente para evitar errores durante hot reload
  const authContext = useContext(AuthContext);

  // Si el contexto no está disponible aún, mostrar loading
  if (!authContext) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const { isAuthenticated, loading, usuario } = authContext;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar que el usuario tenga rol de administrador
  const rol = usuario?.rol || usuario?.rolNombre || '';
  if (usuario && rol !== 'ADMIN' && rol !== 'GERENTE') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ p: 3 }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          No tienes permisos para acceder a esta sección. 
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}

