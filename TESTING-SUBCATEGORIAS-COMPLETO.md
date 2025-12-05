# 🚀 GUÍA DE TESTING - Subcategorías desde Base de Datos

## ✅ Prerequisitos

- [ ] Backend compilado y corriendo
- [ ] Frontend compilado y corriendo
- [ ] Base de datos accesible

---

## 🧪 Test 1: Verificar que las categorías existen en BD

### Opción A: H2 Console (Desarrollo)
```bash
1. Ir a: http://localhost:8080/h2-console
2. Conectar a BD
3. Ejecutar query:
   SELECT id, nombre FROM categorias_productos 
   WHERE nombre IN ('DULCES', 'LONCHES', 'SANDWICHES', 'OTROS');
4. Verificar que retorna 4 registros
```

### Opción B: Terminal/SQL Client
```bash
# PostgreSQL (Producción)
psql -U usuario -d punto_de_venta -c \
  "SELECT id, nombre FROM categorias_productos 
   WHERE nombre IN ('DULCES', 'LONCHES', 'SANDWICHES', 'OTROS');"
```

**Esperado:** 4 filas (DULCES, LONCHES, SANDWICHES, OTROS)

---

## 🧪 Test 2: Verificar que el dropdown de subcategorías funciona

### Pasos:
1. **Ir a Admin > Gestión de Productos**
2. **Click en botón "Crear Producto"**
   - Se abre modal "Nuevo Producto"
3. **En campo "Categoría" selecciona "Desayunos"**
   - Espera a que carguen las categorías de BD
4. **Debería aparecer nuevo campo "Subcategoría (opcional)"**
   - [ ] Campo visible después de seleccionar Desayunos
5. **Click en el dropdown de Subcategoría**
   - [ ] Opción: "Sin especificar"
   - [ ] Opción: "DULCES"
   - [ ] Opción: "LONCHES"
   - [ ] Opción: "SANDWICHES"
   - [ ] Opción: "OTROS"

**Resultado esperado:** ✅ Las 4 subcategorías cargadas de BD

---

## 🧪 Test 3: Auto-detección de Subcategoría

### Pasos:
1. **Modal "Nuevo Producto" abierto**
2. **Categoría = "Desayunos"**
3. **En "Nombre" escribe: "Mollete de Queso"**
   - Debería auto-seleccionar: **DULCES**
   - [ ] Se auto-detecta correctamente
4. **Cambia nombre a: "Lonche de Pierna"**
   - Debería auto-seleccionar: **LONCHES**
   - [ ] Se auto-detecta correctamente
5. **Cambia nombre a: "Sándwich de Jamón"**
   - Debería auto-seleccionar: **SANDWICHES**
   - [ ] Se auto-detecta correctamente
6. **Cambia nombre a: "Otro Producto"**
   - NO debería auto-seleccionar nada
   - [ ] Se mantiene en "Sin especificar"

**Resultado esperado:** ✅ Auto-detección funciona según palabras clave

---

## 🧪 Test 4: Crear Producto con Subcategoría

### Pasos:
1. **Modal "Nuevo Producto" abierto**
2. **Llenar formulario:**
   - Nombre: "Mollete Especial"
   - Categoría: "Desayunos"
   - Subcategoría: "DULCES" (seleccionar manualmente o auto-detectado)
   - Precio: 15.00
   - SKU: auto-generado (dejar vacío)
3. **Click en "Crear"**
4. **Esperar a que se cree exitosamente**

**Resultado esperado:** ✅ Producto creado sin errores

---

## 🧪 Test 5: Verificar que el Producto tiene el Prefijo Correcto

### Opción A: En la tabla de Productos
1. **Ir a Admin > Gestión de Productos**
2. **Buscar el producto creado: "Mollete Especial"**
3. **El nombre mostrado debería ser: "[DULCES] Mollete Especial"**
   - [ ] Prefijo visible en la tabla

### Opción B: En la Base de Datos
```bash
SELECT nombre FROM productos WHERE nombre LIKE '%Mollete Especial%';
```

**Resultado esperado:** `[DULCES] Mollete Especial`

---

## 🧪 Test 6: Editar Producto y Verificar Subcategoría

### Pasos:
1. **Ir a Admin > Gestión de Productos**
2. **Click en el producto "[DULCES] Mollete Especial"**
3. **Se abre modal de edición**
4. **Verifica que:**
   - [ ] Campo Categoría muestra: "Desayunos"
   - [ ] Campo Subcategoría muestra: "DULCES"
   - [ ] El nombre es limpio (sin prefijo): "Mollete Especial"
5. **Cambiar subcategoría a "OTROS"**
6. **Click en "Actualizar"**
7. **Volver a abrir el producto**
   - [ ] Subcategoría ahora es: "OTROS"
   - [ ] Nombre en BD es: "[OTROS] Mollete Especial"

---

## 🧪 Test 7: Verificar en POS (Punto de Venta)

### Pasos:
1. **Ir a POS > Seleccionar Productos**
2. **Click en "DESAYUNOS"**
3. **Debería aparecer los botones de subcategoría:**
   - [ ] TODOS
   - [ ] DULCES
   - [ ] LONCHES
   - [ ] SANDWICHES
   - [ ] PLATOS PRINCIPALES (es OTROS)
4. **Click en "DULCES"**
5. **Debería mostrar solo productos de subcategoría DULCES:**
   - [ ] "Mollete Especial" aparece
   - [ ] Otros productos de otras subcategorías NO aparecen
6. **Click en "LONCHES"**
   - [ ] Solo productos de LONCHES aparecen
7. **Click en "TODOS"**
   - [ ] Todos los productos de Desayunos aparecen

**Resultado esperado:** ✅ Filtro funciona correctamente

---

## ❌ Troubleshooting

### Problema: "Las subcategorías no aparecen en el dropdown"
**Solución:**
1. Verificar que la BD tiene las 4 categorías (Test 1)
2. Verificar que la migración V008 se ejecutó
3. Reiniciar backend (ejecuta migraciones nuevamente)
4. Limpiar caché del navegador (Ctrl+Shift+Delete)

### Problema: "Auto-detect no funciona"
**Solución:**
1. Verificar que escribes palabras exactas: "mollete", "lonche", "sandwich"
2. La búsqueda es case-insensitive, así que "MOLLETE" también funciona
3. Revisar que la categoría sea "Desayunos" (no otra)

### Problema: "El prefijo muestra en minúsculas [dulces]"
**Solución:**
- NORMAL - El sistema acepta ambos formatos (retrocompatible)
- Los nuevos productos usarán mayúsculas automáticamente

---

## 📊 Resumen de Tests

| Test | Descripción | Status |
|------|-------------|--------|
| 1 | BD tiene 4 categorías | ⬜ |
| 2 | Dropdown muestra subcategorías | ⬜ |
| 3 | Auto-detect funciona | ⬜ |
| 4 | Crear producto con subcategoría | ⬜ |
| 5 | Producto tiene prefijo correcto | ⬜ |
| 6 | Editar y actualizar subcategoría | ⬜ |
| 7 | POS filtra por subcategoría | ⬜ |

**Instrucciones:**
- Marca ✅ cuando cada test pase
- Marca ❌ si falla (incluir descripción del error)
- Marca ⏭️ si se salta el test

---

## 🎉 Si todos los tests pasan

**Estás listo para:**
- [ ] Hacer commit de los cambios
- [ ] Hacer merge a develop
- [ ] Hacer deploy a producción (cuando sea el momento)

---

Última actualización: 5 de diciembre de 2025
