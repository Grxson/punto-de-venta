# 📋 Diagnóstico de Errores HTTP 409 en Actualización de Productos

**Problema Reportado:** HTTP 409 Conflict al hacer PUT `/api/inventario/productos/{id}`

## ¿Qué significa HTTP 409?

HTTP 409 Conflict indica que el servidor rechazó la solicitud porque hay un conflicto con el estado actual del recurso. En nuestro caso, viene del backend cuando se captura una `DataIntegrityViolationException`.

## Causas Posibles del 409

### 1. ❌ Nombre de Producto Duplicado
Si intentas actualizar un producto con un nombre que ya existe en otro producto de la **misma categoría**, la base de datos rechazará la operación.

**Síntoma:** Al editar el producto 517 y cambiar el nombre a algo que ya existe
```
PUT /api/inventario/productos/517
{"nombre": "Café", "precio": 800, "categoriaId": 3}
// ERROR 409 si "Café" ya existe en categoriaId 3
```

**Solución:**
- Usa nombres únicos dentro de cada categoría
- O renombra el producto existente primero

### 2. ❌ SKU Duplicado
Si hay un SKU constraint en la base de datos y dos productos tienen el mismo SKU.

**Síntoma:** Productos con SKU idéntico
```
Producto 517: SKU = "CAFE001"
Producto 518: SKU = "CAFE001"  ← Error: duplicado
```

**Solución:**
- Asegúrate que cada SKU sea único
- Usa SKU = null para que el sistema lo genere automáticamente

### 3. ❌ Restricción de Foreign Key
Si el `categoriaId` que envías en la actualización no existe en la tabla `categorias_productos`.

**Síntoma:** Categoría eliminada o inexistente
```json
{
  "nombre": "Mollete",
  "categoriaId": 999,  // Esta categoría no existe
  "precio": 1200
}
```

**Solución:**
- Verifica que la categoría exista antes de enviar la actualización
- Usa una de las categorías disponibles

### 4. ❌ Campos Requeridos Faltantes
Si el backend requiere ciertos campos (como `nombre`, `precio`, `categoriaId`) y no los envías.

**Síntoma:** Payload incompleto
```json
{
  "precio": 1200
  // Falta "nombre" y "categoriaId" que son requeridos
}
```

**Solución:**
- Siempre envía todos los campos requeridos:
  - `nombre` (obligatorio, NotBlank)
  - `precio` (obligatorio)
  - `categoriaId` (si es producto base)

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Revisar la Consola del Navegador
1. Abre las DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por XHR/Fetch
4. Encuentra el PUT request fallido a `/api/inventario/productos/517`
5. Haz clic en la request y ve a **Response**
6. Verás el error JSON:
```json
{
  "timestamp": "2025-12-01T...",
  "status": 409,
  "error": "Conflicto de datos",
  "message": "El registro ya existe o viola una restricción de unicidad"
}
```

### Paso 2: Revisar el Payload Enviado
En las DevTools, ve a la pestaña **Request** para ver qué datos estás enviando:
```json
{
  "nombre": "[DULCES] Mollete",
  "precio": 1200,
  "categoriaId": 2,
  "sku": "MOLLETE001"
}
```

Verifica que:
- `nombre` no esté vacío
- `nombre` sea único en esa categoría
- `sku` (si existe) sea único
- `categoriaId` sea válido

### Paso 3: Usar curl para Probar la API Directamente
```bash
# Con autenticación Basic (admin:admin123)
curl -X PUT http://localhost:8080/api/inventario/productos/517 \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" \
  -d '{
    "nombre": "[DULCES] Mollete de Queso",
    "precio": 1200,
    "categoriaId": 2,
    "sku": "MOLLETE001"
  }'
```

Si devuelve 409, el error es del backend.

## 📊 Tabla de Diagnóstico

| Síntoma | Causa Probable | Solución |
|---------|---|---|
| 409 al actualizar cualquier producto | Nombre duplicado | Usa nombre único |
| 409 solo en productos con variantes | Variante con nombre duplicado | Revisa nombres de variantes |
| 409 después de renombrar | SKU duplicado | Cambia el SKU |
| 409 con "categoría no encontrada" | categoriaId inválido | Usa categoría existente |
| 409 intermitente | Concurrencia/timing | Espera y reintenta |

## 🛠️ Soluciones Inmediatas

### Opción A: Limpiar Datos Duplicados
```sql
-- Encontrar productos con nombre duplicado
SELECT nombre, COUNT(*) as duplicados, GROUP_CONCAT(id)
FROM productos
GROUP BY nombre
HAVING COUNT(*) > 1;

-- Encontrar productos con SKU duplicado
SELECT sku, COUNT(*) as duplicados
FROM productos
WHERE sku IS NOT NULL
GROUP BY sku
HAVING COUNT(*) > 1;
```

### Opción B: Renombrar Productos Manualmente
En el frontend:
1. Ve a **Productos**
2. Edita el producto 517
3. Cambia el nombre a algo único (ej: "Mollete - Dulce")
4. Guarda

### Opción C: Regenerar SKUs
Si el problema es con SKUs duplicados:
```sql
UPDATE productos SET sku = NULL WHERE producto_base_id IS NOT NULL;
```
Luego deja que el backend genere nuevos SKUs.

## 📝 Próximas Mejoras

Para evitar estos errores en el futuro:

1. **Frontend:** Validar nombres duplicados antes de enviar
```typescript
// En ProductoForm.tsx
const verificarNombreUnico = async (nombre: string) => {
  const productos = await productosService.listar();
  return !productos.some(p => p.nombre === nombre && p.id !== producto?.id);
};
```

2. **Backend:** Agregar índice único y mensaje de error claro
```java
@Entity
@Table(name = "productos", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"nombre", "categoria_id"}, name = "uk_producto_nombre_categoria")
})
```

3. **UX:** Mostrar error específico al usuario
```typescript
catch (err: any) {
  if (err.statusCode === 409) {
    setError('El nombre del producto ya existe en esta categoría');
  }
}
```

## 🔗 Referencias

- Backend: `GlobalExceptionHandler.java` - Línea que maneja DataIntegrityViolationException
- Frontend: `ProductoForm.tsx` - handleSubmit() - Donde se envía la actualización
- Backend: `Producto.java` - Definición de entidad y constraints

---

**Última actualización:** 1 de diciembre de 2025
**Estado:** Documentación para diagnóstico de errores 409
