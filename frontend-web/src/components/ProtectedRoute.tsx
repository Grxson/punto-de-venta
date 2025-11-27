import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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

  const { isAuthenticated, loading } = authContext;

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

  return <>{children}</>;
}

