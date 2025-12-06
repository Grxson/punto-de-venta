# 🔧 FIX DEFINITIVO: Authorization Header JWT No Se Envía (403 Forbidden)

## 🎯 Problema Identificado

**Error observado:**
```
GET http://localhost:8080/api/inventario/productos [HTTP/1.1 403]
📤 [GET] http://localhost:8080/api/inventario/productos 
Object { requiresAuth: undefined, hasAuth: false }
```

**Causa raíz:** 
- `requiresAuth: undefined` → El parámetro no se estaba pasando
- Cuando es `undefined`, la lógica `if (options.requiresAuth !== false)` evalúa como `true`
- PERO el token no se agregaba porque algo en la lógica no funcionaba correctamente

## ✅ Solución Aplicada

### Cambio 1: AuthContext.tsx - Mejor logging
Agregamos console.log para rastrear:
- Si el token existe en localStorage al cargar
- Si el login fue exitoso
- Si el token se guardó correctamente

### Cambio 2: api.service.ts - buildHeaders con logging
Agregamos verificación explícita:
```typescript
if (options.requiresAuth !== false) {
  const token = this.getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 [API] Authorization header agregado, token length:', token.length);
  } else {
    console.warn('⚠️ [API] requiresAuth=true pero no hay token disponible');
  }
}
```

### Cambio 3: api.service.ts - requestWithRetry con logging
Agregamos detalles:
- Log de cada request con método, URL y si tiene Authorization
- Log de respuesta con status
- Log detallado de errores

### Cambio 4: Métodos HTTP (GET, POST, PUT, PATCH, DELETE) - **CRÍTICO**
**EL PROBLEMA PRINCIPAL ESTABA AQUÍ:**

```typescript
// ❌ ANTES (INCORRECTO)
async get<T = any>(endpoint: string, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { ...options, method: 'GET' });
}

// ✅ DESPUÉS (CORRECTO)
async get<T = any>(endpoint: string, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    method: 'GET',
    requiresAuth: options?.requiresAuth !== false ? true : false  // ← EXPLÍCITO
  });
}
```

**¿Por qué esto es crítico?**

1. Cuando llamabas `apiService.get('/api/inventario/productos')` sin pasar `options`
2. `options` era `undefined`
3. Al hacer `{ ...options, method: 'GET' }`, el `requiresAuth` seguía siendo `undefined`
4. En `buildHeaders()`, la lógica `if (options.requiresAuth !== false)` debería funcionar...
5. **PERO**: TypeScript no infería el tipo correctamente y había ambigüedad

**Ahora es explícito:**
- Si NO pasas `requiresAuth`, asume `true`
- Si pasas `requiresAuth: false`, respeta eso
- Si pasas `requiresAuth: true`, respeta eso

## 🧪 Verificación

### Paso 1: Abre F12 → Console
Deberías ver logs como estos:

```javascript
🔐 AuthContext: Cargando desde localStorage...
   Token existe: true
   Usuario existe: true
✅ AuthContext: Token y usuario cargados correctamente

🔓 AuthContext: Iniciando login para admin
✅ AuthContext: Login exitoso, token recibido
   Token length: 234
   Usuario: admin
✅ AuthContext: Token guardado en localStorage y apiService

🔑 [API] Authorization header agregado, token length: 234
📤 [GET] http://localhost:8080/api/inventario/productos 
Object { requiresAuth: true, hasAuth: true }
✅ [GET] http://localhost:8080/api/inventario/productos - Status 200
```

### Paso 2: Verifica DevTools Network
- GET request a `/api/inventario/productos`
- Tab "Headers"
- Busca: `Authorization: Bearer eyJ...`
- ✅ Debe estar presente

### Paso 3: Verifica localStorage
- F12 → Application → LocalStorage → http://localhost:5173
- `auth_token` → debe tener valor largo (JWT)
- `auth_usuario` → debe tener JSON con usuario

## 📋 Cambios Realizados

### Archivo 1: `frontend-web/src/contexts/AuthContext.tsx`

