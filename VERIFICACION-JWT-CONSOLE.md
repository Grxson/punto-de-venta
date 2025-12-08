# 🧪 Script de Verificación - Pega en Console (F12)

```javascript
// ===== 1. Verificar Token =====
console.log('=== VERIFICACIÓN DE TOKEN ===');
const token = localStorage.getItem('auth_token');
console.log('1. Token en localStorage:', !!token);
console.log('   Length:', token?.length);

// ===== 2. Verificar Usuario =====
const usuario = JSON.parse(localStorage.getItem('auth_usuario') || '{}');
console.log('2. Usuario en localStorage:', usuario?.username);
console.log('   Rol:', usuario?.rol);

// ===== 3. Verificar Validez del Token =====
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = new Date(payload.exp * 1000);
    console.log('3. Token válido hasta:', exp.toLocaleString());
    console.log('   ¿Expirado?:', exp < new Date() ? '❌ SÍ' : '✅ NO');
  } catch (e) {
    console.error('❌ Error al decodificar token:', e);
  }
}

// ===== 4. Hacer un request de prueba =====
console.log('\n=== PROBANDO REQUEST ===');
fetch('http://localhost:8080/api/sucursales/actual', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('✅ Respuesta:', d))
.catch(e => console.error('❌ Error:', e));
```

## Si ves esto:
```
1. Token en localStorage: true
   Length: 234
2. Usuario en localStorage: admin
   Rol: ADMIN
3. Token válido hasta: 6/12/2025 20:47:33
   ¿Expirado?: ✅ NO
✅ Respuesta: {sucursalId: 1, sucursalNombre: "..."}
```

✅ **El fix funcionó**

## Si ves esto:
```
1. Token en localStorage: false
```

❌ **El token no se está guardando → Problema en el login**

## Si ves esto:
```
❌ Error: 403 Forbidden
```

❌ **El token se envía pero el backend lo rechaza → Problema en backend**

