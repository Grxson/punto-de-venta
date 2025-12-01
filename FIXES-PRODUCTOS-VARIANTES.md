# Reparación: Gestión de Variantes y Eliminación de Productos

**Fecha**: 1 de diciembre de 2025
**Problemas resueltos**: 
1. Eliminación de productos retorna error 500
2. Variantes no aparecen correctamente al editar productos
3. Plantillas de variantes no visibles al editar

## Problemas Identificados

### 1. Error 500 al Eliminar Productos
**Síntoma**: Al intentar eliminar un producto permanentemente, retorna HTTP 500
```
DELETE http://localhost:8080/api/inventario/productos/{id}/permanente
[HTTP/1.1 500]
```

**Causa**: El endpoint `/permanente` no existía en el backend

### 2. Variantes no Aparecen Correctamente
**Síntoma**: 
- Al editar un producto, el modal "Gestión de Variantes" muestra "No hay variantes"
- Las plantillas de tamaños/variantes no se muestran al editar productos

**Causa**: 
- El endpoint `obtener()` devolvía DTO sin variantes
- El DTO no incluía los campos `productoBaseId`, `nombreVariante`, `ordenVariante`
- Las plantillas de variantes estaban condicionadas a modo creación (`!producto`)

## Cambios Realizados

### Backend

#### 1. **ProductoController.java** - Nuevo endpoint
```java
@DeleteMapping("/{id}/permanente")
@Operation(summary = "Eliminar producto permanentemente", 
           description = "Hard delete: elimina el producto de la base de datos...")
public ResponseEntity<Void> eliminarDefinitivamente(@PathVariable Long id) {
    productoService.eliminarDefinitivamente(id);
    return ResponseEntity.noContent().build();
}
```

#### 2. **ProductoService.java** - Nuevos métodos y mejoras

**a) Método `eliminarDefinitivamente()`**
```java
public void eliminarDefinitivamente(Long id) {
    // Verifica que el producto no tenga variantes
    // Verifica que no tenga ventas asociadas
    // Realiza hard delete
}
```

**b) Método `obtener()` mejorado**
```java
@Transactional(readOnly = true)
public ProductoDTO obtener(Long id) {
    // Si es producto base: devuelve con variantes incluidas
    // Si es variante: devuelve sin variantes
}
```

**c) Método `apply()` actualizado**
- Procesa `productoBaseId` para asignar correctamente el producto base
- Procesa `nombreVariante` y `ordenVariante`

**d) DTOs actualizados**
- `toDTO()`: Incluye los nuevos campos
- `toDTOWithVariantes()`: Incluye campos + lista de variantes

#### 3. **ProductoDTO.java** - Nuevos campos
```java
public record ProductoDTO(
    // ... campos existentes ...
    Long productoBaseId,
    String nombreVariante,
    Integer ordenVariante
) { ... }
```

### Frontend

#### 1. **ProductoForm.tsx** - Plantillas siempre visibles
- **Cambio**: Plantillas de variantes ahora aparecen tanto al crear como al editar productos
- **Antes**: `{!producto && (<FormControl>...plantillas...</FormControl>)}`
- **Ahora**: `<FormControl>...plantillas...</FormControl>` (siempre visible)

#### 2. **VariantesManager.tsx** - Mejor carga de variantes
- Mejorado el método `loadVariantes()` con mejor manejo de errores
- Asegura que las variantes se cargen desde el DTO correctamente

## Flujo de Trabajo Corregido

### Crear Producto con Variantes
1. Usuario selecciona plantilla (Tamaños, Bebidas, Café)
2. Se cargan variantes automáticamente
3. Se crea el producto base
4. Se crean las variantes con `productoBaseId` asignado correctamente

### Editar Producto y Agregar Variantes
1. Se carga el producto base
2. El backend devuelve `variantes` en el DTO
3. Usuario ve las variantes existentes en `VariantesManager`
4. Puede aplicar una plantilla nueva
5. Las nuevas variantes se crean con `productoBaseId` correcto

### Eliminar Producto
1. Si es admin y el producto:
   - No tiene variantes
   - No tiene ventas
   - No tiene recetas
2. Se elimina permanentemente de la base de datos

## Validación

### Backend - Compilación
✅ Compilación exitosa sin errores

### Funcionalidades Verificadas
- ✅ Endpoint `/permanente` disponible
- ✅ Variantes se devuelven en `obtener(id)` si es producto base
- ✅ Campos `productoBaseId`, `nombreVariante`, `ordenVariante` procesados
- ✅ Plantillas siempre visibles en edición
- ✅ Hard delete solo elimina si no hay dependencias

## Notas Técnicas

### Record ProductoDTO
El DTO ahora es un record de Java 21 con 15 campos:
- id, nombre, descripcion, categoriaId, categoriaNombre
- precio, costoEstimado, sku, activo, disponibleEnMenu
- variantes (nullable), productoBaseId, nombreVariante, ordenVariante

### Variantes como Productos
Las variantes son productos normales con:
- `producto_base_id` = ID del producto base
- `nombre_variante` = Nombre corto (ej: "Chico", "Mediano")
- `nombre` = Nombre completo (ej: "Tamaño - Chico")
- `orden_variante` = Número de orden

### Seguridad
- Solo se permite hard delete si no hay dependencias
- Validaciones en backend para integridad referencial
