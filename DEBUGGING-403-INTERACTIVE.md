# 🆘 DEBUGGING 403 FORBIDDEN - Guía Interactiva

## 🎯 Diagnóstico Rápido

Si recibís **403 Forbidden**, sigue este árbol de decisión:

```
¿Recibís 403?
│
├─→ ¿Hiciste login en /api/auth/login?
│   │
│   ├─→ NO: Haz login primero (ver Paso 1)
│   │
│   └─→ SÍ: ¿Guardaste el token?
│       │
│       ├─→ NO: Copia el token del response
│       │
│       └─→ SÍ: ¿Estás enviando Authorization header?
│           │
│           ├─→ NO: Agrega header "Authorization: Bearer {token}" (ver Paso 2)
│           │
│           └─→ SÍ: ¿Es el formato correcto?
│               │
│               ├─→ NO: Usa "Authorization: Bearer {token}" exactamente
│               │
│               └─→ SÍ: ¿El token está expirado?
│                   │
│                   ├─→ SÍ: Haz login de nuevo
│                   │
│                   └─→ NO: Contacta al desarrollador
```

---

## 📍 Paso 1: Verificar Login

### ✅ Lo primero es login

```bash
# Request
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response esperada (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "ADMIN"
  }
}

# Response si falla (401)
{
  "timestamp": "...",
  "status": 401,
  "error": "Unauthorized",
  "message": "Usuario o contraseña incorrecta"
}
```

**Si falla:**
- ❌ Verifica username/password correcto
- ❌ Verifica que el usuario existe en la BD
- ❌ Verifica que el usuario está ACTIVO (columna `activo = true`)

**Si funciona:**
- ✅ Copia el `token` (la parte larga de texto)

---

## 📍 Paso 2: Verificar formato del header

### ❌ Formatos INCORRECTOS

```bash
# INCORRECTO: Sin "Bearer"
curl -H "Authorization: eyJhbGciOiJIUzI1NiI..." http://localhost:8080/api/inventario/productos

# INCORRECTO: Con "JWT"
curl -H "Authorization: JWT eyJhbGciOiJIUzI1NiI..." http://localhost:8080/api/inventario/productos

# INCORRECTO: Con "Token"
curl -H "Authorization: Token eyJhbGciOiJIUzI1NiI..." http://localhost:8080/api/inventario/productos

# INCORRECTO: Sin espacio
curl -H "Authorization: Bearerey..." http://localhost:8080/api/inventario/productos

# INCORRECTO: Sin comillas
curl -H Authorization: Bearer eyJhbGciOiJIUzI1NiI... http://localhost:8080/api/inventario/productos
```

### ✅ Formato CORRECTO

```bash
# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar en request
curl -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Resultado esperado
[
  {
    "id": 1,
    "nombre": "Producto 1",
    ...
  }
]
```

---

## 📍 Paso 3: Verificar que el token NO está expirado

### Decodificar JWT

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzdWFyaW9JZCI6MSwiPGK6IkFETUlOIiwiaWF0IjoxNzMzNTIxNTQ2LCJleHAiOjE3MzM2MDc5NDZ9.XXX"

# Método 1: Con jq y base64 (Linux/Mac)
echo $TOKEN | cut -d. -f2 | base64 -d | jq .

# Método 2: Usar https://jwt.io en el navegador
# 1. Copia el token
# 2. Ve a https://jwt.io
# 3. Pega el token en "Encoded"
# 4. En "Decoded" verás el payload con "exp" (fecha expiración)
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

**Analizar expiration:**
```bash
# Si exp: 1733607946
# Convertir a fecha legible
date -d @1733607946

# Output
Sat Dec  6 13:32:26 CST 2025  ← Si es futuro, es válido
                              ← Si es pasado, está expirado
```

**Si está expirado:**
- Haz login nuevamente para obtener un token fresco

---

## 📍 Paso 4: Verificar respuesta del servidor

### Mirar detalles del error 403

