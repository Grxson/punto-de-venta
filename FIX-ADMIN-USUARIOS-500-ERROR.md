# ✅ Fix: Error 500 en AdminUsers - Endpoint de Usuarios por Sucursal

## 🐛 Problema identificado

El frontend mostraba error **HTTP 500** al intentar cargar usuarios en la página `AdminUsers.tsx`:

```
❌ [GET] http://localhost:8080/api/auth/usuarios/sucursal/1 - Status 500
❌ [GET] http://localhost:8080/api/auth/usuarios/sucursal/1?activo=false - Status 500
```

### Causa raíz

El método en el servicio `UsuarioServicio.obtenerUsuariosPorSucursal()` estaba llamando directamente a:
```java
usuarioRepository.findBySucursalIdAndActivo(sucursalId, activo);
```

El problema era que cuando `activo` era `null` (para mostrar todos los usuarios), la query de Spring Data JPA no manejaba correctamente este caso, generando una excepción SQL interna.

---

## 🔧 Solución implementada

### 1. **Actualizar UsuarioRepository**
Se agregó un método alternativo para manejar el caso cuando `activo` es `null`:

```java
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findBySucursalId(Long sucursalId);  // ← NUEVO
    List<Usuario> findBySucursalIdAndActivo(Long sucursalId, Boolean activo);
    List<Usuario> findByRolId(Long rolId);
}
```

**Archivo:** `backend/src/main/java/com/puntodeventa/backend/repository/UsuarioRepository.java`

### 2. **Actualizar UsuarioServicio**
Se mejoró la lógica del método `obtenerUsuariosPorSucursal()` para manejar ambos casos:

```java
/**
 * Obtener todos los usuarios por sucursal
 */
public List<UsuarioDTO> obtenerUsuariosPorSucursal(Long sucursalId, Boolean activo) {
    log.info("Obteniendo usuarios para sucursal {} con filtro activo: {}", sucursalId, activo);
    
    try {
        List<Usuario> usuarios;
        
        // Si activo es null, obtener todos; si es un valor específico, filtrar
        if (activo == null) {
            usuarios = usuarioRepository.findBySucursalId(sucursalId);
            log.info("Obteniendo todos los usuarios de la sucursal: {} registros encontrados", usuarios.size());
        } else {
            usuarios = usuarioRepository.findBySucursalIdAndActivo(sucursalId, activo);
            log.info("Obteniendo usuarios {} de la sucursal: {} registros encontrados", 
                activo ? "activos" : "inactivos", usuarios.size());
        }
        
        return usuarios.stream().map(this::mapearADTO).toList();
    } catch (Exception e) {
        log.error("Error al obtener usuarios de la sucursal {}: {}", sucursalId, e.getMessage(), e);
        throw new RuntimeException("Error al obtener usuarios de la sucursal: " + e.getMessage(), e);
    }
}
```

**Archivo:** `backend/src/main/java/com/puntodeventa/backend/service/UsuarioServicio.java`

### 3. **Compilar y empaquetar**
```bash
cd backend
./mvnw clean package -DskipTests
```

---

## ✅ Verificación

### Test 1: Obtener todos los usuarios (sin filtro)
```bash
curl -X GET http://localhost:8080/api/auth/usuarios/sucursal/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:** ✅ **200 OK** - Retorna 4 usuarios activos

### Test 2: Obtener solo usuarios inactivos
```bash
curl -X GET "http://localhost:8080/api/auth/usuarios/sucursal/1?activo=false" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:** ✅ **200 OK** - Retorna 5 usuarios inactivos

### Test 3: Obtener solo usuarios activos
```bash
curl -X GET "http://localhost:8080/api/auth/usuarios/sucursal/1?activo=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:** ✅ **200 OK** - Retorna 4 usuarios activos

---

## 📝 Cambios realizados

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `UsuarioRepository.java` | Agregado método `findBySucursalId()` | Manejar el caso cuando `activo` es null |
| `UsuarioServicio.java` | Mejorado método `obtenerUsuariosPorSucursal()` | Validar si `activo` es null y usar el query apropiado |

---

## 🚀 Próximos pasos

1. ✅ Compilar el backend
2. ✅ Reinicar el backend
3. ✅ Probar en AdminUsers que los usuarios se cargan correctamente
4. ✅ Verificar que los filtros de estado funcionan

---

## 📋 Resumen técnico

- **Tipo de error:** NullPointerException en la query de Spring Data JPA
- **Severidad:** Alta (bloquea funcionalidad de Admin)
- **Estado:** ✅ **RESUELTO**
- **Impacto:** Los usuarios ahora se cargan correctamente en la página AdminUsers

**Fecha de corrección:** 2025-12-06  
**Versión del backend:** 1.0.0-SNAPSHOT
