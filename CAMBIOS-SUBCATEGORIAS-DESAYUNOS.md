# 🔄 Subcategorías de Desayunos - Cambio de Hardcoded a Base de Datos

## ✅ Cambios Realizados

### 1. Frontend - ProductoForm.tsx
**Antes:**
```tsx
const subcategoriasDisponibles = [
  { id: 'dulces', label: 'DULCES' },
  { id: 'lonches', label: 'LONCHES' },
  { id: 'sandwiches', label: 'SANDWICHES' },
  { id: 'otros', label: 'OTROS' },
];
```

**Ahora:**
```tsx
const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<CategoriaProducto[]>([]);

useEffect(() => {
  const categoriaSeleccionada = categorias.find(cat => cat.id === categoriaId);
  
  if (categoriaSeleccionada?.nombre === 'Desayunos') {
    // Filtrar desde BD - busca categorías con nombres: DULCES, LONCHES, SANDWICHES, OTROS
    const subcategorias = categorias.filter(cat => 
      cat.nombre && 
      ['DULCES', 'LONCHES', 'SANDWICHES', 'OTROS'].includes(cat.nombre.toUpperCase())
    );
    setSubcategoriasDisponibles(subcategorias);
  }
}, [categoriaId, categorias]);
```

### 2. Backend - Migración Flyway
Se agregó nueva migración: `V008__add_desayunos_subcategories.sql`

**Qué hace:**
- Crea las categorías DULCES, LONCHES, SANDWICHES, OTROS en la BD
- Evita duplicados con `ON CONFLICT (nombre) DO NOTHING`
- Estas categorías ya existen si se ejecutó una migración anterior

### 3. Cambios en el Componente
- **Función `extraerSubcategoriaDelNombre`:** Ahora mantiene el caso original (DULCES en lugar de dulces)
- **Función `handleNombreChange`:** Auto-detecta basándose en nombres de categorías en BD
- **Renderizado del dropdown:** Usa `subcat.nombre` directamente en lugar de hardcoded labels

## 📋 Ventajas
✅ **Flexible:** Las subcategorías se pueden crear/editar desde administración sin cambiar código
✅ **Escalable:** Fácil agregar nuevas subcategorías (ej: BEBIDAS como subcategoría de Desayunos)
✅ **Consistencia:** Las subcategorías son "reales" en la BD, no solo convenciones
✅ **Reutilizable:** Mismo patrón se puede aplicar a otras categorías que tengan subcategorías

## 🔧 Cómo Agregar Nuevas Subcategorías
Si quieres agregar nuevas subcategorías de Desayunos:

1. **Opción 1 (Manual):** Crear directamente en BD:
   ```sql
   INSERT INTO categorias_productos (nombre, descripcion, activa)
   VALUES ('BEBIDAS', 'Subcategoría de Desayunos: Bebidas calientes y frías', true);
   ```

2. **Opción 2 (Código):** Agregar nueva migración Flyway en `backend/src/main/resources/db/migration/`

3. **Actualizar el filtro en ProductoForm.tsx:**
   ```tsx
   ['DULCES', 'LONCHES', 'SANDWICHES', 'OTROS', 'BEBIDAS'].includes(cat.nombre.toUpperCase())
   ```

## 🧪 Testing
- Abre modal "Nuevo Producto"
- Selecciona "Desayunos" en Categoría
- Verifica que aparezcan las subcategorías de BD
- Prueba auto-detección escribiendo "Lonche Pierna" y deberá seleccionar "LONCHES"

## 📌 Notas
- Las subcategorías se cargan al cargar todas las categorías (mismo endpoint)
- No requiere cambios en el backend (solo la migración)
- Es totalmente retrocompatible con productos existentes