```bash
# Verbose mode para ver headers y body
curl -v -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN"

# Output esperado en headers
> GET /api/inventario/productos HTTP/1.1
> Host: localhost:8080
> Authorization: Bearer eyJhbGciOiJIUzI1NiI...
> Content-Type: application/json
>
< HTTP/1.1 200 OK
< Content-Type: application/json
```

**Si ves 403:**
```
< HTTP/1.1 403 Forbidden
< Content-Type: application/json

{
  "timestamp": "...",
  "status": 403,
  "error": "Forbidden",
  "path": "/api/inventario/productos"
}
```

**Posibles causas:**
1. Token no enviado
2. Token expirado
3. Token inválido
4. Usuario no tiene permisos

---

## 🧪 Test Completo paso a paso

### Script bash completo

```bash
#!/bin/bash

echo "=== STEP 1: LOGIN ==="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ ERROR: No se pudo obtener token"
  exit 1
fi

echo ""
echo "=== STEP 2: VERIFY TOKEN FORMAT ==="
echo "Token format check:"
echo "  Length: ${#TOKEN}"
echo "  Parts: $(echo $TOKEN | tr '.' '\n' | wc -l) (debe ser 3)"

echo ""
echo "=== STEP 3: DECODE TOKEN ==="
PAYLOAD=$(echo $TOKEN | cut -d. -f2)
echo "Decoded payload:"
echo $PAYLOAD | base64 -d | jq .

echo ""
echo "=== STEP 4: TEST WITH TOKEN ==="
curl -v -X GET http://localhost:8080/api/inventario/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "✅ Test completado"
```

### Ejecutar:

```bash
bash test-auth.sh
```

---

## 🔍 Verificar en el navegador (DevTools)

### Firefox

1. Abre DevTools (F12)
2. Ve a Network tab
3. Realiza la request que está fallando
4. Haz click en la request
5. Ve a la pestaña "Headers"
6. Bajo "Request Headers" verifica:
   - ✅ `Authorization: Bearer eyJhbGciOiJIUzI1NiI...`
   - ✅ `Content-Type: application/json`
7. En "Response Headers" verifica:
   - ❌ Si Status es 403, verás: `< 403 Forbidden`
   - ✅ Si Status es 200, verás: `< 200 OK`

### Chrome

1. Abre DevTools (Ctrl+Shift+I)
2. Ve a Network tab
3. Realiza la request
4. Haz click en la request
5. Ve a "Headers"
6. Scroll a "Request Headers"
7. Busca `Authorization` header

---

## 🛠️ Solución por framework

### React (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token agregado al request');
  } else {
    console.warn('⚠️ No hay token almacenado');
  }
  return config;
});

// Usar
api.get('/api/inventario/productos')
  .then(res => console.log('✅ Datos:', res.data))
  .catch(err => {
    if (err.response?.status === 403) {
      console.error('❌ 403 Forbidden - Token inválido o no enviado');
    }
  });
```

### Vue

```javascript
import axios from 'axios'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### React Native

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Tabla de Diagnosis

| Síntoma | Causa | Solución |
|---------|-------|----------|
| 403 Forbidden | No hay token | Haz login |
| 403 Forbidden | Token expirado | Haz login de nuevo |
| 403 Forbidden | Formato incorrecto | Usa `Authorization: Bearer {token}` |
| 401 Unauthorized | Credenciales incorrectas | Verifica usuario/contraseña |
| 404 Not Found | Endpoint no existe | Verifica URL |
| 500 Internal Server Error | Error en servidor | Ver logs del servidor |

---

## 📞 Contacto si sigue sin funcionar

Si después de seguir estos pasos **sigue recibiendo 403**:

1. **Copia los logs del servidor:**
   ```bash
   cd backend
   tail -100 nohup.out  # o donde estés ejecutando
   ```

2. **Verifica la BD:**
   ```sql
   SELECT * FROM usuarios WHERE username = 'admin';
   -- Verifica que:
   -- - exista el usuario
   -- - activo = true
   -- - rol_id apunte a un rol válido
   ```

3. **Reinicia la aplicación:**
   ```bash
   ./start.sh
   ```

4. **Intenta login nuevamente**

