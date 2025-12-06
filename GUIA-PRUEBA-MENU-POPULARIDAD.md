# 🚀 GUÍA PASO A PASO: Cómo Probar el Menú Ordenado por Popularidad

## ⚡ En 5 Minutos: Prueba Rápida

### Paso 1: Reiniciar Backend (30 segundos)

```bash
# Terminal 1
cd /home/grxson/Documentos/Github/punto-de-venta/backend

# Matar java anterior
pkill -f java

# Esperar 2 segundos
sleep 2

# Iniciar
./start.sh
```

**Esperar a ver:**
```
[INFO] POS Backend Started!
[INFO] Running on port 8080
[INFO] Swagger UI: http://localhost:8080/swagger-ui.html
```

✅ **Confirmación:** Backend corriendo

---

### Paso 2: Limpiar Cache Frontend (20 segundos)

```bash
# En el navegador:
# 1. Abrir DevTools
F12

# 2. Limpiar almacenamiento
Ctrl + Shift + Delete

# 3. Seleccionar:
#    - ☑ Cookies y datos del sitio
#    - ☑ Archivos en caché
# 4. Click "Limpiar datos"

# 5. Cerrar DevTools
F12

# 6. Recargar página
F5
```

✅ **Confirmación:** Página recarga sin caché

---

### Paso 3: Ir a POS (10 segundos)

```
URL: http://localhost:3000/pos
```

**Esperar a ver:**
- [ ] Página carga
- [ ] Selector de categorías visible
- [ ] Productos mostrados
- [ ] Sin errores en console (F12)

✅ **Confirmación:** POS carga correctamente

---

### Paso 4: Verificar Orden (30 segundos)

**Mirar el PRIMER producto en [TODAS]:**

```
¿Es Verde Mediano?  ← Si SÍ, ✅ ¡FUNCIONA!
¿Es otra cosa?      ← Si NO, revisar troubleshooting
```

**Orden esperado:**
```
1. Verde Mediano (score 92)
2. Chocolate Mediano (score 87)
3. Naranja Mediano (score 72)
```

---

## 📊 En 10 Minutos: Prueba Detallada

### Paso 5: Verificar API Directamente

**Abrir nueva pestaña:**

```
URL: http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7
```

**Deberías ver JSON:**
```json
{
  "columnasGrid": 3,
  "posiciones": 3,
  "productos": [
    {
      "id": 5,
      "nombre": "Verde Mediano",
      "precio": 50.0,
      "scorePopularidad": 92.34,
      "frecuenciaVenta": 34,
      "cantidadVendida": 34,
      "ingresoTotal": 1700.0,
      "recencia": 0.95
    },
    {
      "id": 2,
      "nombre": "Chocolate Mediano",
      "precio": 25.0,
      "scorePopularidad": 87.12,
      "frecuenciaVenta": 31,
      ...
    }
  ],
  "timestamp": "2024-01-15T..."
}
```

**Verificar:**
- [ ] ¿Response tiene estructura JSON válida?
- [ ] ¿Array `productos` está presente?
- [ ] ¿Verde Mediano es el primero?
- [ ] ¿scorePopularidad > 0 para todos?

**Si hay error 500:**
```bash
# Terminal backend: Ver logs
tail -50 backend.log | grep -A 10 ERROR
```

---

### Paso 6: Verificar Console sin Errores

```bash
# En navegador POS:
F12  # Abrir DevTools

# Click en Console tab
# Debería estar VACÍA o solo info/debug

# Si ves rojo (ERROR):
# - Copiar el error
# - Ir a "Troubleshooting" abajo
```

---

### Paso 7: Probar Cambio de Categoría

**En POS:**
1. Seleccionar [TODAS] - Ver orden general
2. Click [JUGOS] - Ver orden de jugos
3. Click [LICUADOS] - Ver orden de licuados
4. Click [DESAYUNOS] - Ver orden de desayunos

**Verificar:**
- [ ] Cada categoría tiene ORDEN DIFERENTE
- [ ] Primero en cada categoría es DIFERENTE
- [ ] Orden siempre de MAYOR a MENOR popularidad

**Ejemplo:**
```
[TODAS]
1. Verde Mediano
2. Chocolate
3. Naranja

[JUGOS] ← Solo jugos
1. Naranja
2. Zanahoria
3. Mixto

[LICUADOS] ← Solo licuados
1. Verde
2. Chocomilk
3. Fresa
```

---

## 🔄 En 15 Minutos: Prueba con Venta Real

### Paso 8: Hacer una Venta

**En POS:**
1. Seleccionar un producto (ej: Verde Mediano)
2. Poner cantidad: 5
3. Pagar
4. Confirmar venta

**Verificar:**
- [ ] Venta se registra
- [ ] Producto desaparece del menú o reduces cantidad
- [ ] Venta aparece en "Resumen del día"

---

### Paso 9: Click en "Actualizar" 🔄

**En POS:**
- Buscar botón "Actualizar" o "Refresh"
- Click

**Esperar:**
- [ ] 2-3 segundos
- [ ] Mensaje de confirmación (si existe)
- [ ] Menú recalcula orden

**Verificar:**
- [ ] ¿Producto que vendiste movió en orden?
- [ ] ¿Score cambió?
- [ ] Ejemplo:
  ```
  ANTES: Verde Mediano (score 92)
  DESPUÉS: Verde Mediano (score 93.5)  ← Score subió
  ```

---

### Paso 10: Verificar en Reportes

**Admin Panel → Reportes:**

