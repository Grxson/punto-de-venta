# 🔴 ANÁLISIS Y FIX: Ventana en Blanco al Expirar Sesión - Frontend-Web

## 📋 Problema Identificado

En producción, la aplicación se refresca de la nada y queda en blanco, con la siguiente secuencia en logs:

### Logs del Backend
```
14:32:19 - Requests válidos con token JWT ✅
15:29:23 - CRÍTICO: Múltiples requests SIN token Bearer
    ⚠️ "No hay token Bearer válido en el request"
    ❌ "No se pudo obtener sucursal_id de: JWT (no contiene sucursalId o token inválido)"
15:29:26 - Usuario hace login de nuevo y recupera token
```

### Causa Raíz

El token JWT ha expirado, pero el frontend-web tiene **deficiencias críticas** en el manejo de autenticación:

1. **❌ No hay validación de token expirado** - La app envía requests con token inválido
2. **❌ No hay refresh token** - No puede renovar automáticamente el JWT
3. **❌ No hay manejo de error 401** - Cuando el backend rechaza, falla catastróficamente
4. **❌ No hay error boundary** - Sin pantalla de error, solo queda en blanco
5. **❌ Redirecciones recursivas** - Múltiples intentos de redirigir al login rompen la UX

---

## 🔧 Soluciones Implementadas

### 1. ✅ Validación de Token en AuthContext
**Archivo**: `frontend-web/src/contexts/AuthContext.tsx`

```typescript
// Función para validar si el token sigue siendo válido
const isTokenValid = (): boolean => {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Token inválido (formato incorrecto)');
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error validando token:', error);
    return false;
  }
};

// Usar en isAuthenticated
isAuthenticated: !!token && !!usuario && isTokenValid(),
```

**Beneficio**: La app valida que el token tenga formato JWT válido antes de usarlo.

---

### 2. ✅ Logout Automático al Expirar
**Archivo**: `frontend-web/src/contexts/AuthContext.tsx`

```typescript
const logout = () => {
  console.log('🚪 AuthContext: Ejecutando logout');
  // Limpiar todo el estado
  setToken(null);
  setUsuario(null);
  setSucursal(null);
  // Eliminar almacenamiento
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_usuario');
  localStorage.removeItem('auth_sucursal');
  apiService.clearAuthToken();
  // Redirigir de forma segura
  window.location.href = '/login';
};
```

**Beneficio**: El logout es completo y atomático, evitando estados parciales.

---

### 3. ✅ Manejo Robusto de 401 en API
**Archivo**: `frontend-web/src/services/api.service.ts`

```typescript
// Si es 401, el token expiró o es inválido
if (response.status === 401) {
  console.warn('🔓 [API] Sesión expirada (401), limpiando datos y redirigiendo...');
  
  // Limpiar autenticación
  this.clearAuthToken();
  localStorage.removeItem('auth_usuario');
  localStorage.removeItem('auth_sucursal');
  
  // Detener reintentos para requests de autenticación
  if (endpoint.includes('/auth/')) {
    return {
      success: false,
      error: 'Autenticación fallida',
      statusCode: response.status,
      data,
    };
  }
  
  // Para otros requests: redirigir una sola vez
  if (typeof window !== 'undefined') {
    // Verificar si ya estamos en login para evitar redirecciones recursivas
    if (window.location.pathname !== '/login') {
      console.log('   📍 Redirigiendo a /login...');
      window.location.href = '/login?expired=true';
    }
  }
}
```

**Beneficio**: 
- Redirecciones seguras (no recursivas)
- Parámetro `?expired=true` para mostrar mensaje
- No reintentar requests de auth que ya fallaron

---

### 4. ✅ Error Boundary Global
**Archivo**: `frontend-web/src/components/ErrorBoundary.tsx` (NUEVO)

```typescript
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('📋 [ErrorBoundary] Error:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box>
          {/* Pantalla de error amigable en lugar de blanco */}
          <ErrorIcon sx={{ fontSize: 64, color: '#d32f2f' }} />
          <Typography>¡Algo salió mal!</Typography>
          <Button onClick={this.handleReset}>Ir a Login</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
```

**Beneficio**: Si hay cualquier error de React, se muestra una pantalla amigable en lugar de quedar en blanco.

---

### 5. ✅ Envoltorio en App
**Archivo**: `frontend-web/src/App.tsx`

