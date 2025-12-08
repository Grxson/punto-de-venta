# 🔍 DIAGNÓSTICO: Segregación de Sucursales - 8 de Diciembre 2025

## 📊 Estado Actual de la Base de Datos

### Usuarios
```
ID  | Nombre           | Username        | Sucursal_ID
----|------------------|-----------------|-----------
27  | Administrador    | admin           | 1  ✅
29  | María            | gerente         | 1  ✅
35  | dev              | dev             | 2  ✅
38  | Test             | test_sucursal_1 | 1  ✅
```

### Productos
```
Total: 181 productos

Distribución:
- sucursal_id = NULL:  3 items (variantes de "prueba")
- sucursal_id = 1:   177 items ✅
- sucursal_id = 2:     1 item  (producto #560 "prueba")
```

### Gastos
```
Total: 48 gastos
- sucursal_id = 1: 48 items ✅
- sucursal_id = 2:  0 items
```

---

## 🐛 PROBLEMA 1: Variantes Sin Sucursal

**Producto Base #560** (sucursal_id = 2):
```sql
SELECT id, nombre, sucursal_id, producto_base_id 
FROM productos WHERE id IN (560, 561, 562, 563);

 id  |         nombre                | sucursal_id | producto_base_id 
-----|-------------------------------|-------------|------------------
 560 | [SUB] prueba                  | 2           | NULL
 561 | [SUB] prueba - Chico          | NULL        | 560  ❌
 562 | [SUB] prueba - Mediano        | NULL        | 560  ❌
 563 | [SUB] prueba - Grande         | NULL        | 560  ❌
```

**ISSUE**: Las variantes (561-563) heredan sucursal_id = NULL en lugar de sucursal_id = 2 del base.

**IMPACTO**: 
- Usuario de sucursal 2 no ve las variantes del producto 560
- Query `findBySucursalIdAndProductoBaseIdIsNull(2)` solo retorna el base sin variantes
- Query `findAll()` en el servicio filtra por base luego por variantes en memoria (¡ineficiente!)

---

## 🐛 PROBLEMA 2: DailyStatsPanel Mostrando Datos de Sucursal Equivocada

**Síntoma**: 
- Login con usuario `dev` (sucursal 2) 
- Panel muestra efectivo = $4.00 (dato de sucursal 2)
- Pero debería mostrar 0 porque no hay gastos en sucursal 2

**Causa Probable**:
- `SucursalContextFilter` está extrayendo sucursal_id del JWT **O** fallando y usando fallback
- Si el extraction del JWT falla, siempre cae a sucursal = 1 (línea 127, 135 del filtro)
- Pero los endpoints de estadísticas **SÍ filtran por SucursalContext.getSucursalId()**

**Hypothesis**: 
```
¿Usuario dev → JWT generado con sucursal_id = 2?
                    ↓
¿JwtUtil.extractSucursalId() extrae correctamente = 2?
                    ↓
¿SucursalContext.setSucursal(2, "...") se ejecuta?
                    ↓
¿EstadisticasService.resumenDia() filtra por sucursal 2?
                    ↓
¿Retorna datos correctos de sucursal 2?
```

---

## 🔧 SOLUCIONES NECESARIAS

### SOLUCIÓN 1: Asignar Sucursal a Variantes NULL

```sql
-- Heredar sucursal_id del producto base para variantes NULL
UPDATE productos p_var
SET sucursal_id = (
    SELECT p_base.sucursal_id 
    FROM productos p_base 
    WHERE p_base.id = p_var.producto_base_id
)
WHERE p_var.sucursal_id IS NULL 
  AND p_var.producto_base_id IS NOT NULL;

-- Verificar
SELECT COUNT(*) FROM productos WHERE sucursal_id IS NULL;
-- Expected: 0
```

### SOLUCIÓN 2: Mejorar JwtUtil.extractSucursalId() para Manejo de Errores

