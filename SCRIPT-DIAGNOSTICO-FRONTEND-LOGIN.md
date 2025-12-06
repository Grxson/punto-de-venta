# 🧪 Script de Diagnóstico - Frontend Login

## 📋 Cómo usar

1. Abre el navegador
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Copia y pega el script completo abajo
5. Presiona Enter
6. Analiza los resultados

---

## 🔍 Script de Diagnóstico Completo

```javascript
// ============================================
// 🧪 SCRIPT DE DIAGNÓSTICO - FRONTEND LOGIN
// ============================================

console.clear();
console.log('%c=== DIAGNÓSTICO DE LOGIN ===', 'color: #00ff00; font-size: 16px; font-weight: bold;');

// 1. VERIFICAR LOCALSTORAGE
console.log('\n%c1️⃣ VERIFICAR LOCALSTORAGE', 'color: #0099ff; font-weight: bold;');

const token = localStorage.getItem('auth_token');
const usuario = localStorage.getItem('auth_usuario');

console.log('  • auth_token:', token ? `✅ Presente (${token.length} chars)` : '❌ NO EXISTE');
console.log('  • auth_usuario:', usuario ? `✅ Presente` : '❌ NO EXISTE');

if (token) {
  console.log('  Token preview:', token.substring(0, 50) + '...');
}

if (usuario) {
  try {
    const usuarioData = JSON.parse(usuario);
    console.log('  Usuario data:', {
      id: usuarioData.id,
      username: usuarioData.username,
      nombre: usuarioData.nombre,
      rol: usuarioData.rol || usuarioData.rolNombre
    });
  } catch (e) {
    console.error('  ❌ Error parsing usuario JSON:', e.message);
  }
}

// 2. VERIFICAR TOKEN DECODIFICADO
console.log('\n%c2️⃣ VERIFICAR TOKEN JWT', 'color: #0099ff; font-weight: bold;');

if (token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('  ❌ Token JWT inválido: debe tener 3 partes separadas por "."');
      console.log('  Partes encontradas:', parts.length);
    } else {
      console.log('  ✅ Token JWT tiene formato correcto (3 partes)');
      
      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      console.log('  Payload decodificado:', payload);
      
      // Verificar expiración
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        
        if (expDate > now) {
          console.log('  ✅ Token válido (expira:', expDate.toLocaleString(), ')');
        } else {
          console.error('  ❌ Token EXPIRADO desde:', expDate.toLocaleString());
        }
      }
    }
  } catch (e) {
    console.error('  ❌ Error decodificando token:', e.message);
  }
} else {
  console.log('  ⚠️ No hay token para decodificar');
}

// 3. HACER REQUEST DE PRUEBA
console.log('\n%c3️⃣ HACER REQUEST DE PRUEBA', 'color: #0099ff; font-weight: bold;');

if (token) {
  console.log('  Haciendo: GET /api/sucursales/actual ...');
  
  fetch('http://localhost:8080/api/sucursales/actual', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('  Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('  ✅ ÉXITO - Respuesta:', data);
  })
  .catch(error => {
    console.error('  ❌ ERROR - Request fallido:', error.message);
  });
} else {
  console.log('  ❌ No hay token para hacer request');
}

// 4. VERIFICAR HEADERS EN PRÓXIMA REQUEST
console.log('\n%c4️⃣ VERIFICAR HEADERS EN PRÓXIMA REQUEST', 'color: #0099ff; font-weight: bold;');
console.log('  Abre Network tab (F12 → Network)');
console.log('  Realiza cualquier acción en el frontend');
console.log('  Haz click en el request en la lista');
console.log('  Ve a "Headers" y busca "Authorization"');
console.log('  Debería ver: Authorization: Bearer eyJ...');

// 5. RESUMEN
console.log('\n%c📊 RESUMEN', 'color: #ffaa00; font-weight: bold;');
console.log('  ✅ Pasos para arreglar:');
console.log('    1. Si NO ves token_auth en localStorage → El login está fallando');
console.log('    2. Si SÍ ves token_auth pero 403 en requests → Token inválido/expirado');
console.log('    3. Si SÍ ves token_auth pero sin Authorization header → Bug en api.service.ts');
console.log('    4. Si TODO funciona → El problema está en otra parte');

console.log('\n%c✅ Diagnóstico completado', 'color: #00ff00; font-weight: bold;');
```

