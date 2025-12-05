# 📝 PRUEBA MANUAL - Eliminación de Categorías

## ✅ Pasos para verificar que el fix funciona

### Setup
1. Asegurar que el backend está compilado: `./mvnw clean package -DskipTests`
2. Iniciar backend: `./start.sh`
3. Iniciar frontend: `npm start`

### Test 1: Eliminar categoría creada recientemente

```
1. Ir a http://localhost:3000/admin/categorias
2. Haz clic en "🔄" (Refresh) para asegurar datos frescos
3. Haz clic en "+ NUEVA CATEGORÍA"
4. Crear: "TEST-DELETE-ME" (cualquier nombre)
5. Haz clic en "CREAR"
   ✅ Debe aparecer en la tabla
6. Localiza "TEST-DELETE-ME" en la tabla
7. Haz clic en 🗑️ (Eliminar)
8. Confirma en el diálogo
   ✅ Debe desaparecer INMEDIATAMENTE
   ✅ Debe aparecer mensaje: "✅ Categoría ... eliminada exitosamente"
   ✅ Filtro debe cambiar a "Activas" automáticamente
9. Recarga la página (F5)
   ✅ NO debe aparecer "TEST-DELETE-ME"
   ✅ Si cambias a "Inactivas", entonces SÍ aparece
```

### Test 2: Eliminar categoría existente (ej: "prueba")

```
1. Ir a http://localhost:3000/admin/categorias
2. Haz clic en "Inactivas"
   ℹ️ Verás categorías marcadas como inactivas (incluidas las que eliminaste)
3. Si ves "prueba" con estado "Inactiva":
   ✅ El fix anterior funcionó
   ✅ Ahora esta categoría tiene activa = false en BD
```

### Test 3: Eliminar subcategoría

```
1. Ir a http://localhost:3000/admin/categorias
2. Haz clic en una categoría (ej: "Desayunos")
3. En la sección "Subcategorías de Desayunos", busca una subcategoría
4. Haz clic en 🗑️ (Eliminar subcategoría)
5. Confirma
   ✅ Debe desaparecer de la tabla
   ✅ Debe mostrar mensaje de éxito
6. Recarga la página
   ✅ Debe seguir desaparecida
```

## 🔍 Cómo diagnosticar si algo anda mal

### Backend - Ver logs
```bash
cd backend
tail -f nohup.out | grep -E "Eliminar|DELETE|Cacheable"
```

### Frontend - Consola del navegador
```javascript
// Abre DevTools (F12)
// Tab "Network"
// Busca "DELETE /api/inventario/categorias-productos"
// Verifica que responde con 204 No Content (éxito)
```

### Base de datos - Verificar directamente
```sql
-- Conectar a Railway PostgreSQL
SELECT id, nombre, activa FROM categorias_productos 
WHERE nombre LIKE 'TEST-%' OR nombre = 'prueba'
ORDER BY id;

-- Debe mostrar:
-- id | nombre | activa
-- 61 | prueba | 0 (false)
-- 99 | TEST-DELETE-ME | 0 (false)
```

## 📊 Resultado Esperado

✅ **Después del fix:**
- Eliminar categoría → desaparece inmediatamente del frontend
- Recargar página → sigue desaparecida
- Cambiar a filtro "Inactivas" → reaparece (soft delete, conserva histórico)
- Cambiar a filtro "Activas" → desaparece
- Crear nueva categoría → funciona correctamente
- Editar categoría → funciona correctamente

---

**Status:** 🟡 Pendiente de prueba en vivo
**Fecha:** 5 de Diciembre de 2025
