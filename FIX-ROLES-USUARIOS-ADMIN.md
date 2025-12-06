# Fix: Mostrar Roles de Usuarios en Admin Panel

## Problema Identificado
El rol de los usuarios no se mostraba en la tabla de administración (`/admin/usuarios`), aunque los usuarios tenían roles asignados en la base de datos.

## Causa Raíz
El DTO `UsuarioDTO` del backend estaba retornando solo `rolNombre` (string) en lugar de un objeto `Rol` con `id` y `nombre`. El frontend espera:

```typescript
usuario.rol: {
  id: Long,
  nombre: String,
  descripcion: String,
  activo: Boolean
}
```

Pero el backend retornaba:
```java
rolNombre: String  // solo el nombre, sin ID
```

## Solución Implementada

### 1. **Backend - Actualizar UsuarioDTO**
Cambié de `record` a clase normal con Lombok para permitir mejor mapeo:

```java
@Data
@Builder
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String username;
    private Boolean activo;
    private RolDTO rol;           // ← NUEVO: Objeto Rol con id y nombre
    private String rolNombre;     // ← MANTENER: Para compatibilidad hacia atrás
    private Long sucursalId;
    // ... otros campos
    
    @Data
    @Builder
    public static class RolDTO {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activo;
    }
}
```

### 2. **Backend - Actualizar UsuarioServicio**
Actualicé el método `mapearADTO()` para incluir el objeto `Rol` completo:

```java
private UsuarioDTO mapearADTO(Usuario usuario) {
    UsuarioDTO dto = new UsuarioDTO();
    // ... mapeo de campos básicos ...
    
    // Mapear rol si existe
    if (usuario.getRol() != null) {
        UsuarioDTO.RolDTO rolDTO = UsuarioDTO.RolDTO.builder()
            .id(usuario.getRol().getId())
            .nombre(usuario.getRol().getNombre())
            .descripcion(usuario.getRol().getDescripcion())
            .activo(usuario.getRol().getActivo())
            .build();
        dto.setRol(rolDTO);
        dto.setRolNombre(usuario.getRol().getNombre()); // compatibilidad
    }
    
    return dto;
}
```

### 3. **Frontend - Mejorar Manejo de Roles**
Hice más defensivo el componente `UsuariosTable.tsx`:

```tsx
<TableCell>
  {usuario.rol ? (
    <Select
      value={usuario.rol.id || ''}
      onChange={(e) => onChangeRole(usuario.id, Number(e.target.value))}
      size="small"
      variant="standard"
      sx={{ minWidth: 120 }}
    >
      {Array.isArray(roles) && roles.map((rol) => (
        <MenuItem key={rol.id} value={rol.id}>
          {rol.nombre}
        </MenuItem>
      ))}
    </Select>
  ) : (
    <Chip label="Sin asignar" size="small" variant="outlined" />
  )}
</TableCell>
```

## Cambios de Archivos

### Backend
- `src/main/java/com/puntodeventa/backend/dto/UsuarioDTO.java`
  - Cambió de `record` a clase con Lombok
  - Agregó DTO anidado `RolDTO` con campos completos
  - Mantiene compatibilidad con `rolNombre`

- `src/main/java/com/puntodeventa/backend/service/UsuarioServicio.java`
  - Actualizado método `mapearADTO()`
  - Ahora crea objeto `RolDTO` completo

### Frontend
- `src/components/admin/UsuariosTable.tsx`
  - Agregadas validaciones defensivas
  - Mejor manejo de valores null/undefined

## Comportamiento Esperado

**Antes:**
```
Nombre           | Email                  | Usuario | Rol               | Estado
Maria González   | gerente@puntodeventa   | gerente | (dropdown vacío)  | Activo
```

**Después:**
```
Nombre           | Email                  | Usuario | Rol               | Estado  
Maria González   | gerente@puntodeventa   | gerente | [Gerente ▼]      | Activo
                                                      ↳ Administrador
                                                      ↳ Cajero
                                                      ↳ Vendedor
```

## Testing
Para verificar que funciona:

1. **Con backend ejecutándose:**
   ```bash
   # Obtener token
   TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}' \
     | jq -r '.data.token')
   
   # Obtener usuarios con roles
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/auth/usuarios/sucursal/1
   ```

2. **En el navegador:**
   - Login en http://localhost:3000
   - Navegar a Admin → Usuarios
   - Deberías ver los roles mostrados en un selector dropdown

## Notas Importantes

✅ **Compatible hacia atrás**: Se mantiene `rolNombre` para cualquier código que dependa de él

✅ **Rol anidado**: Ahora `usuario.rol` contiene el objeto Rol completo con id, nombre, descripción y estado

✅ **Null-safe**: El componente maneja casos donde `rol` es null o undefined

## Stack Afectado
- Backend: Java 21 + Spring Boot 3.5.7
- Frontend: React 18 + TypeScript + MUI
- API: `/api/auth/usuarios/sucursal/{sucursalId}`
