# ✅ CHECKLIST: Menú Ordenado por Popularidad

## Fase 1: Preparación ⏳

- [ ] Backend está ejecutándose: `./start.sh` en terminal
  - Verificar: `http://localhost:8080/swagger-ui.html` carga
  - Verificar: No hay errores en logs

- [ ] Frontend está en localhost:3000
  - Verificar: Página carga sin errores 404
  - Verificar: DevTools → Console sin errores rojos

- [ ] Cache limpio
  - [ ] F12 → Ctrl+Shift+Delete → Limpiar cache
  - [ ] F5 → Recargar página

---

## Fase 2: Verificación de API ⏳

### Test 1: Endpoint de Popularidad Existe

```bash
# Terminal: Probar directamente
curl 'http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7'
```

**Esperado:**
```json
{
  "columnasGrid": 3,
  "posiciones": 3,
  "productos": [
    {
      "id": 5,
      "nombre": "Verde Mediano",
      "precio": 50.00,
      "scorePopularidad": 92.34,
      "frecuenciaVenta": 34,
      "cantidadVendida": 34
    },
    { ... }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

**Si falla:**
- [ ] Verificar backend log: `tail -20 backend.log`
- [ ] Swagger UI: `http://localhost:8080/swagger-ui.html`
  - Buscar: `MenuPopularidadController`
  - Probar endpoint desde ahí

---

### Test 2: Endpoint Antiguo Todavía Funciona (Fallback)

```bash
curl 'http://localhost:8080/api/inventario/productos?activo=true&enMenu=true'
```

**Esperado:** Array de productos (sin scores)

**Propósito:** Fallback si popularidad falla

---

## Fase 3: Verificación Frontend ⏳

### Test 3: Abrir POS

- [ ] URL: `http://localhost:3000/pos`
- [ ] Esperar 3-5 segundos
- [ ] Verificar DevTools → Network
  - [ ] Request: `/api/v1/menu/ordenado` ← NUEVA ✅
  - [ ] Status: 200 OK
  - [ ] Response size: > 500 bytes

**Si falla:**
- [ ] DevTools → Console → Buscar errores
- [ ] Check: Backend running? `ps aux | grep java`
- [ ] Check: Endpoint correcto en api.config.ts?

---

### Test 4: Orden Correcto del Menú

**Expectativa:**

**Categoría: TODAS (todos los productos)**

| Posición | Producto | Score | Status |
|----------|----------|-------|--------|
| 1️⃣ | Verde Mediano | 92.34 | ✅ |
| 2️⃣ | Chocolate Mediano | 87.12 | ✅ |
| 3️⃣ | Naranja Mediano | 72.45 | ✅ |
| 4️⃣ | Licuado Fresa | 65.20 | ✅ |
| 5️⃣ | Chocomilk | 60.15 | ✅ |

**Lo que VES en pantalla:**

```
[TODAS] [JUGOS] [LICUADOS] [DESAYUNOS] ...

Verde Mediano       Chocolate Med.        Naranja Med.
┌──────────┐        ┌──────────┐        ┌──────────┐
│  50.00   │        │  25.00   │        │  40.00   │
│   (92)   │        │   (87)   │        │   (72)   │
└──────────┘        └──────────┘        └──────────┘

Licuado Fresa       Chocomilk              ...
┌──────────┐        ┌──────────┐        ┌──────────┐
│  30.00   │        │  20.00   │        │   ...    │
│   (65)   │        │   (60)   │        │   ...    │
└──────────┘        └──────────┘        └──────────┘
```

- [ ] ¿Primer producto es Verde Mediano?
- [ ] ¿Segundo producto es Chocolate Mediano?
- [ ] ¿Tercero es Naranja Mediano?
- [ ] ¿Orden coincide con scores?

**Si NO coincide:**
- [ ] Verificar backend devuelve correcto orden
- [ ] Verificar frontend mapea correctamente
- [ ] Revisar PosHome.tsx línea 235-265 (loadData)

---

### Test 5: Orden por Categoría

