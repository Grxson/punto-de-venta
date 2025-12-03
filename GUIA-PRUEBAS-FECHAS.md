# 🧪 Guía de Pruebas - Fechas Editables y Visibles

## 📝 Pre-requisitos

- [ ] Backend compilado y corriendo en `http://localhost:8080`
- [ ] Frontend-web corriendo en `http://localhost:3000`
- [ ] Base de datos sincronizada
- [ ] Usuario autenticado en AdminReports

---

## 🚀 Pruebas Funcionales

### Prueba 1: Editar Fecha de Venta (Exitosa)

**Objetivo**: Verificar que se puede editar la fecha de una venta reciente

**Pasos**:
1. Navegar a **Admin → Ventas**
2. Localizar una venta creada hace < 2 horas
3. Hacer clic en el botón **"Editar"** (ícono de lápiz)
4. En el modal:
   - Cambiar la fecha a un día diferente (ej: +1 día)
   - Mantener el cliente y monto sin cambios
5. Hacer clic en **"Guardar"**

**Comportamiento esperado**:
- ✅ Modal se cierra automáticamente
- ✅ Lista de ventas se recarga
- ✅ La venta muestra la nueva fecha
- ✅ No aparecen mensajes de error

**Verificación en BD**:
```sql
SELECT id, folio, fecha, notas FROM ventas 
WHERE id = [ID_VENTA_EDITADA];

-- Esperado: fecha actualizada, notas con registro de auditoría
```

---

### Prueba 2: Visualizar Fecha en AdminDashboard

**Objetivo**: Verificar que el dashboard muestra la fecha del resumen

**Pasos**:
1. Navegar a **Admin → Dashboard**
2. Localizar la card **"Resumen del Día"**
3. Observar la esquina superior derecha

**Comportamiento esperado**:
- ✅ Muestra la fecha junto al título
- ✅ Formato: "Día DD de Mes" (ej: "Miércoles 03 de diciembre")
- ✅ Idioma: Español
- ✅ Nombre del día en minúsculas

**Ejemplo visual**:
```
┌──────────────────────────────┐
│ Resumen del Día              │
│                              │
│ miércoles 03 de diciembre ← │
│                              │
│ Venta:  $1,250.00           │
│ Costos: $450.00             │
└──────────────────────────────┘
```

---

### Prueba 3: Visualizar Fechas en AdminReports

**Objetivo**: Verificar que los reportes muestran el rango de fechas

**Pasos**:
1. Navegar a **Admin → Reportes**
2. Localizar el filtro de fecha (DateRangeFilter)
3. Seleccionar: desde 01/12/2024 hasta 05/12/2024
4. Observar la card **"Resumen del Período Seleccionado"**

**Comportamiento esperado**:
- ✅ Muestra el rango de fechas en la esquina superior derecha
- ✅ Formato: "Día1 dd de Mes - Día2 dd de Mes"
- ✅ Ejemplo: "lunes 01 de diciembre - viernes 05 de diciembre"
- ✅ Datos se filtran según el rango

**Ejemplo visual**:
```
┌────────────────────────────────────────────┐
│ Resumen del Período                        │
│                                            │
│ lunes 01 - viernes 05 de diciembre ← │
│                                            │
│ Total: 25 ventas | Ingresos: $12,500.00  │
└────────────────────────────────────────────┘
```

---

### Prueba 4: Visualizar Fecha en DailyStatsPanel

**Objetivo**: Verificar que el widget muestra la fecha del día

**Pasos**:
1. Ubicar el componente **DailyStatsPanel** (usualmente en el dashboard)
2. Ver la sección **"Resumen del Día"**
3. Expandir la card si está colapsada

**Comportamiento esperado**:
- ✅ Muestra la fecha bajo el título
- ✅ Formato: "Día dd de Mes"
- ✅ Tamaño: Caption (más pequeño que el título)
- ✅ Opacidad reducida (0.8)

**Ejemplo visual**:
```
┌─────────────────────────────┐
│ Resumen del Día        ▼   │
│ miércoles 03 de diciembre  │
├─────────────────────────────┤
│ Venta:    $1,250.00        │
│ Costos:   $450.00          │
│ Margen:   $800.00 (64%)    │
└─────────────────────────────┘
```

---

## ⚠️ Pruebas de Validación

### Prueba 5: Rechazar Edición de Venta Antigua (> 24h)

**Objetivo**: Verificar que el backend rechaza cambios a ventas > 24 horas

**Pasos**:
1. Navegar a **Admin → Ventas**
2. Localizar una venta de **hace 2+ días**
3. Hacer clic en **"Editar"**
4. Intentar cambiar la fecha
5. Hacer clic en **"Guardar"**

**Comportamiento esperado**:
- ❌ Modal se queda abierto
- ❌ Aparece mensaje de error:
  ```
  "No se pueden editar ventas más antiguas de 24 horas"
  ```
- ❌ La venta NO se modifica

**Captura de error esperada**:
```
┌─────────────────────────────────────┐
│ Error al actualizar la fecha        │
│ No se pueden editar ventas más      │
│ antiguas de 24 horas                │
│              [Cerrar]               │
└─────────────────────────────────────┘
```

---

### Prueba 6: Rechazar Edición de Venta Cancelada

**Objetivo**: Verificar que el backend rechaza cambios a ventas canceladas

**Setup previo**:
1. Crear una venta de prueba
2. Cancelarla inmediatamente

**Pasos**:
1. Navegar a **Admin → Ventas**
2. Localizar la venta cancelada
3. Hacer clic en **"Editar"**
4. Cambiar la fecha
5. Hacer clic en **"Guardar"**

