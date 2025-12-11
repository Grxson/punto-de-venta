# 🔧 Manual Fixes Required for Main Branch

**Objetivo:** Aplicar los fixes de Boolean/SMALLINT y column naming directamente en main sin hacer merge completo.

**Estado:** develop tiene todos los fixes, main está limpio pero sin los cambios de código.

---

## Archivos que Necesitan Cambios en Main

### 1. VentaItem.java

**Cambio 1: @JoinColumn para tamaño_id**
```
LÍNEA ACTUAL:  @JoinColumn(name = "tamano_id")
CAMBIAR A:    @JoinColumn(name = "tamaño_id")
```

**Cambio 2: @Column para precio_extra_tamaño**
```
LÍNEA ACTUAL:  @Column(name = "precio_extra_tamano", ...)
CAMBIAR A:    @Column(name = "precio_extra_tamaño", ...)
```

**Cambio 3: Agregar converter para fields Boolean (si existen)**
- Si hay campos tipo boolean, agregar: `@Convert(converter = BooleanToIntegerConverter.class)`

---

### 2. ProductoVarianteTamano.java

**Cambio: @JoinColumn para tamaño_id**
```
LÍNEA ACTUAL:  @JoinColumn(name = "tamano_id")
CAMBIAR A:    @JoinColumn(name = "tamaño_id")
```

---

### 3. Usuario.java, Rol.java, Ingrediente.java, etc. (Entities con Boolean)

**Agregar converters:**
```java
@Convert(converter = BooleanToIntegerConverter.class)
@Column(columnDefinition = "SMALLINT DEFAULT 1")
private Boolean activo;
```

---

### 4. Crear BooleanToIntegerConverter.java

**Nueva clase necesaria en:** `backend/src/main/java/com/puntodeventa/backend/converter/`

```java
package com.puntodeventa.backend.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class BooleanToIntegerConverter implements AttributeConverter<Boolean, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) {
            return 0;
        }
        return attribute ? 1 : 0;
    }

    @Override
    public Boolean convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return false;
        }
        return dbData != 0;
    }
}
```

---

### 5. Database Migrations

**Crear: V018__convert_all_booleans_to_smallint.sql**
- Location: `backend/src/main/resources/db/migration/`
- Content: [Copiar desde develop]

**Crear: V019__rename_tilde_columns_to_ascii.sql** (comentado/inactivo)
- Location: `backend/src/main/resources/db/migration/`
- Content: [Copiar desde develop]

---

## Alternativa: Push Force (No Recomendado)

Si quieres ser más agresivo, podrías hacer:
```bash
git checkout develop
git push origin develop --force  # Sobrescribir main con develop
git push origin main --force     # Si quieres que main = develop
```

**⚠️ RIESGO:** Perderías el historial de commits en main

---

## Recomendación Final

Es mejor mantener las ramas separadas y hacer que Railway depliegue desde `develop` en lugar de `main`. Esto es más seguro y evita conflictos de merge.

**Nueva estrategia:**
1. Configure Railway para que depliegue desde `develop` branch
2. Cree un tag de release v1.0.1-hotfix en develop
3. Monitoree los logs después del despliegue

---

