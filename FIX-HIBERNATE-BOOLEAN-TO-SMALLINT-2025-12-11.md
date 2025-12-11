# FIX: HTTP 500 Error en /api/ventas - Boolean to SMALLINT Conversion

## 🔴 Problema Identificado

**Error en producción (Railway):**
```
org.hibernate.HibernateException: Could not convert 'java.lang.Integer' to 'java.lang.Boolean' 
using 'org.hibernate.type.descriptor.java.IntegerJavaType' to unwrap
```

**Endpoint afectado:** `/api/ventas` (HTTP 500)

**Causa raíz:** Cuando `VentaService.obtenerTodas()` accedía a las relaciones lazy-loaded (Usuario, Sucursal, etc.), Hibernate intentaba mapear columnas BOOLEAN de la BD a campos Boolean en Java, pero la BD tenía algunas columnas como BOOLEAN, otras como INTEGER, y el converter no estaba siendo aplicado en todas las entidades.

---

## ✅ Solución Implementada

### 1. Migración de Base de Datos (V018)

**Archivo:** `backend/src/main/resources/db/migration/V018__convert_all_booleans_to_smallint.sql`

Convierte todas las columnas BOOLEAN a SMALLINT en todas las tablas:
- `usuarios.activo`
- `roles.activo`
- `ingredientes.activo`
- `productos_atributos.requerido` y `productos_atributos.activo`
- `metodos_pago.requiere_referencia` y `metodos_pago.activo`
- `proveedores.activo`
- `sucursales.activo` (si existe)

Usa `DO $$ ... END $$;` para ser idempotente - solo convierte si la columna es BOOLEAN.

### 2. Entidades Actualizadas

Todas las entidades que tienen campos `Boolean` ahora usan explícitamente:

```java
@Column(nullable = false, columnDefinition = "SMALLINT DEFAULT 1")
@Convert(converter = BooleanToIntegerConverter.class)
private Boolean activo = true;
```

**Entidades actualizadas:**

| Entidad | Campo | Cambio |
|---------|-------|--------|
| `Usuario.java` | `activo` | INTEGER → SMALLINT DEFAULT 1 + @Convert |
| `Rol.java` | `activo` | INTEGER → SMALLINT DEFAULT 1 + @Convert |
| `Ingrediente.java` | `activo` | INTEGER → SMALLINT DEFAULT 1 + @Convert |
| `ProductoAtributo.java` | `requerido` | BOOLEAN → SMALLINT DEFAULT 0 + @Convert |
| `ProductoAtributo.java` | `activo` | BOOLEAN → SMALLINT DEFAULT 1 + @Convert |
| `MetodoPago.java` | `requiereReferencia` | INTEGER → SMALLINT DEFAULT 0 + @Convert |
| `MetodoPago.java` | `activo` | INTEGER → SMALLINT DEFAULT 1 + @Convert |
| `Proveedor.java` | `activo` | INTEGER → SMALLINT DEFAULT 1 + @Convert |

### 3. Converter Reutilizado

El converter `BooleanToIntegerConverter` ya existía desde hace tiempo:

```java
@Converter(autoApply = true)
public class BooleanToIntegerConverter implements AttributeConverter<Boolean, Integer> {
    @Override
    public Integer convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) return 0;
        return attribute ? 1 : 0;
    }

    @Override
    public Boolean convertToEntityAttribute(Integer dbData) {
        if (dbData == null) return false;
        return dbData != 0;
    }
}
```

Ahora está siendo utilizado en todas las entidades.

---

## 🚀 Compilación y Validación

**Estado del build:** ✅ SUCCESS

```
[INFO] BUILD SUCCESS
[INFO] Total time:  18.391 s
```

**Warnings:** Solo warnings de Lombok sobre `@Builder.Default` - no son errores, son advertencias sobre código limpio (ya están siendo solucionadas en las entidades).

---

## 📋 Cambios en Detalle

### Archivos Modificados:

1. **`V018__convert_all_booleans_to_smallint.sql`** (NEW)
   - 9 bloques DO/END para cada tabla
   - Conversión segura con `USING CASE WHEN ... THEN 1 ELSE 0 END`
   - Restauración de defaults y NOT NULL constraints

2. **`Usuario.java`**
   - L27-29: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 1"`
   - Aplicación de `@Convert(converter = BooleanToIntegerConverter.class)`

3. **`Rol.java`**
   - L21-23: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 1"`
   - Aplicación de `@Convert(converter = BooleanToIntegerConverter.class)`

4. **`Ingrediente.java`**
   - L56-59: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 1"`
   - Aplicación de `@Convert(converter = BooleanToIntegerConverter.class)`

5. **`ProductoAtributo.java`**
   - L4: Agregado import `BooleanToIntegerConverter`
   - Líneas 50, 59: Cambio de `@JdbcType(BooleanJdbcType.class)` a `@Convert(converter = BooleanToIntegerConverter.class)`
   - Cambio de `columnDefinition = "BOOLEAN DEFAULT false/true"` a `"SMALLINT DEFAULT 0/1"`

6. **`MetodoPago.java`**
   - L28-29: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 0"` + @Convert
   - L31-32: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 1"` + @Convert

7. **`Proveedor.java`**
   - L42-44: Cambio de `columnDefinition = "INTEGER"` a `"SMALLINT DEFAULT 1"` + @Convert

---

## 🔍 Por Qué Pasó Esto

1. **Inconsistencia en la BD**: Las migraciones anteriores (V009, V010) habían intentado convertir BOOLEAN a SMALLINT, pero no todas las tablas fueron procesadas uniformemente.

2. **Converter No Utilizado**: El `BooleanToIntegerConverter` existía pero no estaba siendo aplicado a todas las entidades que lo necesitaban.

3. **Lazy Loading**: El error solo se manifestaba cuando se accedía a relaciones lazy-loaded (como Usuario en Venta), no al acceder a la entidad raíz.

4. **PostgreSQL Stricto**: PostgreSQL 12+ (usado por Railway) es más estricto con conversiones implícitas entre tipos numéricos y booleanos.

---

## ✨ Próximos Pasos

1. **Ejecutar migración en production**: La migración V018 se ejecutará automáticamente en el siguiente deploy.
2. **Validar /api/ventas**: Debería retornar HTTP 200 OK después de la migración.
3. **Monitorear logs**: Revisar que no hay más errores de conversion en error.log.

---

## 📊 Impacto

- **APIs afectadas**: `/api/ventas` y potencialmente cualquier endpoint que acceda a estas entidades con relaciones lazy-loaded
- **Datos**: Ninguno - la conversión 1=true, 0=false es equivalente
- **Performance**: Leve mejora - SMALLINT (2 bytes) vs INTEGER (4 bytes)
- **Compatibilidad**: Completamente compatible - el converter mantiene el mismo comportamiento

---

## 🧪 Testing Manual (Una vez desplegado)

```bash
# Verificar que /api/ventas funciona
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/ventas

# Debería retornar:
# HTTP 200 OK con lista de ventas (vacía si no hay datos hoy)
```

---

**Commit:** 3c157a7  
**Branch:** develop  
**Fecha:** 2025-12-11  
**Autor:** Grxson
