# 🎯 SOLUCIÓN RÁPIDA - "No me deja ingresar aunque inicie sesión como admin"

## ⚡ Fix en 5 minutos

### Paso 1: Abre DevTools (F12)
```
Presiona F12 en el navegador
→ Pestaña "Application" o "Storage"
→ LocalStorage → http://localhost:5173
```

### Paso 2: Busca estos datos
```
auth_token    → ¿Existe? ¿Tiene valor?
auth_usuario  → ¿Existe? ¿Tiene JSON?
```

**Si NO existen:**
- ❌ El login está fallando
- Solución: Ver "Diagnóstico" abajo

**Si SÍ existen:**
- ✅ El login funcionó
- Continúa al Paso 3

### Paso 3: Verifica Network Headers
```
F12 → Network tab
Realiza cualquier acción en el frontend que requiera autenticación
Busca el request en la lista
Haz click → "Headers" tab
Busca "Authorization"
```

**Si ves:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```
✅ Headers son correctos → Problema en la lógica del UI

**Si NO ves Authorization:**
```
Headers (sin Authorization) ❌
```
❌ El token no se está enviando → Necesitas fix en api.service.ts

---

## 🔧 Fixes Rápidos

### Fix 1: Si el token NO se guarda en localStorage

**En `frontend-web/src/contexts/AuthContext.tsx`**

Busca el método `login` y asegúrate que tenga estas líneas DESPUÉS de recibir el token:

```typescript
// Guardar en localStorage
localStorage.setItem('auth_token', newToken);
localStorage.setItem('auth_usuario', JSON.stringify(usuarioNormalizado));

// Configurar en apiService
apiService.setAuthToken(newToken);
```

Si NO las ves, añádelas.

### Fix 2: Si el token se guarda pero NO se envía

**En `frontend-web/src/services/api.service.ts`**

Busca el método `buildHeaders` (alrededor de línea 70) y verifica que tenga:

```typescript
private buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...options.headers };

  // Agregar token
  if (options.requiresAuth !== false) {
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;  // ← IMPORTANTE
    }
  }

  return headers;
}
```

Si NO está esta línea, añádela.

### Fix 3: Limpiar todo y reintentar

En Console (F12):

```javascript
// Limpiar localStorage
localStorage.clear();

// Recargar página
window.location.reload();

// Intentar login de nuevo
```

---

## 🧪 Diagnóstico Interactivo

### Test 1: ¿El token se guardó?

```javascript
console.log('Token:', localStorage.getItem('auth_token'));
```

Debería mostrar: `eyJhbGciOiJIUzI1NiI...` (texto largo)

Si muestra `null` → El token no se guardó

### Test 2: ¿El token se envía?

```javascript
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8080/api/sucursales/actual', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('✅ Funciona:', d))
.catch(e => console.error('❌ Error:', e));
```

Debería mostrar: `✅ Funciona: {...}`

Si muestra `❌ Error: 403` → Token no se envía o es inválido

### Test 3: ¿El token es válido?

```javascript
const token = localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = new Date(payload.exp * 1000);
console.log('Expira:', exp.toLocaleString());
console.log('¿Válido?', exp > new Date() ? '✅' : '❌ EXPIRADO');
```

---

## 🎓 3 Escenarios Posibles

### Escenario A: Token NO existe en localStorage

```
localStorage.getItem('auth_token') → null
```

**Causa:** El login no guardó el token

**Solución:**
1. Abre Network tab (F12)
2. Intenta login
3. Busca request `POST /api/auth/login`
4. Abre Response
5. ¿Ves `"token": "eyJ..."`?
   - SÍ → Bug en frontend (ver Fix 1)
   - NO → Bug en backend

### Escenario B: Token existe pero status 403

```
localStorage.getItem('auth_token') → eyJ...
fetch() → Status 403 Forbidden
```

**Causa:** Token inválido o expirado

**Solución:**
```javascript
// Haz login de nuevo
localStorage.clear();
// Recarga y hace login again
```

### Escenario C: Token existe, status 200, pero UI en login

```
localStorage.getItem('auth_token') → eyJ...
fetch() → Status 200 OK
Respuesta: {sucursalId: 1, sucursalNombre: "..."}
Pero pantalla sigue en login ❌
```

**Causa:** El componente no se re-renderiza después del login

**Solución:**
1. Verifica que el context provider está en `main.tsx` o `App.tsx`
2. Verifica que el componente usa `useAuth()` hook
3. Verifica que hay un `useEffect` que redirige cuando `isAuthenticated === true`

---

## 📚 Documentos Completos

Si necesitas más detalle:

1. **[FIX-FRONTEND-LOGIN-NO-FUNCIONA.md](FIX-FRONTEND-LOGIN-NO-FUNCIONA.md)** ← Documentación completa
2. **[SCRIPT-DIAGNOSTICO-FRONTEND-LOGIN.md](SCRIPT-DIAGNOSTICO-FRONTEND-LOGIN.md)** ← Scripts de debug
3. **[FIX-ERROR-403-JWT-AUTHENTICATION.md](FIX-ERROR-403-JWT-AUTHENTICATION.md)** ← Errores 403
4. **[DEBUGGING-403-INTERACTIVE.md](DEBUGGING-403-INTERACTIVE.md)** ← Deep dive

---

## ✅ Checklist de Verificación

- [ ] F12 → Storage → LocalStorage muestra `auth_token`
- [ ] F12 → Network → Authorization header presente
- [ ] Console test: `localStorage.getItem('auth_token')` devuelve valor
- [ ] Console test: fetch con token devuelve 200 OK
- [ ] El token no está expirado (revisar `exp`)
- [ ] Después del login, el componente principal se renderiza

---

## 🆘 Si nada funciona

Sigue este orden:

1. **Ejecuta diagnóstico completo:** Ver [SCRIPT-DIAGNOSTICO-FRONTEND-LOGIN.md](SCRIPT-DIAGNOSTICO-FRONTEND-LOGIN.md)
2. **Copia el resultado exacto del error**
3. **Compara con los escenarios** (A, B, o C)
4. **Aplica el fix correspondiente**
5. **Si sigue sin funcionar:** Verifica que el backend está corriendo
   ```bash
   curl http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

---

**Última opción:** Limpia todo y reinicia

```bash
# En el backend
cd backend && ./start.sh

# En terminal nueva del frontend
cd frontend-web && npm start

# Limpia cache del navegador
F12 → Application → Clear Storage → Clear All
```

Luego intenta login de nuevo.

