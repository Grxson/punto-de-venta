# 🔍 Guía de Debugging - Registro de Mermas

**Fecha**: 19 de diciembre 2025  
**Propósito**: Ayudarte a identificar y resolver problemas al registrar mermas

---

## 🚨 Problema Reportado

**Síntoma**: Al registrar una merma, aparece el mensaje de confirmación pero la merma no se crea en la BD.

**Causa potencial**: El POST a `/api/inventario/mermas` no se está ejecutando o falla silenciosamente.

---

## 🔧 Soluciones Implementadas

### 1. ✅ Validaciones Agregadas

Ahora el sistema valida ANTES de intentar guardar:

```typescript
// ❌ Si seleccionas "Producto Completo" pero el producto NO tiene receta:
if (!productoSeleccionado.receta || productoSeleccionado.receta.length === 0) {
  setError('El producto "Jugo Naranja" no tiene una receta configurada...');
  return;  // ← AQUÍ DETIENE y muestra error al usuario
}
```

**Resultado**: Si el producto no tiene receta, ves un error ANTES de intentar guardar.

### 2. ✅ Logging Detallado en Consola

Se agregó logging en cada paso:

```
📝 Guardando merma de ingrediente: { ingrediente: "Toronja", cantidad: 0.5, unidad: 1 }
📤 Enviando POST a /inventario/mermas: { ingredienteId: 5, cantidad: 0.5, ... }
📥 Respuesta del servidor: { success: true, data: {...} }
✅ Se guardaron 1 mermas exitosamente
```

---

## 🎯 Cómo Debuggear el Problema

### Paso 1: Abre la Consola del Navegador
```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Paso 2: Ve a la Pestaña "Console"

### Paso 3: Intenta Registrar una Merma

**Caso A: Merma de Ingrediente Individual**

En la consola deberías ver:
```
📝 Guardando merma de ingrediente: {ingrediente: "Toronja", cantidad: 0.5, unidad: 1}
📤 Enviando POST a /inventario/mermas: {ingredienteId: 5, cantidad: 0.5, ...}
📥 Respuesta del servidor: {success: true, ...}
```

**Si no ves el POST** (📤):
- ❌ El código no llegó hasta apiService.post()
- Posible razón: Error en la validación
- Revisa el mensaje de error en la UI

**Si ves POST pero sin respuesta** (no ves 📥):
- ❌ El servidor no respondió o hubo timeout
- Posible razón: Backend caído, error 500, etc
- Abre la pestaña "Network" y busca la petición POST

---

## 🌐 Verificación en Pestaña Network

### Paso 1: Abre DevTools → Network
```
F12 → Tab "Network"
```

### Paso 2: Limpia el registro
```
Click en el ícono de papelera 🗑️
```

### Paso 3: Intenta Registrar Merma

### Paso 4: Busca el POST
```
Filtro: Busca "mermas" en la lista
```

### Ejemplo de POST Exitoso:
```
POST /api/inventario/mermas
Status: 201 ✅ (o 200)
Headers: Content-Type: application/json
Body (Request): {
  "ingredienteId": 5,
  "cantidad": 0.5,
  "unidadId": 1,
  "motivo": "Producto vencido",
  "costoUnitario": 6.67,
  "costoTotal": 3.34,
  "fecha": "2025-12-19T10:30:00Z"
}
Response: {
  "success": true,
  "data": {...}
}
```

### Ejemplo de POST Fallido:
```
POST /api/inventario/mermas
Status: 400/401/403/404/500 ❌
Response: {
  "success": false,
  "error": "Ingrediente no encontrado"
}
```

---

## 📋 Checklist de Problemas Comunes

### ❌ Problema: No veo ningún POST en Network
**Solución**:
1. Revisa que hayas completado TODOS los campos
2. Revisa los mensajes de error en la UI
3. Abre la consola (F12) y busca mensajes rojos

### ❌ Problema: Veo POST pero Status 404
**Solución**:
- El endpoint `/api/inventario/mermas` no existe en el backend
- Verifica que el backend esté corriendo: `http://localhost:8080`
- Revisa en `backend/DEVELOPMENT-GUIDE.md` el endpoint correcto

### ❌ Problema: Veo POST pero Status 401/403
**Solución**:
- Token de autenticación inválido o expirado
- Intenta hacer logout y login nuevamente
- En DevTools → Application → Local Storage, verifica `auth_token`

### ❌ Problema: Veo POST pero Status 500
**Solución**:
- Error en el servidor (backend)
- Revisa los logs del backend: `cd backend && ./start.sh`
- Busca líneas rojas (ERROR, Exception, etc)

