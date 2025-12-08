# 🔐 FLUJO JWT END-TO-END: De Login a Autenticación

## 1. Diagrama de Secuencia Completo

```
┌──────────────┐                    ┌──────────────┐                 ┌──────────────┐
│   Frontend   │                    │   Backend    │                 │   Browser    │
│   (React)    │                    │  (Spring)    │                 │   Storage    │
└──────────────┘                    └──────────────┘                 └──────────────┘
       │                                   │                              │
       │  1. User clicks "Iniciar Sesión" │                              │
       │────────────────────────────────►  │                              │
       │                                   │                              │
       │  2. POST /api/auth/login          │                              │
       │     { username, password }        │                              │
       ├──────────────────────────────────►│                              │
       │                                   │                              │
       │                          3. Validate credentials                 │
       │                          4. Generate JWT token                  │
       │                          5. Return { token, usuario, ... }      │
       │◄──────────────────────────────────┤                              │
       │                                   │                              │
       │  6. Parse response                │                              │
       │  7. Store token                   │                              │
       │  8. Store usuario                 │                              │
       ├──────────────────────────────────────────────────────────────► Store
       │                                   │                         auth_token
       │                                   │                         auth_usuario
       │                                   │                              │
       │  9. User navigates to /admin      │                              │
       │     (Protected route)             │                              │
       │────────────────────────────────►  │                              │
       │                                   │                              │
       │  10. Retrieve token from storage  │                              │
       ├─────────────────────────────────────────────────────────────► Retrieve
       │                                   │                              │
       │  11. GET /api/inventario/productos│                              │
       │      Authorization: Bearer <JWT>  │                              │
       ├──────────────────────────────────►│                              │
       │                                   │                              │
       │                          12. Verify JWT signature               │
       │                          13. Extract user info                  │
       │                          14. Check permissions                  │
       │                          15. Execute query                      │
       │                          16. Return 200 + data                  │
       │◄──────────────────────────────────┤                              │
       │                                   │                              │
       │  17. Display data in UI           │                              │
       │                                   │                              │
```

---

## 2. Detalles de Cada Paso

### PASO 1-5: Login Request

**Frontend (AuthContext.tsx):**
```typescript
const login = async (username: string, password: string) => {
  try {
    console.log('🔓 AuthContext: Iniciando login para', username);
    
    const response = await api.post('/api/auth/login', {
      username,
      password
    });
    
    if (response.data.token) {
      const token = response.data.token;
      const usuario = response.data.usuario;
      
      // ✅ PASO 7: Guardar en localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_usuario', JSON.stringify(usuario));
      
      console.log('✅ AuthContext: Login exitoso, token recibido');
    }
  } catch (error) {
    console.error('❌ Login falló:', error);
  }
};
```

**Backend (AuthController.java):**
```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
  // 1. Buscar usuario
  Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
  
  // 2. Validar contraseña
  if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
    throw new BadCredentialsException("Contraseña incorrecta");
  }
  
  // 3. Generar JWT
  String token = jwtTokenProvider.generateToken(usuario.getId());
  
  // 4. Devolver response
  return ResponseEntity.ok(new LoginResponse(
    token,
    usuario,
    "Login exitoso"
  ));
}
```

**Respuesta JWT Exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNyIsImlhdCI6MTczMjI...",
  "usuario": {
    "id": 27,
    "username": "admin",
    "nombre": "Administrador",
    "rol": {
      "id": 1,
      "nombre": "ADMIN",
      "activo": true
    },
    "sucursal": { "id": 1, "nombre": "Sucursal Centro" },
    "email": "admin@puntodeventa.com",
    "createdAt": "2025-12-01T10:00:00"
  },
  "mensaje": "Login exitoso"
}
```

---

### PASO 6-8: Normalizar y Guardar

**AuthContext.tsx - Función Nueva:**
```typescript
// Normalizar rol de múltiples formatos
const normalizarRol = (usuario: any): string => {
  // Prioridad: rolNombre > rol.nombre > rol > ''
  if (usuario.rolNombre) return usuario.rolNombre;
  
  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) {
    return usuario.rol.nombre;  // ← CASO: rol es { id, nombre, activo }
  }
  
  if (typeof usuario.rol === 'string') return usuario.rol;
  
  return '';
};

// En login:
const response = await api.post('/api/auth/login', { username, password });

const newUsuario = {
  ...response.data.usuario,
  rol: normalizarRol(response.data.usuario)  // ← Convertir a string
};

setUsuario(newUsuario);
setToken(response.data.token);

// ✅ Guardar en localStorage
localStorage.setItem('auth_token', response.data.token);
localStorage.setItem('auth_usuario', JSON.stringify(newUsuario));
```

**¿Por qué normalizar?**
```
Backend devuelve:
{
  "usuario": {
    "rol": { "id": 1, "nombre": "ADMIN", "activo": true },  ← OBJETO
    "rolNombre": "ADMIN"  ← STRING (alias para compatibilidad)
  }
}

