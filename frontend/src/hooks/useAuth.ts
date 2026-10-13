import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../types/auth';

/**
 * Acceso tipado al contexto de autenticación.
 *
 * @returns El estado y las acciones de sesión del usuario.
 * @throws Error si se usa fuera de `AuthProvider`.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
}

/**
 * Comprueba si el usuario actual cumple un conjunto de roles.
 *
 * Los administradores pasan siempre la validación, independientemente de la
 * lista de roles exigida.
 *
 * @param requiredRole Roles aceptados. Si se omite, basta con estar autenticado.
 * @returns `true` si el usuario tiene permiso; `false` en caso contrario.
 */
export function usePermission(requiredRole?: string[]): boolean {
  const { user, isAdmin } = useAuth();

  if (!user) return false;
  if (isAdmin) return true;
  if (!requiredRole) return true;

  return requiredRole.includes(user.rol);
}

/**
 * Atajo para consultar si el usuario actual es administrador.
 *
 * @returns `true` si el usuario tiene rol `ADMIN`.
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}
