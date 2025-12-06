# 🔍 GUÍA DE DEBUGGING - Crear Usuarios desde Frontend

## ✅ Backend está funcionando

El backend funciona correctamente cuando se prueba con `curl`:
```bash
curl -X POST "http://localhost:8080/api/auth/usuarios" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"NewUser","apellido":"Test2025","email":"newuser2025@example.com","username":"newuser2025","password":"password12345","rolId":1,"sucursalId":1}'
```

**Respuesta:** ✅ 201 Created (funciona)

---

## ⚠️ Frontend devuelve 400 Bad Request

El formulario React devuelve HTTP 400 cuando intenta crear usuario. Esto significa:
- El backend rechaza los datos
- **Validación de campos fallando**
- **Estructura de datos incorrecta**

---

## 🔧 Cómo Debuggear

### Paso 1: Abrir DevTools de Firefox

```
Presiona: F12
Pestaña: Consola
```

### Paso 2: Buscar los logs que agregué

Ahora tienes estos logs cuando intentes crear un usuario:

```javascript
📝 Datos del formulario: { ... }
📤 [POST] http://localhost:8080/api/auth/usuarios { ... }
❌ Error de validación: { ... }
```

### Paso 3: Compartir esos logs

**Te pido que copies y compartas:**
1. Lo que ves en `📝 Datos del formulario:`
2. Lo que ves en `📤 [POST] http://localhost:8080/api/auth/usuarios`
3. El error que devuelve el servidor (en la consola o en Network tab → Response)

---

## 🎯 Qué Estamos Buscando

El error 400 típicamente significa uno de estos:

### 1. **Campo faltante o nulo**
```javascript
// ❌ Incorrecto
{
  nombre: "Test",
  apellido: "User",
  email: "test@example.com",
  username: "test",
  password: "password123",
  // ❌ Falta rolId o sucursalId
}

// ✅ Correcto
{
  nombre: "Test",
  apellido: "User",
  email: "test@example.com",
  username: "test",
  password: "password123",
  rolId: 1,      // ✅ Presente
  sucursalId: 1, // ✅ Presente
}
```

### 2. **Tipo de dato incorrecto**
```javascript
// ❌ Incorrecto
{ rolId: "1", sucursalId: "1" } // strings en lugar de números

// ✅ Correcto
{ rolId: 1, sucursalId: 1 } // números
```

### 3. **Validaciones del DTO**
```java
@NotBlank(message = "El nombre es requerido") - no puede ser vacío
@NotNull(message = "El rol es requerido") - no puede ser null
@Size(min = 8, message = "...") - mínimo 8 caracteres
@Email(message = "...") - formato de email válido
```

---

## 📝 Requisitos del DTO (Backend)

El backend espera exactamente esto en `CrearUsuarioRequest`:

```json
{
  "nombre": "string (requerido, no vacío)",
  "apellido": "string (requerido, no vacío)",
  "email": "string (requerido, formato email válido)",
  "username": "string (requerido, 3-50 caracteres)",
  "password": "string (requerido, mínimo 8 caracteres)",
  "rolId": "number (requerido, > 0)",
  "sucursalId": "number (requerido, > 0)"
}
```

---

## 🖥️ Backend Logs

Si quieres ver los errores en el backend también:

```bash
# Ver logs en tiempo real
tail -f /tmp/backend.log

# Ver últimos errores
tail -50 /tmp/backend.log | grep -E "ERROR|Warning|validacion|error de validación"
```

El backend ahora logea:
```
❌ Error de validación en request: { nombre: "El nombre es requerido", ... }
```

---

## 📋 Checklist de Testing

- [ ] ¿Llenan todos los campos en el formulario?
- [ ] ¿Seleccionan un Rol válido?
- [ ] ¿Seleccionan una Sucursal válida?
- [ ] ¿La contraseña tiene 8+ caracteres?
- [ ] ¿El email tiene formato válido?
- [ ] ¿El nombre de usuario es único?
- [ ] ¿Aparece algún error rojo en el formulario?

---

## 🚀 Próximos Pasos

1. **Abre F12 en el navegador**
2. **Intenta crear un usuario**
3. **Copia los logs de la Consola**
4. **Comparte esos logs conmigo**
5. **Yo identificaré exactamente cuál campo está fallando**

Entonces podré arreglarlo inmediatamente.

---

**Status:** 🔴 Esperando logs del frontend para diagnosticar
**Logs Agregados:** 
- Frontend: `usuariosService.crear()`, `handleFormSubmit`, `apiService.post()`
- Backend: Validación con detalles en `GlobalExceptionHandler`
