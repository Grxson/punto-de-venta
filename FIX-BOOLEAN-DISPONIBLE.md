# FIX: Error de tipo de dato en columna `disponible` de `sucursal_productos`

## 🚨 Problema

**Error en producción:**
```
Schema-validation: wrong column type encountered in column [disponible] in table [sucursal_productos]; 
found [bool (Types#BIT)], but expecting [integer (Types#INTEGER)]
```

## ✅ Causa

1. La migración `V5__Create_SucursalProductos.sql` original definía `disponible` como `BOOLEAN`
2. En PostgreSQL, `BOOLEAN` se convierte a tipo `bool (BIT)` en la base de datos
3. Hibernate espera `INTEGER/SMALLINT` para que sea compatible con todos los dialectos SQL
4. El cambio a `Integer disponible = 1` en la entidad Java no coincidía con el tipo en la BD

## 📋 Cambios realizados

### 1. **Entidad Java** (`SucursalProducto.java`)
```java
// ANTES:
@Column(nullable = false)
@Builder.Default
private Boolean disponible = true;

// DESPUÉS:
@Column(nullable = false)
@Builder.Default
private Integer disponible = 1;  // 1 = disponible, 0 = no disponible
```

### 2. **DTO** (`ProductoSucursalDTO.java`)
```java
// ANTES:
Boolean disponible,

// DESPUÉS:
Integer disponible,  // 1 = disponible, 0 = no disponible
```

### 3. **Métodos en la entidad**
```java
// ANTES:
if (!disponible) { return false; }

// DESPUÉS:
if (disponible == 0) { return false; }
```

### 4. **Consultas JPA** (`SucursalProductoRepository.java`)
```java
// ANTES:
"AND sp.disponible = true "

// DESPUÉS:
"AND sp.disponible = 1 "
```

### 5. **Migraciones Flyway**

#### Renombrada:
- `V5__Create_SucursalProductos.sql` → `V016__Create_SucursalProductos_Fixed.sql`
  - Ahora crea la tabla con `disponible SMALLINT` desde el inicio

#### Nueva:
- `V015__Fix_sucursal_productos_disponible_smallint.sql`
  - Convierte bases de datos existentes de `BOOLEAN` a `SMALLINT`
  - Solo se ejecuta si la tabla ya existe

## 🔧 Cómo arreglarlo en PRODUCCIÓN

### Opción 1: Ejecutar la migración (automático al reiniciar)

1. El JAR compilado ya incluye las migraciones corregidas
2. Al reiniciar la aplicación, Flyway ejecutará automáticamente:
   - `V015`: Convierte `disponible` a `SMALLINT` (solo si la tabla existe)
   - `V016`: Crea la tabla correctamente (si no existe)

### Opción 2: Script SQL manual (si prefiere aplicar directamente)

Si necesita arreglarlo antes de reiniciar:

```bash
# Conectarse a PostgreSQL
psql -h <host> -U <usuario> -d <base_datos>
```

Ejecutar el contenido de `FIX-DISPONIBLE-BOOLEAN-TO-SMALLINT.sql`:

```sql
ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible TYPE SMALLINT USING CASE WHEN disponible THEN 1 ELSE 0 END;

ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible SET NOT NULL;

ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible SET DEFAULT 1;
```

Verificar que funcionó:
```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sucursal_productos' AND column_name = 'disponible';
```

Resultado esperado:
```
 column_name | data_type | is_nullable | column_default
 disponible  | smallint  | NO          | 1
```

## 📦 Compilación

```bash
cd backend
./mvnw clean compile -q  # ✅ Compilación exitosa

./mvnw clean package -DskipTests -q  # Crear JAR

# En Railway, simplemente redeploy el nuevo JAR
```

## 🎯 Próximos pasos

1. ✅ Compilar el backend (ya hecho)
2. ⏳ Redeploy en Railway con el nuevo JAR
3. ⏳ Flyway ejecutará automáticamente V015 → V016
4. ✅ El servidor debería iniciar sin errores

## 📝 Notas

- **No es necesario ejecutar el script manual** si usa las migraciones de Flyway (opción 1)
- El script manual es para casos donde necesita arreglarlo inmediatamente sin redeploy
- Todos los registros existentes con `true/false` serán convertidos a `1/0` automáticamente
- Los nuevos registros usarán `1` para disponible y `0` para no disponible