**Problema actual**: Si sucursalId es null en el token, lanza NumberFormatException
**Solución**: Retornar Optional<Long> o lanzar excepción clara

```java
// Antes (❌ Puede fallar silenciosamente):
public Long extractSucursalId(String token) {
    return ((Number) Jwts.parser()...get("sucursalId")).longValue();
    // Si "sucursalId" es null → NPE → catch en filtro → fallback a 1
}

// Después (✅ Manejo explícito):
public Long extractSucursalId(String token) {
    Object sucursalObj = Jwts.parser()...get("sucursalId");
    if (sucursalObj == null) {
        throw new IllegalArgumentException("Token no contiene sucursalId");
    }
    if (!(sucursalObj instanceof Number)) {
        throw new IllegalArgumentException("sucursalId no es un Number: " + sucursalObj.getClass());
    }
    return ((Number) sucursalObj).longValue();
}
```

### SOLUCIÓN 3: Agregar Logs en SucursalContextFilter

```java
// En el catch block, loguear más detalles:
} catch (JwtException | ClassCastException | NumberFormatException e) {
    logger.error("❌ Error al extraer sucursal del JWT: " + e.getMessage() 
        + " | Type: " + e.getClass().getSimpleName(), e);
    logger.debug("Token payload: {}", decodeTokenPayload(bearerToken)); // Helper
    sucursalId = null;
}
```

### SOLUCIÓN 4: Revisar si usuario.getSucursal() es NULL en Login

```java
// En UsuarioServicio.login():
// Generar token JWT con sucursal_id
String token = jwtUtil.generateToken(
    usuario.getUsername(), 
    usuario.getId(), 
    usuario.getRol().getNombre(),
    usuario.getSucursal() != null ? usuario.getSucursal().getId() : null  // ⚠️ Puede ser null!
);

// MEJOR: Validar que la sucursal existe
if (usuario.getSucursal() == null) {
    log.warn("⚠️ Usuario {} no tiene sucursal asignada", usuario.getUsername());
    throw new IllegalStateException("Usuario debe tener una sucursal asignada");
}
```

---

## ✅ PLAN DE ACCIÓN

1. **INMEDIATO**: Ejecutar SQL para asignar sucursal_id a variantes NULL
   ```sql
   UPDATE productos p_var
   SET sucursal_id = (SELECT p_base.sucursal_id FROM productos p_base WHERE p_base.id = p_var.producto_base_id)
   WHERE p_var.sucursal_id IS NULL AND p_var.producto_base_id IS NOT NULL;
   ```

2. **HOY**: Mejorar validación de sucursal en UsuarioServicio.login()
   - Asegurar que usuario.getSucursal() != null antes de generar token
   - Lanzar excepción clara si no hay sucursal

3. **HOY**: Mejorar manejo de errores en JwtUtil.extractSucursalId()
   - Retornar Long o lanzar excepción descriptiva
   - NO retornar null silenciosamente

4. **HOY**: Agregar logs en SucursalContextFilter
   - Mostrar qué sucursal se extrajo del JWT
   - Mostrar qué sucursal se usó (JWT vs fallback vs header)

5. **TESTING**: Verificar segregación
   - Login con admin (sucursal 1) → Debe ver 177 productos
   - Login con dev (sucursal 2) → Debe ver 1 producto + 3 variantes (después del fix)
   - Revisar DailyStatsPanel para cada usuario
   - Verificar gastos solo muestren datos de su sucursal

---

## 🔗 Archivos Involucrados

- `backend/src/main/java/.../security/JwtUtil.java` - Extracción de sucursal
- `backend/src/main/java/.../security/SucursalContextFilter.java` - Setup del contexto
- `backend/src/main/java/.../service/UsuarioServicio.java` - Generación del JWT
- `backend/src/main/java/.../service/EstadisticasService.java` - Uso del contexto ✅ YA OK
- `frontend-web/src/components/DailyStatsPanel.tsx` - Consumo de datos

---
