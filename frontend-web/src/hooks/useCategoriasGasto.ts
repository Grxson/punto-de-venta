import { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import categoriasGastoData from '../data/categoriasGasto.json';

/** Categoría de gasto usada para clasificar movimientos de egresos. */
export interface CategoriaGasto {
  /** Identificador de la categoría. */
  id: number;
  /** Nombre de la categoría. */
  nombre: string;
  /** Descripción opcional de la categoría. */
  descripcion?: string;
  /** Presupuesto mensual asignado, si está definido. */
  presupuestoMensual?: number;
  /** Indica si la categoría está activa. */
  activo: boolean;
}

/** Construye la lista de categorías desde el JSON estático para uso sin conexión. */
function categoriasFallback(): CategoriaGasto[] {
  return categoriasGastoData.categorias.map(cat => ({
    id: cat.id,
    nombre: cat.nombre,
    descripcion: cat.descripcion,
    presupuestoMensual: cat.presupuestoMensual || undefined,
    activo: cat.activo
  }));
}

/**
 * Hook que proporciona las categorías de gastos.
 * Carga desde la API (`CATEGORIAS_GASTO`) y usa el JSON estático solo como
 * `fallback` cuando la petición falla o devuelve una lista vacía.
 *
 * @returns Objeto con `categorias`, el indicador `cargando` y los helpers
 * `obtenerPorId` y `obtenerActivas`. No recibe argumentos.
 */
export function useCategoriasGasto() {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const resp = await apiService.get(API_ENDPOINTS.CATEGORIAS_GASTO);
        const data = resp.success && Array.isArray(resp.data) ? resp.data : [];
        if (activo) setCategorias(data.length ? data : categoriasFallback());
      } catch {
        if (activo) setCategorias(categoriasFallback());
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return {
    categorias,
    cargando,
    obtenerPorId: (id: number) => categorias.find(cat => cat.id === id),
    obtenerActivas: () => categorias.filter(cat => cat.activo)
  };
}