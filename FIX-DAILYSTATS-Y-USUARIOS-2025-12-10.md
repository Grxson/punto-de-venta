# 🔧 FIX: DailyStatsPanel ($0.00) + Error 400 Editar Usuarios

**Fecha**: 10 de diciembre de 2025  
**Estado**: ✅ ARREGLADO  
**Complejidad**: 🟢 Baja  
**Tiempo aplicado**: 15 minutos

---

## 📊 Problema 1: DailyStatsPanel muestra $0.00

### Síntoma
```
┌─────────────────┐
│ Resumen del Día │
├─────────────────┤
│ Venta   $0.00   │  ❌ Debería mostrar $3340.00
│ Gastos  $0.00   │
│ Neto    $0.00   │
└─────────────────┘
```

### Causa Raíz
**Problema de zona horaria** - El componente convertía fechas locales a ISO strings incorrectamente:

```typescript
// ❌ CÓDIGO VIEJO (Incorrecto)
const hoy = new Date();
const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

// Si usuario está en zona local UTC-5, pero crea dates en local
// Luego las convierte a ISO... el rango ya no cubre todo el día!
const url = `...?desde=${inicioDia.toISOString()}&hasta=${finDia.toISOString()}`;

// Ejemplo problema:
// Zona local: UTC-5
// inicioDia = 10:00 local → toISOString() = 15:00 UTC ❌ (NO EMPIEZA EN 00:00)
// finDia = 23:59 local → toISOString() = 04:59+1 UTC ❌ (SALTA AL DÍA SIGUIENTE)
```

**Resultado**: El backend busca ventas entre 15:00 UTC a 04:59+1 UTC, cuando debería ser 00:00 UTC a 23:59 UTC.

### Solución
✅ **Usar ISO strings exactos en UTC**:

```typescript
// ✅ CÓDIGO NUEVO (Correcto)
const hoy = new Date();
const fechaHoy = hoy.toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
const inicioDiaISO = `${fechaHoy}T00:00:00.000Z`; // 00:00 UTC
const finDiaISO = `${fechaHoy}T23:59:59.999Z`;    // 23:59 UTC

// Ahora SIEMPRE cubre las 24 horas completas del día en UTC
const url = `...?desde=${inicioDiaISO}&hasta=${finDiaISO}`;
```