**Categoría: JUGOS**

- [ ] Click en [JUGOS]
- [ ] Esperar filtro
- [ ] Ver primero: Naranja (score más alto en categoría)
- [ ] Ver segundo: Zanahoria
- [ ] Ver tercero: Mixto

**Esperado:**
```
[TODAS] [JUGOS] [LICUADOS] ...
        ↑ ACTIVO

Naranja             Zanahoria            Mixto
(75)                (60)                 (45)
```

---

### Test 6: Botón "Actualizar" 🔄

- [ ] En POS, buscar botón "Actualizar" o "Refresh"
- [ ] Click
- [ ] Esperar 2-3 segundos
- [ ] Mensaje: "Menú actualizado" (si existe)
- [ ] Verificar: Si hay nuevas ventas, orden cambió?

**Para probarlo:**

1. **Hacer una venta:**
   - Seleccionar producto
   - Pagar
   - Confirmar

2. **Click "Actualizar"**

3. **¿El producto que vendiste subió en orden?**
   - [ ] SÍ → ✅ Funciona
   - [ ] NO → Revisar backend

---

## Fase 4: Verificación Técnica ⏳

### Test 7: TypeScript Sin Errores

```bash
# Terminal en frontend
npm run build
# O simplemente ver en VS Code
```

- [ ] No hay errores rojos en PosHome.tsx
- [ ] No hay errores rojos en api.config.ts
- [ ] Build exitosa (si ejecuta)

---

### Test 8: Backend Compila

```bash
# Terminal en backend
./mvnw clean compile -q 2>&1 | tail -5
```

- [ ] BUILD SUCCESS
- [ ] No hay nuevos errores
- [ ] Log vacío o con only warnings

---

### Test 9: DevTools Network Tab

Abre POS y verifica:

- [ ] Request: `GET /api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7`
  - [ ] Status: 200 OK
  - [ ] Response time: < 2 segundos
  
- [ ] Request: Fallback `/api/inventario/productos` (solo si anterior falla)
  - [ ] Status: 200 OK
  - [ ] Verifica fallback mensaje en console

---

### Test 10: Logs sin Errores

**Terminal Backend:**
```bash
tail -50 backend.log | grep -i error
```

- [ ] Sin "ERROR" lines
- [ ] Sin "WARN" de importancia
- [ ] Solo INFO y DEBUG

**Browser Console (F12):**
```javascript
// Limpiar errores viejos
console.clear()

// Ir a POS
// Navigate to http://localhost:3000/pos

// Ver si hay errores rojos
```

- [ ] Console limpia (sin errores rojos)
- [ ] Logs informativos solamente

---

## Fase 5: Pruebas Avanzadas ⏳

### Test 11: Múltiples Categorías

Para cada categoría:

| Categoría | Primero (esperado) | Ves en pantalla | ✓/✗ |
|-----------|-------------------|-----------------|-----|
| TODAS | Verde Mediano | | |
| JUGOS | Naranja | | |
| LICUADOS | Verde | | |
| DESAYUNOS | Quesadilla | | |
| BEBIDAS | Choco | | |

- [ ] Cada categoría ordena correctamente
- [ ] Orden cambia por categoría
- [ ] No hay duplicados

---

### Test 12: Rendimiento

Medir tiempo:

1. Click en categoría → Esperar
2. ¿Cuánto tarda en reordenar?

**Esperado:**
- [ ] < 2 segundos (aceptable)
- [ ] < 1 segundo (bueno)
- [ ] > 3 segundos (revisar backend)

**Medir:**
```javascript
// DevTools Console
const start = performance.now();
// ... hacer acción ...
const end = performance.now();
console.log(end - start, 'ms');
```

---

### Test 13: Datos Consistentes

Comparar 3 fuentes:

1. **Admin Panel → Reportes:**
   - Abierto en otra pestaña
   - Mostrar producto #1 (ej: Verde 92)

2. **Admin Panel → Producto Edit:**
   - Abrir producto Verde
   - Verificar scorePopularidad = 92

