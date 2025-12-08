# 🧪 GUÍA DE VERIFICACIÓN - Segregación de Sucursales

**Estado:** 3 pasos completados

---

## ✅ LO QUE YA SE HIZO

### 1. Paso 1: Quitar prefijo `[CATEGORIA]`
```
✅ COMPLETADO
Archivo: /frontend-web/src/components/productos/ProductoForm.tsx
Cambio:  Removido código que añadía [SUBCATEGORIA] al nombre del producto
Impacto: Los productos ahora se guardarán sin el prefijo confuso
```

### 2. Paso 2: Revisar logs de SucursalContextFilter
```
✅ COMPLETADO - ANÁLISIS HECHO

Código verificado:
✅ JwtUtil.generateToken()            → SÍ incluye sucursalId
✅ UsuarioServicio.login()             → SÍ obtiene sucursal_id del usuario
✅ SucursalContextFilter               → SÍ extrae sucursalId del JWT
✅ EstadisticasService.resumenDia()   → SÍ filtra por SucursalContext

PROBLEMA IDENTIFICADO:
Si el token NO contiene sucursalId, SucursalContextFilter hace FALLBACK a sucursal_id=1
Esto causaría que el usuario vea datos de sucursal 1 en lugar de sucursal 2.

POTENCIALES CAUSAS:
1. ❓ Token expirado
2. ❓ Frontend no envía token en Authorization header
3. ❓ Token corrompido o generado incorrectamente
4. ❓ Usuario 'dev' no tiene sucursal_id=2 asignada en BD
```

---

## 🧪 PASO 3: Test Manual Automático

**Archivo creado:** `/test-segregacion.sh`

Este script hace login automático y verifica:
1. ✅ Se obtiene el token JWT
2. ✅ El token contiene `sucursalId=2`
3. ✅ El endpoint retorna datos de sucursal 2 ($4.00 ventas)

### Cómo ejecutar:

**OPCIÓN A: Con el backend corriendo localmente**
```bash
cd /home/grxson/Documentos/Github/punto-de-venta
./test-segregacion.sh
```

**OPCIÓN B: Contra Railway (producción)**
Edita el archivo y cambia:
```bash
BACKEND_URL="http://localhost:8080"
```
Por:
```bash
BACKEND_URL="https://tu-app.railway.app"
```

Luego ejecuta:
```bash
./test-segregacion.sh
```

---

## 📋 CÓMO EJECUTAR AHORA MISMO

### Terminal 1: Inicia el backend
```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend
./start.sh
```

Espera hasta ver:
```
✅ Backend iniciado en http://localhost:8080
```

### Terminal 2: Ejecuta el test
```bash
cd /home/grxson/Documentos/Github/punto-de-venta
./test-segregacion.sh
```

---

## 🎯 QUÉ ESPERAR

### Resultado OK ✅
```
JWT Claims:
{
  "sucursalId": 2,
  "usuarioId": 1,
  "rol": "USUARIO"
}

Total Ventas: 4.00
Total Gastos: 0

✅ CORRECTO: Sucursal 2 debe tener $4.00 en ventas
✅ Segregación funcionando correctamente
```

### Resultado MALO ❌
```
JWT Claims:
{
  "usuarioId": 1,
  "rol": "USUARIO"
  (NOTA: sucursalId FALTA)
}

Total Ventas: 14230
Total Gastos: 3004

❌ ERROR: Token NO contiene 'sucursalId'
❌ ERROR: Sucursal 2 está mostrando datos de otra sucursal
```

---

## 🔧 SI EL TEST FALLA

### Paso A: Revisar logs del backend
```bash
# Terminal 3 mientras el backend está corriendo
tail -f /tmp/spring.log | grep -i "sucursal\|SucursalContext"
```

Deberías ver algo como:
```
✅ [SucursalContextFilter] Sucursal obtenida del JWT: 2
📍 [SucursalContextFilter] SucursalContext establecido: ID=2
```

Si ves en cambio:
```
❌ [SucursalContextFilter] No hay token Bearer válido
❌ [SucursalContextFilter] CRÍTICO - No se pudo obtener sucursal_id
```

Entonces el problema es que el token NO se está enviando correctamente.

### Paso B: Verificar usuario dev en BD
```bash
# Conecta a la BD y verifica
SELECT id, username, sucursal_id FROM usuarios WHERE username='dev';
```

Debe retornar:
```
id  | username | sucursal_id
 ?  | dev      | 2
```

Si `sucursal_id` es NULL o 1, ese es el problema.

### Paso C: Revisar token manualmente
```bash
# Ejecuta el script y copia el token
# Luego decodifícalo en https://jwt.io
# Debe mostrar en la sección "PAYLOAD":
{
  "sucursalId": 2,
  "usuarioId": ...,
  "rol": "..."
}
```

---

## 📝 PRÓXIMOS PASOS DESPUÉS DEL TEST

1. ✅ Ejecutar test-segregacion.sh
2. ✅ Si FALLA: Investigar con los pasos A, B, C arriba
3. ✅ Si OK: Limpiar productos con nombre `[CATEGORIA]` en BD (optional)
4. ✅ Compilar y probar frontend en navegador

---

## 🛠️ COMPILAR FRONTEND (después de arreglar todo)

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/frontend-web
npm install
npm start
```

Los productos ahora se mostrarán sin `[CATEGORIA]` prefix.

---

**¿Qué hacemos ahora?** 
- [ ] Ejecutar `./test-segregacion.sh` y compartir los resultados
- [ ] Si hay errores, revisar los logs del backend
