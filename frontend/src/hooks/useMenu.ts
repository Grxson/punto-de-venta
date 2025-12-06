import { useContext } from 'react';
import { MenuContext } from '../contexts/MenuContext';
import { MenuContextType } from '../types/menu';

export function useMenu(): MenuContextType {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error('useMenu debe ser usado dentro de MenuProvider');
  }

  return context;
}