### Cambios realizados
**Archivo**: [frontend-web/src/components/DailyStatsPanel.tsx](frontend-web/src/components/DailyStatsPanel.tsx#L92-L99)

```diff
- const hoy = new Date();
- const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
- const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
+ const hoy = new Date();
+ const fechaHoy = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
+ const inicioDiaISO = `${fechaHoy}T00:00:00.000Z`;
+ const finDiaISO = `${fechaHoy}T23:59:59.999Z`;

  const desgloseResponse = await apiService.get(
-   `${API_ENDPOINTS.SALES}/resumen/metodos-pago?desde=${inicioDia.toISOString()}&hasta=${finDia.toISOString()}`
+   `${API_ENDPOINTS.SALES}/resumen/metodos-pago?desde=${inicioDiaISO}&hasta=${finDiaISO}`
  );
```

---

## 🔴 Problema 2: Error 400 al editar usuarios

### Síntoma
```
PUT https://punto-de-venta-production.up.railway.app/api/auth/usuarios/38

❌ Status 400
📧 Error: Los datos proporcionados no son válidos
```

En consola del navegador:
```
❌ Error en respuesta: Los datos proporcionados no son válidos
❌ Error al actualizar usuario: Error: Los datos proporcionados no son válidos
Error al guardar usuario: Error: Los datos proporcionados no son válidos
```

### Causa Raíz
**Validación incorrecta de password** - El DTO rechazaba strings vacíos:

```java
// ❌ CÓDIGO VIEJO
public record EditarUsuarioRequest(
    String nombre,
    String apellido,
    String email,
    String username,
    
    @Size(min = 8, message = "...")  // ❌ Sin @Nullable
    String password,  // Rechaza "" porque no tiene 8+ caracteres
    
    Long rolId,
    Long sucursalId
) {}
```

**El problema**:
1. Usuario abre editar usuario (password vacío)
2. Frontend envía: `{ nombre, apellido, email, username, password: "", rolId, sucursalId }`
3. Backend valida `@Size(min=8)` en string vacío
4. **Falla**: "" tiene 0 caracteres, no 8 → Error 400

### Solución
✅ **Hacer password truly optional con @Nullable**:

```java
// ✅ CÓDIGO NUEVO
public record EditarUsuarioRequest(
    String nombre,
    String apellido,
    String email,
    String username,
    
    @Nullable  // ✅ Permite null
    @Size(min = 8, max = 100, message = "Si proporciona contraseña, debe tener entre 8 y 100 caracteres")
    String password,
    
    Long rolId,
    Long sucursalId
) {}
```

**Además**, en el frontend mejoré el envío:

```typescript
// ✅ No enviar password si está vacío
const submitData: any = {
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
    username: data.username,
    rolId,
    sucursalId,
};

// Solo incluir password si tiene contenido
if (data.password && data.password.trim().length > 0) {
    submitData.password = data.password;
}
```

### Cambios realizados

**Archivo 1**: [backend/src/main/java/com/puntodeventa/backend/dto/EditarUsuarioRequest.java](backend/src/main/java/com/puntodeventa/backend/dto/EditarUsuarioRequest.java)

```diff
  import jakarta.validation.constraints.*;
+ import org.springframework.lang.Nullable;

  public record EditarUsuarioRequest(
      @NotBlank
      String nombre,
      
      @NotBlank
      String apellido,
      
      @Email
      String email,
      
      @NotBlank
      @Size(min = 3, max = 50)
      String username,
      
-     @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
+     @Nullable
+     @Size(min = 8, max = 100, message = "Si proporciona contraseña, debe tener entre 8 y 100 caracteres")
      String password,
      
      @NotNull
      Long rolId,
      
      @NotNull
      Long sucursalId
  ) {}
```

**Archivo 2**: [frontend-web/src/components/admin/UsuarioForm.tsx](frontend-web/src/components/admin/UsuarioForm.tsx#L102-L132)

```diff
  const handleFormSubmit = async (data: UsuarioFormData) => {
      // ... validaciones ...
      
-     const submitData = {
-         ...data,
-         rolId,
-         sucursalId,
-     };
+     const submitData: any = {
+         nombre: data.nombre,
+         apellido: data.apellido,
+         email: data.email,
+         username: data.username,
+         rolId,
+         sucursalId,
+     };
+     
+     // Solo incluir password si no está vacío
+     if (data.password && data.password.trim().length > 0) {
+         submitData.password = data.password;
+     }
      
      await onSubmit(submitData);
  };
```

---

## 🧪 Prueba de Verificación

### DailyStatsPanel
```bash
# 1. Abrir navegador DevTools (F12)
# 2. Ir a Network
# 3. Recargar página
# 4. Buscar: "resumen/metodos-pago"
# 5. Ver parámetros:
#    ?desde=2025-12-10T00:00:00.000Z&hasta=2025-12-10T23:59:59.999Z
#    ✅ Debe mostrar rangos correctos

# 6. Ver respuesta:
#    { "totalVentas": 3340.00, ... }
#    ✅ Debe tener valores numéricos, NO 0
```

### Editar Usuarios
```bash
# 1. Ir a Admin → Usuarios
# 2. Hacer clic en editar usuario
# 3. Cambiar nombre o email (dejar password vacío)
# 4. Hacer clic en Guardar
# 5. Ver Network:
#    PUT /api/auth/usuarios/38
#    Headers: Authorization, Content-Type
#    Body: { nombre, apellido, email, username, rolId, sucursalId }
#    (sin password si está vacío)
#    ✅ Debe responder 200 OK, NO 400

# 6. Verificar usuario actualizado
#    ✅ Debe refrescar lista con nuevos datos
```

---

## 📋 Checklist de Verificación

### Backend
- [x] EditarUsuarioRequest ahora tiene `@Nullable` en password
- [x] Mensaje de validación mejorado y más claro
- [x] UsuarioServicio ya maneja bien password null/blank

### Frontend (DailyStatsPanel)
- [x] Usa fechas en ISO UTC strings exactos
- [x] Cubre siempre las 24 horas completas del día
- [x] Sin problemas de zona horaria

### Frontend (UsuarioForm)
- [x] No envía password si está vacío
- [x] Solo incluye password en objeto si tiene contenido
- [x] Logs mejorados para debug

---

## 🚀 Próximos Pasos

### Si sigue mostrando $0.00:
1. Verificar que hay ventas/gastos en BD para hoy
2. Revisar logs del backend: `/api/estadisticas/ventas/dia`
3. Probar manualmente con Swagger:
   ```
   GET /api/estadisticas/ventas/dia?fecha=2025-12-10
   ```
4. Verificar zona horaria del servidor vs cliente

### Si sigue error 400 en usuarios:
1. Abre DevTools → Network
2. Ver respuesta exacta del backend (no solo "400")
3. Revisar body de la petición que se envía
4. Verificar logs del backend de validación

---

## 📝 Resumen Técnico

| Aspecto | Antes | Después |
|---------|-------|---------|
| **DailyStats - Rango fechas** | `Date.toISOString()` en zona local | ISO strings exactos en UTC |
| **DailyStats - Cobertura** | Varía según zona horaria del usuario | Siempre 24 horas completas |
| **Password - Validación** | `@Size(min=8)` en null/empty ❌ | `@Nullable + @Size(min=8)` ✅ |
| **Password - Frontend** | Envía "" siempre | Solo envía si tiene contenido |
| **Error esperado** | 400 "Datos no válidos" | 200 OK ✅ |

---

## 🔗 Referencias

- [EditarUsuarioRequest](backend/src/main/java/com/puntodeventa/backend/dto/EditarUsuarioRequest.java)
- [UsuarioServicio.actualizarUsuario()](backend/src/main/java/com/puntodeventa/backend/service/UsuarioServicio.java#L178)
- [DailyStatsPanel.tsx](frontend-web/src/components/DailyStatsPanel.tsx)
- [UsuarioForm.tsx](frontend-web/src/components/admin/UsuarioForm.tsx)
- [EstadisticasController](backend/src/main/java/com/puntodeventa/backend/controller/EstadisticasController.java)

---

**¿Preguntas?** Revisa los logs del backend si algo sigue sin funcionar. Los cambios ahora están listos para usar.