Frontend esperaba:
usuario.rol = "ADMIN"  ← STRING

RESULTADO de no normalizar:
typeof usuario.rol === 'object'  → true
usuario.rol === true  → false (objeto nunca es true)
Rol quedaba sin asignar → permisos incorrectos
```

---

### PASO 9-11: Request Autenticado

**Frontend (api.service.ts):**
```typescript
// Paso 1: Recuperar token del almacenamiento
async buildHeaders(options?: RequestOptions): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Paso 2: Si requiere autenticación, agregar Authorization
  if (options?.requiresAuth !== false) {  // ← DEFAULT: true
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 [API] Authorization header agregado');
    } else {
      console.warn('⚠️  [API] requiresAuth=true pero NO hay token en localStorage');
    }
  }
  
  return headers;
}

// Paso 3: Ejecutar GET request
async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  // ✅ ARREGLO: Pasar explícitamente requiresAuth
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    method: 'GET',
    requiresAuth: options?.requiresAuth !== false ? true : false  // ← SIEMPRE explicitar
  });
}

// Paso 4: Hacer request con headers
const response = await fetch(url, {
  method: 'GET',
  headers: await this.buildHeaders(options),  // ← Headers incluyen Bearer token
  signal: controller.signal
});
```

**Request HTTP en Network:**
```
GET /api/inventario/productos HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyNyIsImlhdCI6...
Content-Type: application/json
```

---

### PASO 12-16: Verificación en Backend

**Backend - JWT Filter (JwtTokenFilter.java):**
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                               HttpServletResponse response, 
                               FilterChain filterChain)
    throws ServletException, IOException {
  
  try {
    // Paso 1: Extraer token del header
    String jwt = extractTokenFromRequest(request);
    
    if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
      // Paso 2: Extraer usuario ID del token
      Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
      
      // Paso 3: Cargar usuario de BD
      Usuario usuario = usuarioRepository.findById(userId)
        .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
      
      // Paso 4: Crear autenticación
      UsernamePasswordAuthenticationToken auth = 
        new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
      
      // Paso 5: Establecer en contexto de Spring Security
      SecurityContextHolder.getContext().setAuthentication(auth);
      
      logger.info("✅ Usuario autenticado: {} (ID: {})", usuario.getUsername(), userId);
    }
  } catch (Exception e) {
    logger.error("❌ Error validando JWT: {}", e.getMessage());
    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o expirado");
    return;
  }
  
  filterChain.doFilter(request, response);
}
```

**Extracción de Token:**
```java
private String extractTokenFromRequest(HttpServletRequest request) {
  String header = request.getHeader("Authorization");
  
  if (header != null && header.startsWith("Bearer ")) {
    return header.substring(7);  // Remove "Bearer "
  }
  
  return null;
}
```

**Validación y Extracción:**
```java
public boolean validateToken(String token) {
  try {
    Jwts.parserBuilder()
      .setSigningKey(key)
      .build()
      .parseClaimsJws(token);
    
    return true;
  } catch (JwtException | IllegalArgumentException e) {
    logger.error("JWT validation failed: {}", e.getMessage());
    return false;
  }
}

public Long getUserIdFromToken(String token) {
  Claims claims = Jwts.parserBuilder()
    .setSigningKey(key)
    .build()
    .parseClaimsJws(token)
    .getBody();
  
  return Long.parseLong(claims.getSubject());  // "27" → 27L
}
```

**Backend - Controller Access:**
```java
@GetMapping("/api/inventario/productos")
public ResponseEntity<List<ProductoDTO>> obtenerProductos() {
  // Spring Security automáticamente inyecta Usuario autenticado
  Authentication auth = SecurityContextHolder.getContext().getAuthentication();
  Usuario usuarioActual = (Usuario) auth.getPrincipal();
  
  logger.info("Usuario {} solicita inventario", usuarioActual.getUsername());
  
  // Obtener productos de BD
  List<ProductoDTO> productos = productoService.obtenerTodos();
  
  return ResponseEntity.ok(productos);  // ✅ 200 OK
}
```

---

## 3. Estados de Autenticación

### ✅ Estado: AUTENTICADO

**Condiciones:**
- Token en localStorage ✅
- Token NO expirado ✅
- Token firma válida ✅
- Usuario existe en BD ✅

**Comportamiento:**
```
Request → buildHeaders() agrega Authorization header
Backend → JwtTokenFilter valida token → SecurityContext establecido
Controller → Acceso permitido
Response → 200 OK + data
```

### ❌ Estado: TOKEN INVÁLIDO

**Síntoma:** Error 401 Unauthorized

**Posibles causas:**
1. Token expirado (max 24 horas)
2. Token firmado incorrectamente
3. Usuario eliminado de BD
4. Clave secreta JWT cambió

