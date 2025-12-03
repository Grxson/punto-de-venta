# ✅ Verificación Rápida - Checklist de Implementación

## 🎯 Objetivo
Validar que todos los cambios están en lugar y funcionan sin errores de compilación.

---

## 1️⃣ Backend - Verificar Compilación

```bash
# 1. Navegar al backend
cd backend

# 2. Limpiar y compilar
./mvnw clean compile

# 3. Resultado esperado
# [INFO] BUILD SUCCESS
```

**Si hay errores**:
- [ ] Verificar que VentaService.java tiene el método `actualizarFechaVenta()`
- [ ] Verificar que VentaController.java tiene el endpoint `PUT /{id}/fecha`
- [ ] Revisar importes de LocalDateTime

**Checklist**:
- [ ] Compilación exitosa (BUILD SUCCESS)
- [ ] Sin warnings o errores de sintaxis
- [ ] Imports correctos

---

## 2️⃣ Frontend - Verificar Imports

```bash
# 1. Navegar al frontend
cd frontend-web

# 2. Verificar que date-fns está instalado
npm list date-fns

# Resultado esperado:
# └── date-fns@3.x.x
```

**Si no está instalado**:
```bash
npm install date-fns
```

**Checklist**:
- [ ] date-fns instalado
- [ ] Versión >= 3.0.0
- [ ] Locale español disponible

---

## 3️⃣ Verificar Archivos Frontend

### AdminSales.tsx
```bash
grep -n "fechaEditada" frontend-web/src/pages/admin/AdminSales.tsx
grep -n "datetime-local" frontend-web/src/pages/admin/AdminSales.tsx
```

**Esperado**: 
- ✅ Multiple matches para "fechaEditada"
- ✅ TextField con type="datetime-local"

### AdminDashboard.tsx
```bash
grep -n "format.*fecha.*MMMM" frontend-web/src/pages/admin/AdminDashboard.tsx
```

**Esperado**:
- ✅ 1 match para format de fecha
- ✅ Usa locale: es

### AdminReports.tsx
```bash
grep -n "format.*MMMM" frontend-web/src/pages/admin/AdminReports.tsx
```

**Esperado**:
- ✅ 1+ matches para format de fechas

### DailyStatsPanel.tsx
```bash
grep -n "format.*fecha.*MMMM" frontend-web/src/components/DailyStatsPanel.tsx
```

**Esperado**:
- ✅ 1 match para format de fecha

---

## 4️⃣ Verificar Archivos Backend

### VentaService.java
```bash
grep -n "actualizarFechaVenta" backend/src/main/java/com/puntodeventa/backend/service/VentaService.java
```

**Esperado**:
- ✅ 1 definition (public VentaDTO actualizarFechaVenta...)
- ✅ Contiene validaciones de 24 horas

### VentaController.java
```bash
grep -n "PUT.*fecha\|/fecha" backend/src/main/java/com/puntodeventa/backend/controller/VentaController.java
```

**Esperado**:
- ✅ @PutMapping endpoint para /{id}/fecha
- ✅ Decorado con @PreAuthorize

---

## 5️⃣ Iniciar Backend

```bash
# En la terminal del backend
./mvnw spring-boot:run

# Esperar a ver:
# Started... in X seconds
# Server running on http://localhost:8080
```

**Checklist**:
- [ ] Backend arranca sin errores
- [ ] Puerto 8080 disponible
- [ ] Logs no muestran excepciones

---

## 6️⃣ Iniciar Frontend

```bash
# En otra terminal, en frontend-web
npm start

# Esperar a ver:
# ✔ The app is now running at: http://localhost:3000
```

**Checklist**:
- [ ] Frontend arranca sin errores
- [ ] Puerto 3000 disponible
- [ ] No hay errores en consola del navegador

---

## 7️⃣ Prueba Rápida en AdminSales

1. Abre: `http://localhost:3000`
2. Autentícate
3. Navega a **Admin → Ventas**
4. Busca el botón de editar (lápiz) en cualquier venta
5. Haz clic en editar

**Esperado**:
- ✅ Modal se abre
- ✅ Hay un campo llamado "Fecha" con calendario
- ✅ Hay un warning sobre 24 horas
- ✅ Hay botón "Guardar"

