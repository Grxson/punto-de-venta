import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../types/auth';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
}

export function usePermission(requiredRole?: string[]): boolean {
  const { user, isAdmin } = useAuth();

  if (!user) return false;
  if (isAdmin) return true;
  if (!requiredRole) return true;

  return requiredRole.includes(user.rol);
}

export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}