**Comparar:**
| Ubicación | Producto #1 | Score |
|-----------|------------|-------|
| Reportes | Verde Mediano | 92 |
| POS Menu | Verde Mediano | 92 |
| **Coinciden?** | ✅ SÍ | ✅ SÍ |

---

## 🛠️ En 20 Minutos: Prueba Técnica Completa

### Paso 11: Network Inspection

**En POS (F12 → Network tab):**

1. Recargar página (F5)
2. Buscar en Network:
   ```
   Buscar: "menu/ordenado"
   ```

3. Click en ese request

**Verificar:**
- [ ] **URL:** `http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7`
- [ ] **Method:** GET
- [ ] **Status:** 200 (verde)
- [ ] **Response size:** > 500 bytes
- [ ] **Time:** < 2 segundos

**Si ves:**
```
404 Not Found    ← Endpoint no existe
500 Server Error ← Backend error
Pending...       ← Backend muy lento
```

→ Ir a "Troubleshooting"

---

### Paso 12: Response JSON

**DevTools → Network → Click request `/menu/ordenado` → Response tab**

**Debería ver:**
```json
{
  "columnasGrid": 3,
  "posiciones": 3,
  "productos": [
    {
      "id": 5,
      "nombre": "Verde Mediano",
      "scorePopularidad": 92.34,
      ...
    },
    ...
  ]
}
```

**Verificar:**
- [ ] JSON válido (no errores de parsing)
- [ ] Array `productos` existe
- [ ] Cada producto tiene `scorePopularidad`
- [ ] Primer producto tiene score más alto

---

### Paso 13: Fallback Test

**Simular error de popularidad:**

1. DevTools → Network → Throttle to "Offline"
2. Recargar POS (F5)
3. DevTools → Console

**Esperado:**
```
⚠️ Fallback: Cargando productos desde inventario (sin popularidad)
```

**Verificar:**
- [ ] ¿Menú TODAVÍA carga?
- [ ] ¿Sin crashes?
- [ ] ¿Productos visibles (aunque no ordenados)?

**Luego:**
- Volver a "Online"
- Recargar (F5)
- Debería usar endpoint de popularidad nuevamente

---

## ✅ Checklist Final de Validación

Marca TODO como ✅:

### Configuración ✅
- [ ] Backend compilado sin errores
- [ ] Frontend compilado sin errores
- [ ] Backend ejecutándose en puerto 8080
- [ ] Frontend ejecutándose en puerto 3000

### API ✅
- [ ] Endpoint `/api/v1/menu/ordenado` devuelve 200
- [ ] Response contiene array de productos
- [ ] Cada producto tiene scorePopularidad
- [ ] Productos están ORDENADOS (score descendente)

### Frontend ✅
- [ ] POS carga sin errores
- [ ] Menú muestra productos
- [ ] Primer producto es Verde Mediano (score 92)
- [ ] Categorías filtran correctamente

### Dinámico ✅
- [ ] Hacer venta → Score aumenta
- [ ] Click "Actualizar" → Menú recalcula
- [ ] Nueva venta → Orden cambia
- [ ] Reports coinciden con Menú

### Robustez ✅
- [ ] Si API falla → Fallback a inventario
- [ ] Menú NUNCA queda vacío
- [ ] Console sin errores críticos
- [ ] Performance < 3 segundos

---

## 🚨 Troubleshooting Rápido

### ❌ Backend no inicia

```bash
# Verificar puerto 8080 ocupado
lsof -i :8080

# Matar proceso
kill -9 <PID>

# Reintentar
./start.sh
```

---

### ❌ Frontend 404 Not Found

```bash
# Verificar que está en /pos
URL: http://localhost:3000/pos

# Si localhost:3000 no funciona
cd frontend
npm start
# Esperar 10 segundos
```

---

### ❌ Menú SIGUE alfabético

**Causa probable:** Fallback activado (popularidad falla)

```bash
# Verificar endpoint:
curl -v 'http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7'

# Si error 500:
tail -100 backend/target/backend.log | grep ERROR
```

---

### ❌ Verde NO es primero

**Verificar:**
1. Reportes muestran Verde como #1? (Admin → Reportes)
2. Score de Verde > 0?
3. Backend recalculó datos?

```bash
# Force refresh en backend
./start.sh

# Esperar 30 segundos (cálculo de popularidad)
# Ir a POS
# Verde debe estar primero
```

---

### ❌ Console tiene errores rojos

**Copiar error y revisar:**

```javascript
// Común 1: No encontró config
"MENU_ORDENADO is undefined"
→ Verificar api.config.ts línea 45

// Común 2: Network error
"GET /api/v1/menu/ordenado 404"
→ Backend no tiene endpoint o no reinició

// Común 3: Parsing error
"Cannot read property 'productos' of undefined"
→ Response malformado, ver en Network tab
```

---

## 📞 Confirmación de Éxito

Cuando TODO funciona, verás:

```
✅ POS carga
✅ Menú muestra Verde Mediano PRIMERO
✅ Score muestra 92 (o similar)
✅ Categories reordenan
✅ Click "Actualizar" recalcula
✅ Console sin errores críticos
✅ Reports coinciden con Menú
```

**Si ves TODO esto:** ¡COMPLETADO EXITOSAMENTE! 🎉

---

## 📋 Resumen de URLs Clave

| Función | URL |
|---------|-----|
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| POS | http://localhost:3000/pos |
| Admin | http://localhost:3000/admin |
| API Menu | http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7 |
| API Inventory | http://localhost:8080/api/inventario/productos?activo=true&enMenu=true |

---

**Documento de pruebas:** GUÍA-PRUEBA-MENU-POPULARIDAD.md
**Última actualización:** 2024-01-15
**Estado:** LISTO ✅

