import { useContext } from 'react';
import { MenuContext } from '../contexts/MenuContext';
import { MenuContextType } from '../types/menu';

/**
 * Acceso tipado al contexto del menú y el carrito.
 *
 * @returns El catálogo, el carrito y las acciones que los modifican.
 * @throws Error si se usa fuera de `MenuProvider`.
 */
export function useMenu(): MenuContextType {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error('useMenu debe ser usado dentro de MenuProvider');
  }

  return context;
}
