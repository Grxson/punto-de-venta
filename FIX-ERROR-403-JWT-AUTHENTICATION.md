# 🔐 FIX: Error 403 Forbidden - Autenticación JWT

## 🔴 Problema

Recibís **403 Forbidden** al acceder a endpoints como:
- ❌ `GET /api/inventario/productos`
- ❌ `GET /api/ventas/resumen/metod`
- ❌ `GET /api/sucursales/**`

Incluso aunque hayas iniciado sesión como **admin**, obtienes:

```json
{
  "timestamp": "Sat Dec 06 11:35:46 CST 2025",
  "status": 403,
  "error": "Forbidden",
  "path": "/api/inventario/productos"
}
```

## ✅ Solución

El error 403 significa que **no estás enviando el JWT token en los headers de la request**.

### Paso 1: Hacer Login para obtener token

**POST** `http://localhost:8080/api/auth/login`

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "ADMIN",
    "sucursalId": 1
  },
  "mensaje": "Login exitoso"
}
```

**Guarda el token** (lo necesitarás en los próximos requests)

### Paso 2: Usar el token en todos los requests protegidos

Para **TODOS** los endpoints **EXCEPTO** `/api/auth/login`, debes enviar el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm...
```

### Con cURL

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

echo "Token obtenido: $TOKEN"

# 2. Usar el token en requests protegidos
curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 3. Acceder a sucursales
curl -X GET http://localhost:8080/api/sucursales/actual \
  -H "Authorization: Bearer $TOKEN"
```

### Con Postman

1. **Crear variable de entorno** para almacenar el token:
   - Settings → Variables → Add `token`

2. **Endpoint de Login:**
   - URL: `POST http://localhost:8080/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - En la pestaña "Tests", agregar:
     ```javascript
     if (pm.response.code === 200) {
       const responseJson = pm.response.json();
       pm.environment.set("token", responseJson.token);
     }
     ```

3. **Endpoints protegidos:**
   - Header: `Authorization: Bearer {{token}}`
   - Ejemplo: `GET http://localhost:8080/api/inventario/productos`
   - Automáticamente usará el token almacenado

### Con Axios (JavaScript/TypeScript)

```typescript
// 1. Login
const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
  username: 'admin',
  password: 'admin123'
});

const token = loginResponse.data.token;

// 2. Guardar token en localStorage
localStorage.setItem('auth_token', token);

// 3. Hacer requests con token
const response = await axios.get('http://localhost:8080/api/inventario/productos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Con fetch (JavaScript)

```javascript
// 1. Login
const loginRes = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginRes.json();

// 2. Usar token
const dataRes = await fetch('http://localhost:8080/api/inventario/productos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await dataRes.json();
console.log(data);
```

## 📋 Endpoints Públicos (sin token necesario)

Estos endpoints **NO** requieren token JWT:

```
✅ POST   /api/auth/login
✅ POST   /api/auth/register
✅ GET    /api/auth/**
✅ GET    /api/categorias/**
✅ GET    /actuator/**
✅ GET    /swagger-ui.html
✅ GET    /v3/api-docs/**
✅ GET    /h2-console/**
✅ GET    /error
```

## 📋 Endpoints Protegidos (requieren token)

Todos los demás endpoints requieren token JWT:

```
❌ GET    /api/inventario/productos           → Requiere token
❌ GET    /api/ventas/**                       → Requiere token
❌ GET    /api/gastos/**                       → Requiere token
❌ GET    /api/sucursales/**                   → Requiere token (nuevos endpoints)
❌ POST   /api/sucursales/cambiar/{id}         → Requiere token (nuevo endpoint)
❌ POST   /api/productos/**                    → Requiere token
```

## 🔧 Solución rápida en Frontend React

```typescript
import axios from 'axios';

// Crear instancia de axios con interceptor
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todos los requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
async function getInventario() {
  try {
    const response = await apiClient.get('/api/inventario/productos');
    console.log(response.data);
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Token inválido o expirado. Inicia sesión de nuevo.');
      // Redirigir a login
      window.location.href = '/login';
    }
  }
}
```

## 🛠️ Verificación del Token

Para verificar que tu token es válido, puedes usar:

```bash
# Decodificar JWT sin validar (solo para inspeccionar)
# Usando jq y base64 (Linux/Mac)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm..."

# Extraer y decodificar payload
echo $TOKEN | cut -d. -f2 | base64 -d | jq .
```

**Output esperado:**
```json
{
  "sub": "admin",
  "usuarioId": 1,
  "rol": "ADMIN",
  "iat": 1733521546,
  "exp": 1733607946
}
```

## ❌ Errores Comunes

### Error: "Sesión caducada, inicia sesión de nuevo"

**Causa:** Token expirado o inválido

**Solución:**
```bash
# Vuelve a hacer login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')
```

### Error: 403 sin header Authorization

**Causa:** No estás enviando el token en los headers

**Solución:**
```bash
# ❌ INCORRECTO (sin header)
curl http://localhost:8080/api/inventario/productos

# ✅ CORRECTO (con header)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/inventario/productos
```

### Error: "Bearer token format is incorrect"

**Causa:** El header no tiene el formato correcto

**Solución:**
```bash
# ❌ INCORRECTO
Authorization: $TOKEN
Authorization: token=$TOKEN
Authorization: JWT $TOKEN

# ✅ CORRECTO
Authorization: Bearer $TOKEN
```

## 📚 Referencia de Headers

| Header | Valor |
|--------|-------|
| `Authorization` | `Bearer eyJhbGciOiJIUzI1NiI...` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |

## 🎯 Checklist

- [ ] He hecho login en `/api/auth/login`
- [ ] Tengo un token JWT válido
- [ ] Estoy enviando `Authorization: Bearer <token>` en los headers
- [ ] El token no está expirado
- [ ] El usuario tiene permisos para el endpoint
- [ ] El endpoint está protegido (no es un endpoint público)

## 🔗 Documentación relacionada

- `backend/API-ENDPOINTS.md` - Todos los endpoints disponibles
- `backend/INVENTARIO-API.md` - Endpoints de inventario con ejemplos
- `GUIA-RAPIDA-MULTI-SUCURSAL.md` - Testing de nuevos endpoints multi-sucursal

