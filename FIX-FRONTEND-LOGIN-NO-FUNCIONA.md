# 🔧 FIX: Frontend No Permite Ingresar Después del Login

## 🔴 Problema

Aunque inicias sesión con **admin** correctamente:
1. ✅ Ves la pantalla de login de "Punto de Venta"
2. ✅ Ingresas usuario y contraseña
3. ✅ El login parece exitoso
4. ❌ **Pero NO te deja ingresar** - se queda en pantalla de login o muestra error 403

## 🔍 Causas Posibles

### Causa 1: Token no se está guardando
```javascript
// El token no se guarda en localStorage después del login
localStorage.getItem('auth_token') → null ❌
```

### Causa 2: Token se guarda pero no se envía
```javascript
// El token se guarda pero no se envía en el Authorization header
Headers: {}  // Sin Authorization ❌
```

### Causa 3: El endpoint de verificación falla
```
GET /api/sucursales/actual → 403 Forbidden ❌
(Frontend intenta verificar sucursal después del login)
```

### Causa 4: LocalStorage está disabled
```
En navegador con localStorage disabled
localStorage.setItem() → Error ❌
```

## ✅ Solución

### Paso 1: Verificar que el token se guarda

Abre **DevTools (F12)** → **Application** → **Local Storage** → `http://localhost:5173`