**Solución:**
```typescript
// En AuthContext, manejar 401:
if (error.status === 401) {
  console.warn('Token expirado, requiere nuevo login');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_usuario');
  setToken(null);
  setUsuario(null);
  // Redirect a login page
}
```

### ❌ Estado: NO AUTENTICADO

**Síntoma:** Error 403 Forbidden (incluso con token)

**Posibles causas:**
1. `requiresAuth` no pasado (undefined)
2. Token NO guardado en localStorage
3. Authorization header NO formado correctamente

**Checklist:**
```javascript
// En Console (F12):

// 1. ¿Token existe?
console.log('Token:', localStorage.getItem('auth_token') ? '✅' : '❌');

// 2. ¿Usuario existe?
console.log('Usuario:', localStorage.getItem('auth_usuario') ? '✅' : '❌');

// 3. ¿Token es válido?
const token = localStorage.getItem('auth_token');
const parts = token?.split('.') || [];
console.log('Partes del token:', parts.length === 3 ? '✅ (válido)' : '❌ (inválido)');

// 4. ¿Header está bien formado?
const authHeader = `Bearer ${token}`;
console.log('Header:', authHeader.substring(0, 20) + '...');
```

---

## 4. Flujo de Error y Recovery

### Escenario: Token Expirado

```
Usuario hace request después de 24+ horas:
1. Frontend: GET /api/data with Authorization: Bearer <24h token>
2. Backend: JwtTokenProvider.validateToken() → false
3. Backend: Response 401 Unauthorized + "Token expirado"
4. Frontend: AuthContext recibe 401
5. Frontend: Limpia localStorage
6. Frontend: Redirige a /login
7. Usuario: Vuelve a hacer login
8. Ciclo reinicia con nuevo token ✅
```

### Escenario: Usuario Sin Token

```
Usuario intenta acceder a ruta protegida sin login:
1. Frontend: Verifica localStorage.getItem('auth_token') → null
2. Frontend: Check requiresAuth = true
3. Frontend: NO agrega Authorization header
4. Backend: Request sin header Authorization
5. Backend: JwtTokenFilter no encuentra token
6. Backend: Response 401 Unauthorized
7. Frontend: Redirige a /login
```

---

## 5. Verificación Paso a Paso

### En Navegador (F12 → Console)

```javascript
// ========== PASO 1: LOGIN ==========
// Usuario hace login en admin/admin123

// ========== PASO 2: VERIFICAR TOKEN ==========
// En Console, ejecutar:
localStorage.getItem('auth_token')
// Debe mostrar: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyNyIsImlhdCI6..."

// ========== PASO 3: VERIFICAR USUARIO ==========
JSON.parse(localStorage.getItem('auth_usuario'))
// Debe mostrar: { id: 27, username: "admin", rol: "ADMIN", ... }

// ========== PASO 4: VERIFICAR ROL NORMALIZADO ==========
const usuario = JSON.parse(localStorage.getItem('auth_usuario'));
console.log('Rol:', usuario.rol);
// Debe ser STRING: "ADMIN" (NO objeto)

// ========== PASO 5: HACER REQUEST AUTENTICADO ==========
// Navegar a Admin page
// En Network tab (F12 → Network):
// GET /api/inventario/productos
// Buscar header: Authorization: Bearer eyJhbGciOi...
// Debe estar PRESENTE (no vacío)

// ========== PASO 6: VERIFICAR RESPUESTA ==========
// Status debe ser 200 (no 403)
// Response debe contener productos
```

### En Backend (Logs)

```bash
# Ejecutar en terminal
tail -f backend.log

# Buscar logs de login:
# ✅ Usuario autenticado: admin (ID: 27)
# ✅ POST /api/auth/login responded with 200

# Buscar logs de requests subsecuentes:
# ✅ Usuario admin solicita inventario
# ✅ GET /api/inventario/productos responded with 200
```

---

## 6. Resumen de Cambios

| Componente | Cambio | Razón |
|-----------|--------|-------|
| **AuthContext** | Normalizar rol (string \| object) → string | Backend devuelve objeto |
| **api.service** | requiresAuth: default true en todos los métodos | Headers no se enviaban |
| **SucursalContextFilter** | Proteger lazy-loaded fields con try-catch | Error de sesión Hibernate |
| **JwtTokenFilter** | Validar token en cada request | Verificar autenticación |

---

## ✅ Checklist de Verificación

- [ ] Token se guarda en localStorage después del login
- [ ] Rol se normaliza a string (no objeto)
- [ ] Authorization header aparece en Network tab
- [ ] Requests a `/api/*` devuelven 200 (no 403)
- [ ] Admin page carga sin errores
- [ ] Tablas de reportes muestran datos
- [ ] No hay errores en Console (F12)
- [ ] Logs del backend muestran "Usuario autenticado"

---

**¡JWT Flow Completamente Explicado!** 🔐

Si algo no funciona, usa este diagrama para identificar dónde está el problema.