3. **POS Menu:**
   - Ir a POS
   - Verificar Verde en posición 1

**Esperado:**
```
Reportes:   Verde (92)     ✓
Producto:   Verde (92)     ✓
POS Menu:   Verde (92) 1️⃣ ✓
→ Todos coinciden ✅
```

---

### Test 14: Fallback (Fallo de Popularidad)

Simular que la API de popularidad falla:

**Opción 1 - Con DevTools:**
1. F12 → Network
2. Right-click en request `/menu/ordenado`
3. Seleccionar "Throttling" → "Offline"
4. Recargar POS
5. Verificar: Carga menu desde fallback (inventory endpoint)

**Esperado:**
- [ ] Console warning: "Fallback: Cargando productos..."
- [ ] Menú TODAVÍA carga (sin orden de popularidad)
- [ ] No hay crash
- [ ] Mensaje claro

---

## Fase 6: Documentación ⏳

- [ ] Archivo IMPLEMENTACION-MENU-ORDENADO-POPULARIDAD.md creado
- [ ] Archivo COMPARACION-ANTES-DESPUES-MENU-POPULARIDAD.md creado
- [ ] Archivos son legibles y contienen toda la info

---

## Troubleshooting

### ❌ Problema: Menú SIGUE alfabético

**Causas posibles:**

1. **Backend no reiniciado**
   - [ ] Kill Java: `pkill -f java`
   - [ ] Reiniciar: `./start.sh`

2. **Frontend no actualizado**
   - [ ] F12 → Ctrl+Shift+Delete
   - [ ] F5 → Reload

3. **Endpoint no devuelve datos**
   - [ ] Probar directamente: `curl http://localhost:8080/api/v1/menu/ordenado...`
   - [ ] Verificar Swagger: `/swagger-ui.html`

4. **Frontend no llama al endpoint correcto**
   - [ ] Verificar api.config.ts tiene MENU_ORDENADO
   - [ ] Verificar PosHome.tsx usa ese endpoint
   - [ ] DevTools Network: ¿Qué URL se llama?

---

### ❌ Problema: Menú está VACÍO

**Causas:**

1. **Fallback funcionando pero base de datos vacía**
   - [ ] Verificar `/api/inventario/productos` devuelve datos
   - [ ] Ejecutar seeds: `./mvnw spring-boot:run -Darguments="--seed"`

2. **API response malformado**
   - [ ] F12 → Network → Click en `/menu/ordenado`
   - [ ] Ver Response → ¿Tiene estructura correcta?
   - [ ] ¿Array `productos` existe?

---

### ❌ Problema: Error 500 al cargar

**Causas:**

1. **Endpoint no existe en backend**
   - [ ] Verificar: MenuPopularidadController existe
   - [ ] Verificar: Method ordenado() existe
   - [ ] Compilar: `./mvnw clean compile`

2. **Database error**
   - [ ] Backend logs: `tail -100 backend.log | grep -A 5 ERROR`
   - [ ] Revisar conexión a BD

---

### ❌ Problema: Performance lenta

**Si tarda > 5 segundos:**

1. **Database query lenta**
   - [ ] Backend logs: Buscar "Query took X ms"
   - [ ] Agregar índice a tabla de ventas
   - [ ] Reducir `diasAnalizar` (default 7, probar 3)

2. **Frontend renderizado lento**
   - [ ] Devtools → Performance tab
   - [ ] Ver si React re-renders muchas veces
   - [ ] Verificar no hay loops infinitos

---

## Resumen

**Checklist completo (~20 minutos):**

- [ ] **Preparación** (5 min)
- [ ] **API verification** (3 min)
- [ ] **Frontend UI** (5 min)
- [ ] **Técnica** (3 min)
- [ ] **Avanzadas** (4 min)

**Si TODO ✅:** ¡COMPLETADO! Menú ordena por popularidad correctamente.

**Si alguno ❌:** Revisar sección "Troubleshooting" arriba.

---

**Última actualización:** 2024-01-15
**Estado:** LISTO PARA TESTING ✅

