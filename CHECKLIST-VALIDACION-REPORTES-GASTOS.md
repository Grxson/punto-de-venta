# ✅ CHECKLIST RÁPIDO: Validación de Reportes y Gastos
**Usar este checklist para verificar que los reportes funcionan correctamente después de cambios**

---

## 🚀 VERIFICACIÓN RÁPIDA (5 MINUTOS)

### [ ] 1. Backend compila sin errores
```bash
cd backend && ./mvnw clean compile
```
✅ Expected: `BUILD SUCCESS`

### [ ] 2. Backend inicia correctamente
```bash
cd backend && ./start.sh
```
✅ Expected: `The application has started successfully`

### [ ] 3. Frontend carga sin errores de TypeScript
```bash
cd frontend-web && npm run build
```
✅ Expected: Sin errores de compilación

### [ ] 4. Abrir Corte General (sin filtros)
- Navegar a: Reportes → Corte General
- Período: Última semana
✅ Expected: Se carga en < 3 segundos

### [ ] 5. Verificar que Gastos muestra cifra (no $0.00)
- Buscar fila "Gastos" en Corte General
✅ Expected: `$XXXX.00` (número positivo, NO $0.00)

### [ ] 6. Expandir Gastos para ver detalles
- Hacer clic en "Gastos -" para expandir
✅ Expected: Aparecen categorías y proveedores

### [ ] 7. Cambiar rango de fechas
- Filtrar por fecha diferente (ej: mes anterior)
✅ Expected: Gastos se actualizan dinámicamente

### [ ] 8. Cambiar de sucursal (si hay múltiples)
- Login como otro usuario de sucursal diferente
- Abrir Corte General
✅ Expected: Gastos de la otra sucursal (NO los de sucursal 1)

### [ ] 9. Verificar logs del backend
- Buscar en terminal del backend: `Gastos query result:`
✅ Expected: Se ve el valor de gastos en logs

### [ ] 10. Verificar cálculos
- Ganancia Neta = Venta Total - Gastos
✅ Expected: Cifra coincide con cálculo manual

---

## 🔧 SI ALGO FALLA

### Gastos sigue mostrando $0.00
**Paso 1:** Verificar logs del backend
```bash
# Buscar en terminal:
grep "Gastos query result" <logs>
```
- Si muestra `0`: Query del backend está retornando 0
- Si no aparece el log: Endpoint no se está ejecutando

**Paso 2:** Verificar que frontend envía request correctamente
```bash
# En consola del navegador (F12):
# Network → Buscar `/api/finanzas/gastos/rango`
```
- ¿La request existe? Si no → verificar AdminReports.tsx
- ¿Status 200? Si no → verificar backend logs

**Paso 3:** Verificar BD directamente
```sql
SELECT COUNT(*), SUM(monto) FROM gastos 
WHERE sucursal_id = 1 AND fecha >= '2025-12-15' AND fecha <= '2025-12-21';
```
- ¿Retorna 0? El dato no está en BD
- ¿Retorna cifra? El dato existe pero query está mal

### Gastos vacíos en expandible
**Causa:** `gastosDetallados` está vacío  
**Solución:** Verificar que la request a `/finanzas/gastos/rango` retorna datos

### Performance lento (> 5 segundos)
**Causa:** Probablemente N+1 queries en Hibernate  
**Solución:**
1. Verificar logs: ¿Cuántas queries se ejecutan?
2. Si > 5 queries por gasto: hay N+1
3. Agregar `@EntityGraph` en repository

### Error 403 o 401
**Causa:** JWT no contiene `sucursalId`  
**Solución:** Verificar que el usuario tiene sucursal asignada

---

## 📊 VALORES ESPERADOS (SEMANA 15-21 DIC)

| Métrica | Sucursal 1 | Sucursal 2 |
|---------|-----------|-----------|
| Ventas Total | $11,000.00 | $0.00 |
| Gastos | $4,636.00 | $0.00 |
| Ganancia Neta | $6,364.00 | $0.00 |

Si los valores son diferentes, verificar que el rango de fechas es correcto.

---

## 🔐 PRUEBAS DE SEGURIDAD

### [ ] Verificar segregación de sucursal
```bash
# Terminal 1: Login como sucursal 1
curl -X GET "http://localhost:8080/api/finanzas/gastos/rango?desde=...&hasta=..." \
  -H "Authorization: Bearer <JWT_SUCURSAL_1>"

# Terminal 2: Login como sucursal 2
curl -X GET "http://localhost:8080/api/finanzas/gastos/rango?desde=...&hasta=..." \
  -H "Authorization: Bearer <JWT_SUCURSAL_2>"
```
✅ Expected: Resultados diferentes por sucursal

### [ ] Intentar acceder a gasto de otra sucursal
```bash
curl -X DELETE "http://localhost:8080/api/finanzas/gastos/999" \
  -H "Authorization: Bearer <JWT_SUCURSAL_1>"
```
✅ Expected: Si gasto pertenece a sucursal 2 → 404

---

## 📝 REGISTRO DE CAMBIOS

Documentar aquí cualquier cambio que afecte reportes o gastos:

| Fecha | Cambio | Archivo | Status |
|-------|--------|---------|--------|
| 2025-12-20 | Agregada carga de gastos detallados | AdminReports.tsx | ✅ OK |
| 2025-12-20 | Implementado SLF4J logging | EstadisticasService.java | ✅ OK |
| 2025-12-20 | Agregado CAST a DATE en query | GastoRepository.java | ✅ OK |

---

**Última actualización:** 20 de Diciembre 2025