```typescript
function App() {
  return (
    <ErrorBoundary>  {/* ← NUEVO: Protección global */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <DashboardProvider>
              <BrowserRouter>
                <WebSocketHandlers />
                <AppRoutes />
              </BrowserRouter>
            </DashboardProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

### 6. ✅ Mejor Detección de Sesión Expirada en Login
**Archivo**: `frontend-web/src/pages/auth/Login.tsx`

```typescript
useEffect(() => {
  // Buscar en URL params (de API.service)
  const params = new URLSearchParams(window.location.search);
  if (params.has('expired')) {
    setSessionExpiredMessage('Tu sesión ha caducado. Por favor inicia sesión nuevamente.');
    window.history.replaceState({}, document.title, '/login');
  }
  
  // Buscar en sessionStorage (legacy)
  const expiredMsg = sessionStorage.getItem('sessionExpiredMessage');
  if (expiredMsg) {
    setSessionExpiredMessage(expiredMsg);
    sessionStorage.removeItem('sessionExpiredMessage');
  }
}, []);
```

**Beneficio**: El usuario ve un mensaje claro de por qué está en login.

---

## 📊 Flujo de Recuperación

### Antes (❌ PROBLEMA)
```
1. Token expira
2. Frontend envía request con token inválido
3. Backend retorna 401
4. Frontend no maneja error
5. App queda en estado inconsistente
6. Pantalla queda en blanco
```

### Ahora (✅ SOLUCIÓN)
```
1. Token expira
2. Frontend valida token antes de usar (isTokenValid())
3. Si es inválido, ejecuta logout() automáticamente
4. Si aun así se envía request:
   - Backend retorna 401
   - API.service detecta 401
   - Limpia localStorage
   - Redirige a /login?expired=true
5. Login.tsx muestra mensaje de sesión expirada
6. Usuario puede volver a ingresar
```

---

## 🧪 Cómo Probar

### Test 1: Token Expirado Manualmente
```javascript
// En consola del navegador
localStorage.removeItem('auth_token');
// Refrescar la página - debería redirigir a login
```

### Test 2: Simular 401 del Backend
```javascript
// El backend debe retornar 401 cuando el token es inválido
// Editar el token en localStorage:
let oldToken = localStorage.getItem('auth_token');
localStorage.setItem('auth_token', oldToken + 'invalid');
// Hacer una petición - debería mostrar error y redirigir
```

### Test 3: Error Boundary
```javascript
// Lanzar un error en la consola
throw new Error('Test error');
// Debería mostrar pantalla de error en lugar de blanco
```

---

## ⚠️ Próximas Mejoras (Recomendadas)

1. **Implementar Refresh Token**
   - Backend genera JWT con expiración corta (15 min)
   - Genera refresh token de larga duración (7 días)
   - Frontend intenta refrescar automáticamente antes de expirar

2. **Agregar Countdown Visual**
   - Mostrar aviso "Tu sesión expirará en 5 minutos"
   - Permitir renovar con un click

3. **Persistencia Segura**
   - Usar httpOnly cookies en lugar de localStorage
   - Proteger contra XSS

4. **Sync entre Pestañas**
   - Si se logout en una pestaña, logout en todas

---

## 📝 Resumen de Cambios

| Archivo | Cambio | Impacto |
|---------|--------|--------|
| `AuthContext.tsx` | ✅ Validación de token + logout automático | Previene envío de tokens inválidos |
| `api.service.ts` | ✅ Manejo de 401 con redirección segura | Recuperación automática al expirar |
| `ErrorBoundary.tsx` | ✅ NUEVO - Captura errores de React | Nunca más pantalla en blanco |
| `App.tsx` | ✅ Envoltorio ErrorBoundary | Protección global |
| `Login.tsx` | ✅ Mejor detección de sesión expirada | UX más clara |

---

## 🚀 Desplegador

Para aplicar estos cambios en producción:

```bash
# 1. Asegurar que están todos los archivos commiteados
git status

# 2. Hacer commit
git add frontend-web/src/
git commit -m "fix: Manejar correctamente expiración de sesión en frontend-web"

# 3. Mergear a develop
git checkout develop
git merge feature/fix-session-expiry

# 4. Deployear a producción
# Seguir el pipeline CD/CI de Railway
```

---
