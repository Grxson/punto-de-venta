# Correcciones de Integración Backend - API de Productos y Variantes

**Fecha:** 1 de diciembre de 2025  
**Branch:** develop  
**Commits:** cd7a0be, f014fec

## Problemas Encontrados y Resueltos

### 1. ❌ Endpoint `/variantes` No Existe en el Backend

**Problema:**
- El frontend intentaba llamar a `GET /api/inventario/productos/{id}/variantes`
- Este endpoint nunca fue implementado en el backend
- Resultado: HTTP 500 - Internal Server Error

**Solución:**
- Eliminado método `obtenerVariantes()` de `productos.service.ts`
- Las variantes ya vienen como parte de `ProductoDTO` al obtener un producto
- Actualizado `VariantesManager.tsx` para usar `obtener()` que incluye variantes

**Archivos Modificados:**
- `frontend-web/src/services/productos.service.ts` - Removido método innecesario
- `frontend-web/src/components/productos/VariantesManager.tsx` - Actualizado para usar `obtener()`

**Commit:** cd7a0be

---

### 2. ❌ Método `crearVariante()` No Implementado

**Problema:**
- El `ProductoForm.tsx` llamaba a `productosService.crearVariante()` que no existía
- Las variantes nunca se creaban al agregar un producto con variantes
- Resultado: TypeError - "crearVariante is not a function"

**Solución:**
- Implementado método `crearVariante()` en `productos.service.ts`
- Usa el mismo endpoint POST `/api/inventario/productos` que los productos normales
- Las variantes son simplemente productos con `productoBaseId` apuntando al producto base

**Implementación:**
```typescript
crearVariante: async (productoBaseId: number, variante: Omit<Producto, 'id' | 'variantes'>) => {
  return apiService.post<Producto>(API_ENDPOINTS.PRODUCTS, variante);
}
```

**Commit:** f014fec

---

### 3. ❌ Datos Incompletos al Crear/Actualizar Variantes

**Problema:**
- Cuando se creaban/actualizaban variantes, se enviaban solo campos parciales:
  - `nombreVariante`, `precio`, `ordenVariante`
- Faltaban campos requeridos por el backend:
  - `nombre` (campo NotBlank en la entidad)
  - `categoriaId` (referencia a la categoría)
  - `productoBaseId` (referencia al producto base)
- Resultado: HTTP 409 - Conflict (DataIntegrityViolationException)

**Solución:**
- Actualizado `ProductoForm.tsx` para construir correctamente los datos de variantes
- Al crear variantes: incluye `nombre`, `nombreVariante`, `precio`, `ordenVariante`, `categoriaId`, `productoBaseId`, `descripcion`
- Al actualizar variantes: envía el nombre completo junto con los otros campos
- Formato de nombre: `"Mollete de Queso - Grande"` (producto - variante)

**Cambios en ProductoForm.tsx:**

#### Creación de Nuevas Variantes (Edit):
```typescript
await productosService.crearVariante(producto.id, {
  nombre: `${nombre.trim()} - ${variante.nombre.trim()}`,
  nombreVariante: variante.nombre.trim(),
  precio: precioVariante,
  ordenVariante: variante.orden,
  categoriaId: categoriaId ? Number(categoriaId) : null,
  productoBaseId: producto.id,
  descripcion: descripcion.trim() || null,
} as Omit<Producto, 'id' | 'variantes'>);
```

#### Creación de Nuevas Variantes (Create):
```typescript
await productosService.crearVariante(productoId, {
  nombre: `${nombreFinal} - ${variante.nombre.trim()}`,
  nombreVariante: variante.nombre.trim(),
  precio: precioVariante,
  ordenVariante: variante.orden,
  categoriaId: categoriaId ? Number(categoriaId) : null,
  productoBaseId: productoId,
  descripcion: descripcion.trim() || null,
} as Omit<Producto, 'id' | 'variantes'>);
```

#### Actualización de Variantes Existentes:
```typescript
const nombreVarianteFinal = `${nombreFinal} - ${variante.nombre.trim()}`;
await productosService.actualizar(variante.id, {
  nombre: nombreVarianteFinal,
  nombreVariante: variante.nombre.trim(),
  precio: precioVariante,
  ordenVariante: variante.orden,
} as Partial<Omit<Producto, 'id'>>);
```

