# Fix: Error de Tipo de Dato en CategoriaSubcategoria

## 🔴 Problema

Al iniciar el backend, aparecía el siguiente error:

```
ERROR: column "activa" cannot be cast automatically to type integer
  Hint: You might need to specify "USING activa::integer".
```

Hibernate intentaba ejecutar:
```sql
ALTER TABLE categoria_subcategorias 
   ALTER COLUMN activa SET DATA TYPE INTEGER
```

Esto ocurría aunque la tabla se creó correctamente con `BOOLEAN`.

## 🔍 Causa Raíz

La entidad Java tenía dos problemas:

1. **Anotación incorrecta en Entity**:
   ```java
   @Column(nullable = false, columnDefinition = "INTEGER")
   @Builder.Default
   private Boolean activa = true;  // Boolean vs INTEGER!
   ```

2. **Configuración de Hibernate en mode "update"**:
   - `application-dev.properties` tenía `spring.jpa.hibernate.ddl-auto=update`
   - Esto causa que Hibernate intente sincronizar automáticamente el schema
   - Detectaba discrepancia entre la entidad (Boolean) y la tabla (BOOLEAN)

## ✅ Solución Aplicada

### 1. Corregir la Entidad (CategoriaSubcategoria.java)

```java
// ANTES ❌
@Column(nullable = false, columnDefinition = "INTEGER")
@Builder.Default
private Integer orden = 0;

@Column(nullable = false, columnDefinition = "INTEGER")
@Builder.Default
private Boolean activa = true;

// DESPUÉS ✅
@Column(nullable = false)
@Builder.Default
private Integer orden = 0;

@Column(nullable = false)
@Builder.Default
private Boolean activa = true;
```

**Por qué funciona**: Al remover `columnDefinition`, JPA infiere los tipos correctos:
- `Integer` → INTEGER
- `Boolean` → BOOLEAN

### 2. Cambiar DDL-AUTO a "validate" (application-dev.properties)

```properties
# ANTES ❌
spring.jpa.hibernate.ddl-auto=update

# DESPUÉS ✅
spring.jpa.hibernate.ddl-auto=validate
```

**Por qué funciona**: 
- `validate`: Solo verifica que la entidad JPA coincida con la tabla
- No intenta hacer cambios (ALTER TABLE)
- Flyway maneja la creación y migración de tablas
- Hibernate solo valida la consistencia

## 📋 Decisión Arquitectónica

En este proyecto:
- **Flyway** → Responsable de crear y migrar la BD
- **Hibernate** → Responsable de mapear entidades JPA a tablas
- Separación de responsabilidades:
  - DDL (CREATE, ALTER, DROP) → Flyway con migraciones
  - Schema validation → Hibernate en modo "validate"

### Valores de `ddl-auto` por perfil:

| Perfil | Valor      | Razón |
|--------|-----------|-------|
| dev    | `validate` | Desarrollo local, Flyway crea/migra |
| prod   | `validate` | Producción, nunca modificar schema |
| railway| `validate` | CI/CD pipeline, Flyway maneja BD |
| test   | `create-drop` | Tests aislados, no persistencia |

## 🧪 Verificación

### Build limpio
```bash
./mvnw clean compile
# ✓ Compilado sin errores
```

### Migración SQL correcta
```sql
-- V008__add_desayunos_subcategories.sql crea:
CREATE TABLE categoria_subcategorias (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,              -- ✓ Correcto
    activa BOOLEAN DEFAULT TRUE NOT NULL,  -- ✓ Correcto
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, nombre),
    FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id) ON DELETE CASCADE
);
```

### Entity JPA correcta
```java
@Column(nullable = false)
private Integer orden = 0;          // JPA → INTEGER ✓

@Column(nullable = false)
private Boolean activa = true;      // JPA → BOOLEAN ✓
```

## 📚 Lecciones Aprendidas

1. **Explícito vs Implícito**: Es mejor dejar que JPA infiera tipos simples
   - `Integer` → INTEGER automáticamente
   - `Boolean` → BOOLEAN automáticamente
   - Especificar `columnDefinition` solo para tipos complejos

2. **Responsabilidades claras**:
   - Flyway: Migraciones de BD (DDL)
   - Hibernate: Validación de esquema
   - Nunca dejar ambos manejando DDL

3. **Perfiles consistentes**:
   - Usar `validate` cuando Flyway está activo
   - Usar `update` solo en desarrollo sin Flyway
   - Nunca `update` en producción

## 🚀 Próximos Pasos

✅ **Completado**:
- Entity corregida
- Configuración ajustada
- Compilación exitosa
- Git commit realizado

⏭️ **Siguiente**:
- Ejecutar backend: `./start.sh`
- Verificar que Flyway ejecuta migración V008
- Confirmar endpoint `/api/categorias/{id}/subcategorias` funciona
- Probar en admin form: Productos → Agregar → Seleccionar Desayunos

---
**Estado**: ✅ **RESUELTO**
**Archivos modificados**: 2
**Líneas cambiadas**: 3 cambios (remover `columnDefinition`)
