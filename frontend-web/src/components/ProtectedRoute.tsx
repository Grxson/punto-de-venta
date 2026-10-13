import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  /** Contenido protegido que solo se renderiza con sesión activa. */
  children: React.ReactNode;
}

/**
 * Ruta protegida por autenticación.
 * Muestra un indicador de carga mientras se restaura la sesión y redirige al
 * login cuando no hay usuario autenticado.
 *
 * @param props.children - Vista que se muestra cuando hay sesión activa.
 */
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

