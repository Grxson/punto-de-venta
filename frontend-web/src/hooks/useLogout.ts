import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clearClientSession } from '../utils/clientSession';

/**
 * Hook que ejecuta un logout completo.
 * Limpia todo el `cache` de React Query y el almacenamiento local/sesión del
 * usuario, cierra la sesión en `AuthContext` y navega al login. Así se evita
 * mezclar datos cacheados entre sesiones de distintas sucursales.
 *
 * @returns Función `handleLogout` asíncrona que realiza el cierre de sesión.
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Limpiar TODO el caché de React Query
      queryClient.clear();

      // 2. Limpiar almacenamiento local/sesión relacionado a usuario
      clearClientSession(localStorage, sessionStorage);

      // 3. Realizar logout en el contexto
      authLogout();

      // 4. Redirigir a login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      // Aun así redirigir a login aunque haya error
      navigate('/login', { replace: true });
    }
  };

  return handleLogout;
};