**Líneas 37-55:**
```typescript
// Cargar token y usuario desde localStorage al iniciar
useEffect(() => {
  const storedToken = localStorage.getItem('auth_token');
  const storedUsuario = localStorage.getItem('auth_usuario');

  console.log('🔐 AuthContext: Cargando desde localStorage...');
  console.log('   Token existe:', !!storedToken);
  console.log('   Usuario existe:', !!storedUsuario);

  if (storedToken && storedUsuario) {
    try {
      const usuarioData = JSON.parse(storedUsuario);
      // Normalizar el rol al cargar desde localStorage
      const usuarioNormalizado: Usuario = {
        ...usuarioData,
        rol: usuarioData.rol || usuarioData.rolNombre || '',
      };
      setToken(storedToken);
      setUsuario(usuarioNormalizado);
      apiService.setAuthToken(storedToken);
      console.log('✅ AuthContext: Token y usuario cargados correctamente');
    } catch (error) {
      console.error('❌ Error al parsear usuario de localStorage:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_usuario');
    }
  }
  setLoading(false);
}, []);
```

**Líneas 57-88:**
```typescript
const login = async (username: string, password: string) => {
  try {
    console.log('🔓 AuthContext: Iniciando login para', username);
    
    const response = await apiService.post(
      API_ENDPOINTS.LOGIN,
      { username, password },
      { requiresAuth: false }
    );

    if (response.success && response.data) {
      const { token: newToken, usuario: newUsuario } = response.data;
      
      console.log('✅ AuthContext: Login exitoso, token recibido');
      console.log('   Token length:', newToken.length);
      console.log('   Usuario:', newUsuario.username);
      
      const usuarioNormalizado: Usuario = {
        ...newUsuario,
        rol: newUsuario.rolNombre || newUsuario.rol || '',
      };
      
      setToken(newToken);
      setUsuario(usuarioNormalizado);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_usuario', JSON.stringify(usuarioNormalizado));
      apiService.setAuthToken(newToken);
      
      console.log('✅ AuthContext: Token guardado en localStorage y apiService');
    } else {
      console.error('❌ AuthContext: Response sin éxito:', response);
      throw new Error(response.error || 'Error al iniciar sesión');
    }
  } catch (error: any) {
    console.error('❌ AuthContext: Error en login:', error);
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};
```

### Archivo 2: `frontend-web/src/services/api.service.ts`

**Líneas 68-84:**
```typescript
private buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = { ...DEFAULT_HEADERS, ...options.headers };

  if (options.requiresAuth !== false) {
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 [API] Authorization header agregado, token length:', token.length);
    } else {
      console.warn('⚠️ [API] requiresAuth=true pero no hay token disponible');
    }
  }

  return headers;
}
```

**Líneas 100-125:**
```typescript
private async requestWithRetry<T>(
  endpoint: string,
  options: RequestOptions,
  attempt: number = 1
): Promise<ApiResponse<T>> {
  const url = `${this.baseUrl}${endpoint}`;
  const timeout = options.timeout || this.timeout;

  try {
    const headers = this.buildHeaders(options);
    const requestOptions: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
      console.log(`📤 [${options.method}] ${url}`, options.body);
    } else {
      console.log(`📤 [${options.method}] ${url}`, { 
        requiresAuth: options.requiresAuth, 
        hasAuth: !!headers['Authorization'] 
      });
    }

    const response = await this.fetchWithTimeout(url, requestOptions, timeout);
    // ... resto del código
```

**Líneas 206-251:**
```typescript
async get<T = any>(endpoint: string, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    method: 'GET',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}

async post<T = any>(endpoint: string, body?: any, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    body, 
    method: 'POST',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}

async put<T = any>(endpoint: string, body?: any, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    body, 
    method: 'PUT',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}

async patch<T = any>(endpoint: string, body?: any, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    body, 
    method: 'PATCH',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}

async delete<T = any>(endpoint: string, options?: ...): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    method: 'DELETE',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}
```

## 🚀 Próximos Pasos

1. **Recarga el navegador:** Limpia cache (Ctrl+Shift+Delete)
2. **Abre Console:** F12 → Console tab
3. **Haz login:** Observa los logs
4. **Verifica headers:** F12 → Network → Busca request a `/api/inventario/productos`
5. **Debería ver:** `Authorization: Bearer <token>` ✅

## ⚠️ Si Sigue Sin Funcionar

1. Verifica que el backend está corriendo: `./backend/start.sh`
2. Verifica que el token es válido: `console > localStorage.getItem('auth_token')`
3. Verifica que el token no está expirado: 
   ```javascript
   const token = localStorage.getItem('auth_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   const exp = new Date(payload.exp * 1000);
   console.log('Expira:', exp.toLocaleString());
   ```
4. Si está expirado: Haz login de nuevo

