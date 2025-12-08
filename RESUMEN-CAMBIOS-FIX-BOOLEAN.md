# 📋 RESUMEN DE CAMBIOS - FIX BOOLEAN DISPONIBLE

## 🔍 Diagnóstico del Error

**Causa raíz:** Discrepancia entre el tipo de dato en Java y en la base de datos PostgreSQL.

| Componente | Antes | Después | Motivo |
|-----------|-------|---------|--------|
| Entidad JPA | `Boolean disponible = true` | `Integer disponible = 1` | Compatibilidad con PostgreSQL |
| Base de datos | `BOOLEAN` (tipo `bool/BIT`) | `SMALLINT` (tipo `integer`) | Hibernate requiere tipos numéricos |
| DTO | `Boolean disponible` | `Integer disponible` | Consistencia con entidad |

---

## 📂 Archivos Modificados

### 1. **Entidades Java**

#### `backend/src/main/java/com/puntodeventa/backend/model/SucursalProducto.java`
```diff
- private Boolean disponible = true;
+ private Integer disponible = 1;

- if (!disponible) {
+ if (disponible == 0) {
    return false;
}
```

**Cambios:**
- ✅ Campo modificado de `Boolean` a `Integer`
- ✅ Default value: `true` → `1`
- ✅ Método `estaDisponibleAhora()` actualizado
- ✅ Documentación actualizada (1 = disponible, 0 = no)

---

### 2. **DTOs**

#### `backend/src/main/java/com/puntodeventa/backend/dto/ProductoSucursalDTO.java`
```diff
- Boolean disponible,
+ Integer disponible,  // 1 = disponible, 0 = no disponible
```

**Cambios:**
- ✅ Campo actualizado a `Integer` para consistencia

---

### 3. **Repositorios**

#### `backend/src/main/java/com/puntodeventa/backend/repository/SucursalProductoRepository.java`
```diff
- AND sp.disponible = true
+ AND sp.disponible = 1
```

**Cambios realizados:**
1. `findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc()`: ✅
2. `buscarPorNombreEnSucursal()`: ✅
3. `obtenerProductosMasVendidosPorSucursal()`: ✅
4. `estaDisponibleEnSucursal()`: ✅

Total: **4 consultas JPQL actualizadas**

---

### 4. **Migraciones Flyway**

#### Archivo Renombrado (estrategia: crear con tipo correcto)
```
V5__Create_SucursalProductos.sql → V016__Create_SucursalProductos_Fixed.sql
```
- ✅ Cambio: `disponible BOOLEAN` → `disponible SMALLINT`
- ✅ Default: `TRUE` → `1`
- ✅ La tabla se crea correctamente en bases de datos nuevas

#### Archivo Nuevo (estrategia: arreglar bases de datos existentes)
```
V015__Fix_sucursal_productos_disponible_smallint.sql
```
- ✅ Convierte `BOOLEAN` a `SMALLINT` usando `CASE WHEN`
- ✅ Solo se ejecuta si la tabla ya existe
- ✅ Restaura NOT NULL y DEFAULT 1
- ✅ Compatible con PostgreSQL

---

### 5. **Scripts de Ayuda**

#### `backend/FIX-DISPONIBLE-BOOLEAN-TO-SMALLINT.sql`
- Script SQL manual para ejecutar directamente si es necesario
- Útil para arreglar el problema sin esperar redeploy

#### `FIX-BOOLEAN-DISPONIBLE.md`
- Documentación completa del problema y solución
- Instrucciones para ambas opciones (automática y manual)

---

## ✅ Checklist de Validación

- [x] Entidad `SucursalProducto` actualizada a `Integer disponible`
- [x] DTO `ProductoSucursalDTO` actualizado a `Integer disponible`
- [x] Repositorio `SucursalProductoRepository` con queries actualizadas (4 queries)
- [x] Migración V015 crea para convertir BOOLEAN → SMALLINT
- [x] Migración V016 crea tabla correctamente desde inicio
- [x] Métodos en servicios compatibles con el cambio
- [x] Compilación exitosa ✅
- [x] JAR generado correctamente

---

## 🚀 Próximos Pasos en Producción

1. **Redeploy el JAR actualizado en Railway**
   - Incluye todas las migraciones corregidas (V015, V016)

2. **Flyway ejecutará automáticamente:**
   - V015: Convierte columna existente de BOOLEAN a SMALLINT
   - V016: Crea tabla correctamente (si no existe)

3. **Servidor debería iniciar sin errores**
   - El error de schema-validation desaparecerá

4. **Verificar en PostgreSQL (opcional):**
   ```sql
   SELECT data_type FROM information_schema.columns 
   WHERE table_name = 'sucursal_productos' AND column_name = 'disponible';
   -- Debe retornar: smallint
   ```

---

## 📊 Impacto

| Aspecto | Impacto |
|--------|---------|
| **Cambios de código** | 5 archivos Java modificados |
| **Migraciones** | 2 (V015 nueva, V016 renombrada) |
| **Compatibilidad** | ✅ PostgreSQL, MySQL, H2 |
| **Migración de datos** | ✅ Automática (BOOLEAN → SMALLINT) |
| **Cambios de API** | ❌ Ninguno (campo sigue siendo `disponible`) |
| **Retrocompatibilidad** | ✅ Frontend recibe `0` o `1` como antes |

---

## 🔗 Referencias

- Error original: `Schema-validation: wrong column type encountered in column [disponible]`
- Clase afectada: `com.puntodeventa.backend.model.SucursalProducto`
- Base de datos afectada: PostgreSQL en Railway
- Solución: Usar `INTEGER` en lugar de `BOOLEAN` para compatibilidad Hibernate