---

## 8️⃣ Prueba Rápida en AdminDashboard

1. Navega a **Admin → Dashboard**
2. Busca la card **"Resumen del Día"**

**Esperado**:
- ✅ En la esquina superior derecha hay una fecha
- ✅ Formato: "día dd de mes" (en español)
- ✅ Ejemplo: "miércoles 03 de diciembre"

---

## 9️⃣ Prueba Rápida en AdminReports

1. Navega a **Admin → Reportes**
2. Busca la card **"Resumen del Período Seleccionado"**

**Esperado**:
- ✅ En la esquina superior derecha hay un rango de fechas
- ✅ Formato: "día1 dd de mes - día2 dd de mes"
- ✅ Ejemplo: "lunes 01 de diciembre - viernes 05 de diciembre"

---

## 🔟 Prueba API Directa (Curl)

```bash
# 1. Obtener token de autenticación
# (Esto depende de cómo autentiques en tu API)

# 2. Intentar editar una venta
curl -X PUT \
  'http://localhost:8080/api/ventas/1/fecha?fecha=2024-12-04T10:00:00' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'

# Resultado esperado: VentaDTO con fecha actualizada
# {
#   "id": 1,
#   "fecha": "2024-12-04T10:00:00",
#   ...
# }
```

---

## ✅ Checklist Final

Marca como completado cuando hayas verificado:

### Compilación
- [ ] Backend compila sin errores
- [ ] date-fns instalado en frontend
- [ ] No hay errores de importes

### Archivos
- [ ] AdminSales.tsx tiene fechaEditada
- [ ] AdminDashboard.tsx tiene formato de fecha
- [ ] AdminReports.tsx tiene rango de fechas
- [ ] DailyStatsPanel.tsx tiene fecha en header
- [ ] VentaService.java tiene actualizarFechaVenta()
- [ ] VentaController.java tiene endpoint PUT

### Ejecución
- [ ] Backend arranca en puerto 8080
- [ ] Frontend arranca en puerto 3000
- [ ] No hay excepciones en logs

### Pruebas Visuales
- [ ] Campo fecha en AdminSales
- [ ] Fecha visible en AdminDashboard
- [ ] Rango de fechas en AdminReports
- [ ] Fecha en DailyStatsPanel

### API
- [ ] Endpoint PUT /api/ventas/{id}/fecha responde 200

---

## 🐛 Troubleshooting

### Error: "date-fns not found"
```bash
npm install date-fns
npm install --save-dev @types/date-fns  # Si usas TypeScript
```

### Error: "Cannot find symbol actualizarFechaVenta"
- [ ] Verificar que el método está en VentaService
- [ ] Ejecutar `mvnw clean compile` nuevamente
- [ ] Revisar que no hay typos en el nombre

### Error: "Field 'fecha' no existe"
- [ ] Verificar que Venta.java tiene la propiedad fecha
- [ ] Revisar los getters/setters

### Frontend no ve cambios
- [ ] Hacer Hard Refresh: Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)
- [ ] Limpiar caché: DevTools → Application → Clear site data

### API retorna 401
- [ ] Verificar que estás autenticado
- [ ] Revisar que el token está siendo enviado en headers

---

## 📊 Estado Esperado

Después de completar todo:

```
✅ Backend compilado exitosamente
✅ Frontend ejecutándose sin errores
✅ Fecha editable en AdminSales
✅ Fecha visible en AdminDashboard
✅ Rango visible en AdminReports
✅ Fecha en DailyStatsPanel
✅ API responde correctamente
✅ Validaciones funcionan
✅ Formato español correcto
✅ Listo para pruebas completas
```

---

## 📞 Si Algo Falla

1. **Revisa los logs**: Busca mensajes de error
2. **Verifica los archivos**: Confirma que los cambios están presentes
3. **Limpia y reconstruye**: `mvnw clean compile` / `npm clean-install`
4. **Reinicia servicios**: Backend y frontend

---

**Tiempo estimado**: 10-15 minutos  
**Complejidad**: Baja (solo verificación)  
**Riesgo**: Muy bajo

Cuando todo esté ✅, estás listo para la guía de pruebas completa.
