# ✅ INSTRUCCIONES FINALES - Variantes Agrupadas

## Estado Actual

✅ **Backend**: Corriendo en `http://localhost:8080`  
✅ **Frontend**: Compilado y listo  
✅ **Base de Datos**: Molletes unificadas correctamente  
✅ **Código**: Todos los cambios aplicados  

---

## 🧪 Test: Verificar que Funciona

### Test 1: Limpiar Caché del Navegador

Antes de hacer cualquier prueba, **limpia la caché del navegador** para asegurar que carga el frontend nuevo:

**En Chrome/Firefox:**
1. Abre DevTools: `F12`
2. Clic derecho en el botón "Recargar" → "Vaciar caché y hacer recarga exhaustiva"
3. O usa: `Ctrl+Shift+Delete` → Borra todo → `Borrar datos`

**Alternativa rápida:**
```bash
# En terminal, usa una URL con "cache buster"
http://localhost:3000/?v==$(date +%s)
```

---

### Test 2: Verificar Variantes en POS (ANTES DE EDITAR)

1. **Abre el navegador** → `http://localhost:3000` (asegurate de que se cargó el nuevo código)
2. **Panel Administrativo** → **Punto de Venta**
3. **Selecciona categoría**: "DESAYUNOS"
4. **Selecciona subcategoría**: "DULCES" (botón azul)
5. **Busca**: "Molletes"

**Resultado Esperado:**
```
┌─────────────────────┐
│     Molletes        │
│     $40.00          │
└─────────────────────┘
(Una tarjeta)

Al clickear → Se abre modal:
├─ Dulce - $30.00
├─ Con Untado - $35.00
└─ Salado - $40.00
```

✅ **Esto significa que las variantes están correctamente agrupadas**

---

### Test 3: Editar el Producto y Cambiar Subcategoría (EL TEST CRÍTICO)

Este es el test que falló antes. Vamos a hacerlo:

1. **Admin Panel** → **Inventario**
2. **Busca**: "Molletes" (o "Dulce" en el buscador)
3. **Click en el ícono editar** (lápiz azul)
4. **Se abre el formulario**
5. **Cambia la subcategoría**:
   - Si está en "DULCES" → cámbialo a "LONCHES"
   - Si está en "LONCHES" → cámbialo a "SANDWICHES"
   - **O simplemente cámbialo de nuevo a "DULCES"**
6. **Guarda** (botón "Guardar")

**Resultado Esperado:**
```
✅ Debería mostrar mensaje "Producto guardado correctamente"
✅ En el POS (después de recargar):
   - "Molletes" sigue siendo UNA tarjeta
   - Al clickear sigue mostrando las variantes agrupadas
   - ❌ NO deberían verse como 3 tarjetas separadas
```

**Si aparecen separadas:**
```
❌ INCORRECTO:
├─ Molletes - Dulce       $30.00
├─ Molletes - Con Untado  $35.00
└─ Molletes - Salado      $40.00
```

---

### Test 4: Verificar en Admin → Ver Variantes

1. **Admin Panel** → **Inventario**
2. **Busca**: "Molletes"
3. **Click en el botón** "👁 Ver Variantes" (ojo naranja)

**Resultado Esperado:**
```
Modal debe mostrar:
├─ Dulce
├─ Con Untado
└─ Salado
```

---

## 🔧 Si Algo Falla

### Problema: Aún veo variantes separadas

**Solución:**

1. **Limpia COMPLETAMENTE el caché del navegador:**
   ```
   F12 → Application → Storage → Clear Site Data
   ```

2. **Cierra el navegador completamente y vuelve a abrir**

3. **Recarga la página:** `Ctrl+F5` (Hard refresh)

4. **Si sigue sin funcionar, limpia el caché del backend:**
   ```bash
   pkill -9 java || true
   sleep 2
   cd backend && bash start.sh &
   sleep 8
   ```

### Problema: Backend no inicia

Si ves errores en el backend:

```bash
# Ver logs detallados
tail -100 backend.log

# Verificar conexión a PostgreSQL
psql -h yamabiko.proxy.rlwy.net -p 32280 -U postgres -d railway -c "SELECT COUNT(*) FROM productos"
```

---

## 📋 Resumen de Cambios

| Componente | Cambio | Estado |
|-----------|--------|--------|
| **Frontend** | `ProductoForm.tsx` líneas 346-365: No enviar campo `nombre` en variantes | ✅ Compilado |
| **Backend** | `ProductoService.java` método `apply()`: Auto-reconstruir nombre de variantes | ✅ Compilado |
| **BD** | Script SQL ejecutado: Molletes unificadas con `producto_base_id` correcto | ✅ Ejecutado |
| **Cache** | Invalidado con `@CacheEvict` en `actualizar()` | ✅ Activo |

---

## ✅ Checklist Final

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] Frontend compilado y sirviendo en `http://localhost:3000`
- [ ] Caché del navegador limpio (Hard refresh hecho)
- [ ] En POS: Molletes aparecen como UNA tarjeta con modal de variantes
- [ ] Edité Molletes y cambié subcategoría → Aún aparecen agrupadas
- [ ] Admin → Ver Variantes muestra las 3 variantes correctamente

---

## 🚀 Próximos Pasos (Si Todo Funciona)

1. **Commit los cambios** a rama `develop`:
   ```bash
   git add -A
   git commit -m "fix: variantes agrupadas correctamente al editar subcategoría"
   ```

2. **Push a desarrolla:**
   ```bash
   git push origin develop
   ```

3. **Mergea a main cuando todo esté validado**

---

## 📚 Documentación de Referencia

- `FIX-VARIANTES-AGRUPADAS-SUBCATEGORIA.md` - Explicación técnica del problema
- `EJECUCION-SCRIPT-MOLLETES.md` - Cómo se ejecutó el script SQL
- `fix-molletes-variantes.sql` - Script SQL usado