**Comportamiento esperado**:
- ❌ Modal se queda abierto
- ❌ Aparece mensaje de error:
  ```
  "No se puede editar la fecha de una venta cancelada"
  ```
- ❌ Venta no se modifica

---

### Prueba 7: Rechazar Fecha Anterior a 24h

**Objetivo**: Verificar que no se pueden asignar fechas muy antiguas

**Pasos**:
1. Editar una venta reciente
2. Cambiar la fecha a: hace 5 días
3. Guardar

**Comportamiento esperado**:
- ❌ Aparecer error:
  ```
  "La nueva fecha no puede ser anterior a 24 horas"
  ```
- ❌ Venta no se modifica

---

## 📊 Pruebas de Auditoría

### Prueba 8: Verificar Auditoría en Notas

**Objetivo**: Confirmar que los cambios se registran en las notas

**Pasos**:
1. Editar una venta
2. Cambiar fecha y guardar
3. Reabrir la venta en el modal
4. Desplazarse hasta el campo **"Notas"**

**Comportamiento esperado**:
- ✅ Aparece registro similar a:
  ```
  Fecha actualizada de 2024-12-03 14:30:00 a 2024-12-04 10:00:00
  ```
- ✅ Si había notas previas, se concatenan con salto de línea

**Ejemplo en BD**:
```sql
SELECT notas FROM ventas WHERE id = 123;

-- Resultado:
"Notas originales del cliente
Fecha actualizada de 2024-12-03 14:30:00 a 2024-12-04 10:00:00"
```

---

## 🔐 Pruebas de Seguridad

### Prueba 9: Requiere Autenticación

**Objetivo**: Verificar que solo usuarios autenticados pueden editar fechas

**Pasos**:
1. Cerrar sesión (logout)
2. Intentar hacer request directo a:
   ```
   PUT /api/ventas/1/fecha?fecha=2024-12-04T10:00:00
   ```

**Comportamiento esperado**:
- ❌ Respuesta 401 Unauthorized
- ❌ No se modifica ninguna venta

**Verificación en consola del navegador**:
```javascript
// DevTools → Console
fetch('/api/ventas/1/fecha', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.status)
// Esperado: 401 (sin token), 200 (con token válido)
```

---

## 🌍 Pruebas de Formato

### Prueba 10: Formato Español de Fecha

**Objetivo**: Verificar que las fechas aparecen en español

**Casos a probar**:
| Fecha | Esperado | Actual |
|-------|----------|--------|
| 2024-12-02 | lunes 02 de diciembre | ✓ |
| 2024-12-03 | martes 03 de diciembre | ✓ |
| 2024-12-04 | miércoles 04 de diciembre | ✓ |
| 2024-12-05 | jueves 05 de diciembre | ✓ |
| 2024-12-06 | viernes 06 de diciembre | ✓ |
| 2024-01-15 | martes 15 de enero | ✓ |
| 2024-02-29 | jueves 29 de febrero | ✓ |

**Comportamiento esperado**:
- ✅ Todos los días aparecen en minúsculas
- ✅ Todos los meses aparecen en español
- ✅ Formato consistente en todas las pantallas

---

## 📈 Pruebas de Carga

### Prueba 11: Editar Múltiples Ventas Consecutivas

**Objetivo**: Verificar estabilidad con múltiples ediciones

**Pasos**:
1. Editar venta 1 → cambiar fecha → guardar
2. Editar venta 2 → cambiar fecha → guardar
3. Editar venta 3 → cambiar fecha → guardar
4. Editar venta 4 → cambiar fecha → guardar
5. Editar venta 5 → cambiar fecha → guardar

**Comportamiento esperado**:
- ✅ Todas se guardan exitosamente
- ✅ No hay pérdida de datos
- ✅ No hay errores acumulativos
- ✅ Resumen se actualiza correctamente

---

## 📋 Checklist Final

Marca como completado cuando cada prueba haya pasado:

### Funcionalidad
- [ ] Prueba 1: Edición exitosa
- [ ] Prueba 2: Vista en AdminDashboard
- [ ] Prueba 3: Vista en AdminReports
- [ ] Prueba 4: Vista en DailyStatsPanel

### Validaciones
- [ ] Prueba 5: Rechaza ventas > 24h
- [ ] Prueba 6: Rechaza ventas canceladas
- [ ] Prueba 7: Rechaza fechas antiguas

### Auditoría
- [ ] Prueba 8: Registra cambios en notas

### Seguridad
- [ ] Prueba 9: Requiere autenticación

### Formato
- [ ] Prueba 10: Fecha en español

### Performance
- [ ] Prueba 11: Carga múltiple

---

## 🐛 Debugging

Si alguna prueba falla, revisar:

### En la consola del navegador (DevTools)
```javascript
// Ver requests API
fetch('/api/ventas')
  .then(r => r.json())
  .then(console.log)

// Ver estado del componente
console.log('fechaEditada state:', fechaEditada)
```

### En el backend (logs)
```bash
# Buscar errores
grep -i "fecha\|error" backend/logs/app.log

# Ver queries SQL
grep -i "UPDATE ventas" backend/logs/app.log
```

### En la BD
```sql
-- Verificar última venta editada
SELECT id, folio, fecha, fecha_actualizacion, notas 
FROM ventas 
ORDER BY fecha_actualizacion DESC 
LIMIT 1;
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Verifica imports**: date-fns debe estar instalado
   ```bash
   npm list date-fns
   ```

2. **Revisa el endpoint**: Debe retornar `200 OK` con `VentaDTO`

3. **Comprueba autenticación**: El token debe ser válido

4. **Consulta logs**: Backend y frontend deben mostrar info útil

---

**Completar todas las pruebas antes de marcar la tarea como "Terminada"**

✅ Estado: Listo para Pruebas