**Commit:** f014fec

---

## Estructura de Variantes (Backend)

El backend utiliza un modelo simple para variantes:

```java
// Entidad Producto con soporte para variantes
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    private Long id;
    
    @NotBlank
    @Column(nullable = false, length = 200)
    private String nombre;  // "Mollete de Queso - Grande"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_base_id")
    private Producto productoBase;  // Referencia al producto base
    
    @Column(name = "nombre_variante", length = 100)
    private String nombreVariante;  // "Grande"
    
    @Column(name = "orden_variante")
    private Integer ordenVariante;  // Orden de visualización
    
    // ... otros campos
}
```

**Relación:**
- Producto Base: `productoBase_id = null` (es un producto independiente)
- Variante: `productoBase_id = <id del producto base>` (es una variante de otro producto)

**API Response (GET /api/inventario/productos):**
```json
{
  "id": 1,
  "nombre": "Mollete de Queso",
  "categoriaId": 2,
  "precio": 1200.00,
  "sku": "MOLLETE001",
  "variantes": [
    {
      "id": 2,
      "nombre": "Mollete de Queso - Grande",
      "nombreVariante": "Grande",
      "precio": 1500.00,
      "ordenVariante": 1
    },
    {
      "id": 3,
      "nombre": "Mollete de Queso - Pequeño",
      "nombreVariante": "Pequeño",
      "precio": 900.00,
      "ordenVariante": 2
    }
  ]
}
```

---

## Testing Recomendado

### 1. Crear un Producto con Variantes
```bash
POST /api/inventario/productos
Content-Type: application/json

{
  "nombre": "Café",
  "categoriaId": 3,
  "precio": 800.00,
  "descripcion": "Bebida caliente"
}
```

Luego en el frontend, agregar variantes:
- Variante 1: "Pequeño" - $600
- Variante 2: "Grande" - $1000

### 2. Verificar que las Variantes se Crearon
```bash
GET /api/inventario/productos/1
```

Debería retornar la lista de variantes en el campo `variantes`.

### 3. Actualizar una Variante
```bash
PUT /api/inventario/productos/2
Content-Type: application/json

{
  "nombre": "Café - Pequeño",
  "nombreVariante": "Pequeño",
  "precio": 650.00,
  "ordenVariante": 1
}
```

---

## Impacto en Subcategorías

La implementación de variantes es compatible con el sistema de subcategorías existente:

- **Productos Base:** Pueden tener prefijo de subcategoría
  - Ejemplo: `[DULCES] Mollete de Queso`
  
- **Variantes:** Heredan la lógica de nombres del producto base
  - Ejemplo: `[DULCES] Mollete de Queso - Grande`
  - El frontend extrae `[DULCES]` para la subcategoría
  - Muestra limpio: `Mollete de Queso - Grande`

---

## Cambios en Archivos

### frontend-web/src/services/productos.service.ts
- ❌ Removido: `obtenerVariantes()`
- ✅ Agregado: `crearVariante()`

### frontend-web/src/components/productos/VariantesManager.tsx
- ✅ Actualizado: `loadVariantes()` para usar `obtener()` en lugar de `obtenerVariantes()`
- Extrae variantes del campo `variantes` del ProductoDTO

### frontend-web/src/components/productos/ProductoForm.tsx
- ✅ Actualizado: Creación de variantes con datos completos
- ✅ Actualizado: Actualización de variantes con todos los campos necesarios
- ✅ Mejorado: Construcción de nombres de variantes en formato "Producto - Variante"

---

## Próximos Pasos

1. **Testing:** Validar que la creación/edición de productos con variantes funciona sin errores
2. **UI/UX:** Mejora en la visualización de variantes en el editor
3. **API Documentation:** Actualizar Swagger con ejemplos de variantes
4. **Database:** Considerar índices en `producto_base_id` para queries más rápidas

---

## Referencias

- **Backend:** `ProductoService.java` - Método `toDTOWithVariantes()`
- **Backend:** `ProductoDTO.java` - Record `VarianteDTO`
- **Backend:** `GlobalExceptionHandler.java` - Manejo de `DataIntegrityViolationException` (409)
- **Frontend:** `productos.types.ts` - Interfaz `Producto`
