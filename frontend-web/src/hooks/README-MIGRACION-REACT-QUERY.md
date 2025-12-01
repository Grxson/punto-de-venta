/**
 * Ejemplo de migración de fetch directo a React Query
 * 
 * ANTES (con fetch directo):
 * ```tsx
 * const [productos, setProductos] = useState([]);
 * const [loading, setLoading] = useState(false);
 * 
 * useEffect(() => {
 *   const cargarProductos = async () => {
 *     setLoading(true);
 *     try {
 *       const res = await apiService.get(API_ENDPOINTS.PRODUCTS);
 *       if (res.success) setProductos(res.data);
 *     } catch (err) {
 *       console.error(err);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   cargarProductos();
 * }, []);
 * ```
 * 
 * DESPUÉS (con React Query):
 * ```tsx
 * import { useProductos } from '../hooks/useProductos';
 * 
 * const { data: productos = [], isLoading, error } = useProductos({ activo: true, enMenu: true });
 * 
 * // Datos disponibles instantáneamente desde caché
 * // Refetch automático cuando datos stale
 * // Sin necesidad de useState, useEffect, loading states
 * ```
 * 
 * VENTAJAS:
 * 1. ✅ Caché automático: Primera carga desde API, siguientes desde caché
 * 2. ✅ Sincronización: Actualiza automáticamente cuando datos cambian
 * 3. ✅ Menos código: No más useState, useEffect, loading states manuales
 * 4. ✅ Mejor UX: UI responde instantáneamente con datos cacheados
 * 5. ✅ Invalidación inteligente: Mutations invalidan queries automáticamente
 * 
 * PASOS PARA MIGRAR:
 * 1. Importar hook: `import { useProductos } from '../hooks/useProductos'`
 * 2. Reemplazar fetch con hook: `const { data, isLoading } = useProductos()`
 * 3. Eliminar useState, useEffect, loading states
 * 4. Usar data directamente (con default value si necesario)
 * 5. Para mutations: usar useCrearProducto, useActualizarProducto, etc.
 */

// Ejemplo práctico en componente POS
export const PosSalesExample = () => {
  // ✅ NUEVO: Con React Query
  const { data: productos = [], isLoading: cargandoProductos } = useProductos({ 
    activo: true, 
    enMenu: true 
  });
  
  const { data: categorias = [], isLoading: cargandoCategorias } = useCategorias({ 
    activa: true 
  });

  // ✅ Para crear/actualizar
  const crearProducto = useCrearProducto();
  
  const handleCrear = async (nuevoProducto: any) => {
    await crearProducto.mutateAsync(nuevoProducto);
    // ✅ No necesitas refetch manual, React Query invalida automáticamente
  };

  // ✅ Estados de carga unificados
  if (cargandoProductos || cargandoCategorias) {
    return <CircularProgress />;
  }

  return (
    <div>
      {productos.map(p => (
        <ProductoCard key={p.id} producto={p} />
      ))}
    </div>
  );
};
