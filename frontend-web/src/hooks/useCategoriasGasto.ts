import categoriasGastoData from '../data/categoriasGasto.json';

export interface CategoriaGasto {
  id: number;
  nombre: string;
  descripcion?: string;
  presupuestoMensual?: number;
  activo: boolean;
}

/**
 * Hook que proporciona las categorías de gastos.
 * Actualmente utiliza datos estáticos desde el JSON.
 * En el futuro se puede reemplazar para cargar desde la API.
 */
export function useCategoriasGasto() {
  const categorias: CategoriaGasto[] = categoriasGastoData.categorias.map(cat => ({
    id: cat.id,
    nombre: cat.nombre,
    descripcion: cat.descripcion,
    presupuestoMensual: cat.presupuestoMensual || undefined,
    activo: cat.activo
  }));

  return {
    categorias,
    obtenerPorId: (id: number) => categorias.find(cat => cat.id === id),
    obtenerActivas: () => categorias.filter(cat => cat.activo)
  };
}