Deberías ver:
```
Key: auth_token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si **NO ves `auth_token`:**
- El login está fallando
- O hay error al guardar en localStorage
- Ver logs en **Console**

### Paso 2: Verificar que se envía el token

Abre **DevTools (F12)** → **Network** tab

Haz cualquier acción que requiera autenticación (ej: cargar inventario)

Busca el request en la lista → Haz click → pestaña "Headers"

Bajo "Request Headers" deberías ver:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si **NO ves Authorization header:**
- El frontend no está agregando el token
- Necesitas actualizar `api.service.ts`

Si **VES Authorization header pero aún recibes 403:**
- El token es inválido
- El token está expirado
- El usuario no tiene permisos

### Paso 3: Revisar Console por errores

En **DevTools** → **Console** tab

Busca mensajes de error tipo:
- `Error al iniciar sesión`
- `localStorage is not available`
- `Cannot set property auth_token`
- `401 Unauthorized`

## 🛠️ Fix en el Frontend

### Problema: api.service.ts no agrega token correctamente

Si en el Network tab **no ves el Authorization header**, necesitas arreglar el api.service.ts.

**Busca este código (línea ~70):**
```typescript
private buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...options.headers };

  // Agregar token si se requiere autenticación
  if (options.requiresAuth !== false) {
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}
```

**Si NO está ahí, añádelo.**

**Si SÍ está pero no funciona, reemplázalo por:**

```typescript
private buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = { 
    ...DEFAULT_HEADERS, 
    ...options.headers 
  };

  // SIEMPRE agregar token si existe (excepto para login)
  const token = this.getAuthToken();
  if (token) {
    console.log('✅ Token agregado al header:', token.substring(0, 20) + '...');
    headers['Authorization'] = `Bearer ${token}`;
  } else if (options.requiresAuth !== false) {
    console.warn('⚠️ No hay token disponible pero se requiere autenticación');
  }

  return headers;
}
```

### Problema: El logout no limpia correctamente

**Busca el método logout:**
```typescript
const logout = () => {
  setToken(null);
  setUsuario(null);
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_usuario');
  apiService.clearAuthToken();
};
```

**Si NO ves `apiService.clearAuthToken()`, añádelo.**

### Problema: Login no llama setAuthToken

**En el método login (después de guardar en localStorage), verifica:**
```typescript
// Configurar token en apiService
apiService.setAuthToken(newToken);
```

**Si esta línea no está, añádela después de `localStorage.setItem('auth_token', newToken);`**

## 🔨 Solución Completa: Patch para AuthContext.tsx

Si quieres una solución completa, reemplaza la sección de `login` en `AuthContext.tsx` por:

```typescript
const login = async (username: string, password: string) => {
  try {
    console.log('🔑 Intentando login con usuario:', username);
    
    const response = await apiService.post(
      API_ENDPOINTS.LOGIN,
      { username, password },
      { requiresAuth: false }
    );

    if (response.success && response.data) {
      console.log('✅ Login exitoso');
      
      // El backend retorna: { token, usuario, mensaje }
      const { token: newToken, usuario: newUsuario } = response.data as { 
        token: string; 
        usuario: Usuario; 
        mensaje?: string 
      };
      
      if (!newToken) {
        throw new Error('No se recibió token del servidor');
      }
      
      console.log('📦 Token recibido:', newToken.substring(0, 20) + '...');
      
      // Normalizar el rol
      const usuarioNormalizado: Usuario = {
        ...newUsuario,
        rol: newUsuario.rolNombre || newUsuario.rol || '',
      };
      
      // 1. Guardar en estado (React state)
      setToken(newToken);
      setUsuario(usuarioNormalizado);
      console.log('💾 Estado React actualizado');
      
      // 2. Guardar en localStorage
      try {
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_usuario', JSON.stringify(usuarioNormalizado));
        console.log('💾 localStorage actualizado');
      } catch (storageError) {
        console.error('❌ Error guardando en localStorage:', storageError);
      }
      
      // 3. Configurar token en apiService (IMPORTANTE)
      apiService.setAuthToken(newToken);
      console.log('📡 Token configurado en apiService');
      
      console.log('✅ Login completado exitosamente');
    } else {
      console.error('❌ Login fallido:', response.error);
      throw new Error(response.error || 'Error al iniciar sesión');
    }
  } catch (error: any) {
    console.error('❌ Exception durante login:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};
```

## 🧪 Test para Verificar

### En Console (F12) del navegador, ejecuta:

```javascript
// 1. Verificar token en localStorage
console.log('Token en localStorage:', localStorage.getItem('auth_token'));

// 2. Verificar usuario en localStorage
console.log('Usuario:', localStorage.getItem('auth_usuario'));

// 3. Hacer request manual con fetch para verificar headers
fetch('http://localhost:8080/api/sucursales/actual', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Respuesta:', data))
.catch(err => console.error('❌ Error:', err));
```

**Resultados esperados:**

```javascript
// ✅ CORRECTO
Token en localStorage: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Usuario: {"id":1,"username":"admin","nombre":"Administrador",...}
✅ Respuesta: {sucursalId: 1, sucursalNombre: "Sucursal 1", ...}

// ❌ INCORRECTO
Token en localStorage: null
Usuario: null
❌ Error: 403 Forbidden
```

## 📋 Checklist de Debugging

- [ ] DevTools → Local Storage muestra `auth_token`
- [ ] DevTools → Network muestra `Authorization: Bearer ...` header
- [ ] Console no muestra errores tipo `localStorage is not available`
- [ ] El response de login (F12 → Network → /api/auth/login) tiene `token` y `usuario`
- [ ] El fetch manual en Console funciona
- [ ] Después del login, página se carga correctamente

## 🆘 Si sigue sin funcionar

1. **Vacía localStorage:**
   ```javascript
   localStorage.clear()
   ```

2. **Recarga la página:**
   ```javascript
   window.location.reload()
   ```

3. **Intenta login de nuevo**

4. **Si aún no funciona:**
   - Abre Console
   - Copia todos los errores
   - Revisa si dice algo sobre CORS o 403

## 🔗 Documentos relacionados

- `FIX-ERROR-403-JWT-AUTHENTICATION.md` - Entender errores 403
- `DEBUGGING-403-INTERACTIVE.md` - Debugging interactivo
- `frontend-web/src/services/api.service.ts` - Código del servicio
- `frontend-web/src/contexts/AuthContext.tsx` - Contexto de autenticación