---

## 📱 Script Simple (si quieres solo una cosa rápida)

### Ver si token existe:
```javascript
console.log('Token:', localStorage.getItem('auth_token') || '❌ NO EXISTE');
```

### Ver usuario:
```javascript
console.log('Usuario:', localStorage.getItem('auth_usuario') || '❌ NO EXISTE');
```

### Hacer request de prueba:
```javascript
const token = localStorage.getItem('auth_token');
fetch('http://localhost:8080/api/sucursales/actual', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('✅ OK:', d))
.catch(e => console.error('❌ Error:', e.message));
```

### Limpiar localStorage:
```javascript
localStorage.clear();
console.log('✅ localStorage limpiado');
```

---

## 🔍 Interpretación de Resultados

### Escenario 1: Token NO existe en localStorage

```
✅ Presente (0 chars) ❌ NO EXISTE
```

**Causa:** Login no guardó el token

**Solución:**
1. Abre Network tab (F12)
2. Intenta login de nuevo
3. Busca la request POST a `/api/auth/login`
4. Mira el Response
5. ¿Ves `"token": "eyJ..."`?
   - SÍ → El backend devuelve token, pero frontend no lo guarda (bug en api.service.ts)
   - NO → El backend no devuelve token (problema en el endpoint de login)

### Escenario 2: Token existe pero respuesta es 403

```
✅ Presente (123 chars)
...
❌ Status: 403 Forbidden
```

**Causa:** Token inválido, expirado o usuario sin permisos

**Solución:**
1. Verifica que el token es válido:
   ```javascript
   const parts = token.split('.');
   const payload = JSON.parse(atob(parts[1]));
   console.log(payload);
   ```
2. Verifica `exp`: si es menor que ahora, está expirado
3. Intenta login de nuevo

### Escenario 3: Token existe, request OK, pero UI sigue en login

```
✅ Presente (123 chars)
✅ Status: 200 OK
✅ Respuesta: {sucursalId: 1, ...}
❌ Pero la UI sigue en login
```

**Causa:** El frontend recibe los datos pero no renderiza correctamente

**Solución:**
1. El contexto de AuthContext no se está actualizando
2. Revisar el componente que renderiza después del login
3. Puede ser que falta actualizar el estado de `isAuthenticated`

---

## 🛠️ Comandos Útiles

### Decodificar Token Manualmente

```javascript
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const header = JSON.parse(atob(parts[0]));
const payload = JSON.parse(atob(parts[1]));

console.log('Header:', header);
console.log('Payload:', payload);
console.log('¿Es admin?', payload.rol === 'ADMIN');
```

### Verificar Fecha de Expiración

```javascript
const token = localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expDate = new Date(payload.exp * 1000);
console.log('Expira:', expDate.toLocaleString());
console.log('¿Válido?', expDate > new Date() ? '✅ SÍ' : '❌ NO');
```

### Listar todas las cookies y storage

```javascript
console.log('LocalStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  ${key}: ${localStorage.getItem(key).substring(0, 50)}...`);
}

console.log('\nSessionStorage:');
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  console.log(`  ${key}: ${sessionStorage.getItem(key).substring(0, 50)}...`);
}

console.log('\nCookies:', document.cookie || '(vacío)');
```

---

## 📞 Próximos Pasos

Después de ejecutar el script:

1. **Si ves ❌ errores:** Anota el mensaje exacto
2. **Si ves ✅ todo OK pero aún no funciona:** Problema es en componentes React
3. **Si ves 403:** Token problema (ver `FIX-ERROR-403-JWT-AUTHENTICATION.md`)

Usa este diagnóstico para determinar dónde está el problema exacto.

