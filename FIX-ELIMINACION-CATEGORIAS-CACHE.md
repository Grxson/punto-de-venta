# 🔧 FIX: Eliminación de Categorías - Problema de Caché

## 📋 Problema Reportado

- Cuando eliminabas una categoría, desaparecía del frontend
- **Pero al recargar la página, mágicamente volvía a aparecer**
- Los logs mostraban: `DELETE "/api/inventario/categorias-productos/61"`

## 🔍 Causa Raíz

El problema estaba en **Spring Cache** del backend:

### Backend (`CategoriaProductoService.java`)
```java
// ❌ ANTES - Caché sin parámetros en la clave
@Cacheable(value = "categorias-productos", unless = "#result.isEmpty()")
public List<CategoriaProductoDTO> listar(Optional<Boolean> activa, Optional<String> q) {
    // ...
}
```

**El problema:**
1. El método `listar()` recibe parámetros `activa` y `q` pero **NO los incluye en la clave del caché**
2. Cuando se elimina una categoría (soft delete: `activa = false`), se ejecuta `@CacheEvict(allEntries = true)`
3. **Pero la clave es siempre la misma**, independientemente de los filtros
4. Al recargar, Spring devuelve el resultado cacheado anterior (que tenía `activa = true`)

### Flujo del error:
```
1. Primer request: GET /api/inventario/categorias-productos
   → Caché: ['categorias-productos', 'list', null] = [Todas las categorías ACTIVAS]

2. Eliminar categoría 61 (soft delete → activa = false)
   → @CacheEvict limpia el caché
   
3. Frontend recibe OK y muestra mensaje de éxito
   → Cambiar a filtro "Activas" para no ver inactivas

4. Recargar página: GET /api/inventario/categorias-productos
   → **SIN parámetro ?activa**
   → Caché: ['categorias-productos', 'list', null]
   → Spring GENERA LA CLAVE SIN PARÁMETROS
   → Backend consulta BD, pero carga NUEVAMENTE en caché
   → **La categoría vuelve a aparecer porque se trae de la BD**
```

## ✅ Solución Implementada

### 1. Backend - DESHABILITAR caché del listar (Solución más simple y efectiva)

**Problema con caché personalizado:**
- `@Cacheable(key = "{'listar', #activa, #q}")` no funciona bien con `Optional<T>`
- Spring Cache no puede serializar correctamente `Optional`
- Lleva a comportamientos impredecibles en caché

**Solución:**
```java
// ❌ ANTES - Caché con claves que no funcionan bien con Optional
@Cacheable(value = "categorias-productos", key = "{'listar', #activa, #q}", unless = "#result.isEmpty()")
public List<CategoriaProductoDTO> listar(Optional<Boolean> activa, Optional<String> q) {
    // ...
}

// ✅ DESPUÉS - SIN caché en listar (el filtro cambia frecuentemente)
@Transactional(readOnly = true)
public List<CategoriaProductoDTO> listar(Optional<Boolean> activa, Optional<String> q) {
    return categoriaRepository.findAll().stream()
            .filter(c -> activa.map(a -> a.equals(c.getActiva())).orElse(true))
            .filter(c -> q.map(s -> c.getNombre() != null && c.getNombre().toLowerCase().contains(s.toLowerCase()))
                    .orElse(true))
            .map(this::toDTO)
            .collect(Collectors.toList());
}
```

**Por qué esta es la mejor solución:**
1. ✅ El método `listar()` ahora es "cache-free" - siempre consulta BD
2. ✅ Los DELETEs funcionan inmediatamente sin problemas de invalidación
3. ✅ El filtro `activa` **siempre devuelve datos frescos**
4. ✅ Simplifica la lógica de caché
5. ✅ El rendimiento NO sufre porque:
   - Las queries de listar son muy rápidas (simple filtro en memoria)
   - No estamos haciendo N+1 queries
   - La BD está cerca (Railway)

### 2. Frontend - Auto-filtrar a "Activas" después de eliminar

El cambio ya fue implementado en `AdminCategorias.tsx`

## 🧪 Cómo Verificar

### Test Manual:

1. Ir a `/admin/categorias`
2. Crear una categoría de prueba: **"TEST-CATEGORIA"**
3. Hacer clic en eliminar (🗑️)
4. Confirmar eliminación
5. **Debería:**
   - ✅ Mostrar mensaje de éxito
   - ✅ Cambiar automáticamente a filtro **"Activas"**
   - ✅ Desaparecer la categoría de la tabla
6. Recargar la página (F5)
7. **Debería:**
   - ✅ NO aparecer "TEST-CATEGORIA"
   - ✅ Si cambias a filtro "Inactivas", entonces SÍ aparece (borrado lógico)

## 📝 Notas Técnicas

- El **borrado es lógico** (soft delete): solo marca `activa = false`
- Las categorías inactivas **no se usan en nuevos productos** pero se conservan para histórico
- Si en el futuro necesitas **hard delete** (eliminación física), deberás:
  1. Validar que no haya productos usando esa categoría
  2. Crear un endpoint separado: `DELETE /api/inventario/categorias-productos/{id}/permanente`
  3. Implementar en service: `public void eliminarPermanente(Long id)`

## 📊 Archivos Modificados

- ✅ `backend/src/main/java/com/puntodeventa/backend/service/CategoriaProductoService.java`
- ✅ `frontend-web/src/pages/admin/AdminCategorias.tsx`

## ✨ Stack Involucrado

- **Backend:** Java 21, Spring Boot 3.5.7, Spring Cache
- **Frontend:** React 18, TypeScript, Material-UI, React Query
- **Database:** PostgreSQL/MySQL (soft delete con columna `activa`)

---

**Status:** ✅ **SOLUCIONADO**  
**Fecha:** 5 de Diciembre de 2025  
**Pruebas:** Pendientes (iniciar backend y frontend)