### ❌ Problema: Veo POST exitoso (201/200) pero la merma no aparece
**Solución**:
1. Abre la consola y verifica que diga ✅ y el conteo de mermas
2. Busca en la UI la tabla de mermas - ¿aparece la nueva merma?
3. Si no aparece, haz F5 para refrescar la página
4. Si sigue sin aparecer, el GET está mal: `GET /api/inventario/mermas`

---

## 🎯 Flujo Completo Esperado

### Si todo funciona correctamente:

```
┌──────────────────────────────────────────────────────┐
│ 1. Completar formulario y click "Guardar Merma"      │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 2. CONSOLA muestra:                                  │
│    📝 Guardando merma...                             │
│    📤 Enviando POST a /inventario/mermas             │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 3. NETWORK muestra:                                  │
│    POST /api/inventario/mermas → 201/200 OK         │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 4. CONSOLA muestra:                                  │
│    📥 Respuesta del servidor: { success: true }     │
│    ✅ Se guardaron 1 mermas exitosamente             │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 5. UI muestra:                                       │
│    ✓ Merma de ingrediente registrada...             │
│    (snackbar verde de confirmación)                 │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 6. Dialog se cierra                                  │
└──────────────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────────────┐
│ 7. Tabla de mermas se actualiza                      │
│    (nueva merma aparece en la lista)                │
└──────────────────────────────────────────────────────┘
```

---

## 💡 Tips para Debugging Avanzado

### 1. Inspeccionar Variable de Estado

En la consola, puedes ver el estado del componente:

```javascript
// Escribe en la consola:
localStorage.getItem('cantidad')  // Ver valor actual
```

### 2. Ver Peticiones HTTP Exactas

En Network → Headers:
```
Request Headers:
├─ Authorization: Bearer eyJhbGc...
├─ Content-Type: application/json
└─ Accept: application/json

Request Body:
{
  "ingredienteId": 5,
  "cantidad": 0.5,
  ...
}
```

### 3. Ver Respuesta del Servidor

En Network → Response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "ingredienteId": 5,
    "cantidad": 0.5,
    "costoTotal": 3.34,
    ...
  }
}
```

### 4. Replicar POST en Postman

Si tienes Postman instalado, puedes probar el endpoint directamente:

```
POST http://localhost:8080/api/inventario/mermas

Headers:
Authorization: Bearer <tu_token>
Content-Type: application/json

Body:
{
  "ingredienteId": 5,
  "cantidad": 0.5,
  "unidadId": 1,
  "motivo": "Test",
  "costoUnitario": 6.67,
  "costoTotal": 3.34,
  "fecha": "2025-12-19T10:30:00Z"
}
```

---

## 📝 Información a Incluir en el Reporte de Bugs

Si el problema persiste, incluye:

1. **Consola (F12 → Console)**:
   ```
   Copia todo lo que aparezca (errores, logs, etc)
   ```

2. **Network (F12 → Network)**:
   ```
   POST /api/inventario/mermas
   Status: [___]
   Response: [___]
   ```

3. **Tipo de Merma**:
   ```
   ¿Ingrediente Individual o Producto Completo?
   ```

4. **Datos Ingresados**:
   ```
   Ingrediente/Producto: ___
   Cantidad: ___
   Unidad: ___
   Motivo: ___
   ```

5. **Comportamiento Esperado vs Actual**:
   ```
   Esperado: Merma aparece en tabla
   Actual: [describe qué sucedió]
   ```

---

## ✅ Validaciones Correctas Ahora

Con la actualización de hoy, el sistema ahora valida:

| Validación | Antes | Ahora |
|-----------|-------|-------|
| Producto sin receta | ❌ Silencioso | ✅ Error claro |
| Campos vacíos | ❌ Silencioso | ✅ Error claro |
| POST fallido | ❌ Silencioso | ✅ Error claro |
| Logging | ❌ Nada | ✅ Detallado |
| Conteo de mermas | ❌ No | ✅ Sí ("3 mermas creadas") |

---

## 🎯 Próximos Pasos

Una vez que confirmes que las mermas se guardan correctamente:

1. ✅ Verifica que el inventario se descuente
2. ✅ Verifica que aparezcan en reportes
3. ✅ Prueba mermas de productos con receta compleja
4. ✅ Prueba eliminación de mermas

---

**Última actualización**: 19 de diciembre 2025  
**Status**: Listo para testing  
**Soporte**: Abre la consola (F12) y busca los logs 📝
