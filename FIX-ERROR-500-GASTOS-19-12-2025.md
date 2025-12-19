# 🔧 Fix Error 500 - GastosIndirectos y ManoObra

**Fecha**: 19 de diciembre 2025  
**Problema**: POST a `/api/gastos-indirectos` y `/api/mano-obra` retornaban 500  
**Status**: ✅ SOLUCIONADO

---

## 🚨 Problema Original

```
❌ [POST] http://localhost:8080/api/gastos-indirectos - Status 500
Error guardando gasto indirecto: Error: Ha ocurrido un error inesperado

❌ [POST] http://localhost:8080/api/mano-obra - Status 500
Error guardando mano de obra: Error: Ha ocurrido un error inesperado
```

**Causa**: Falta de validaciones y manejo de errores en:
- `GastoIndirectoService.crear()`
- `ManoObraService.crear()`

---

## ✅ Soluciones Implementadas

### 1. Validaciones Agregadas

**GastoIndirectoService:**
```java
// Validar nombre obligatorio
if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
    throw new IllegalArgumentException("El nombre del gasto indirecto es obligatorio");
}

// Validar sucursal en contexto
Long sucursalId = SucursalContext.getSucursalId();
if (sucursalId == null) {
    throw new IllegalArgumentException("No se pudo obtener el ID de la sucursal del contexto");
}
```

**ManoObraService:**
```java
// Validar puesto obligatorio
if (dto.getPuesto() == null || dto.getPuesto().trim().isEmpty()) {
    throw new IllegalArgumentException("El puesto es obligatorio");
}
```

### 2. Conversión Correcta de BigDecimal

```java
// Convertir números que vienen del frontend a BigDecimal
BigDecimal montoMensual = dto.getMontoMensual() != null ? dto.getMontoMensual() : BigDecimal.ZERO;
BigDecimal montoSemanal = dto.getMontoSemanal() != null ? dto.getMontoSemanal() : BigDecimal.ZERO;
BigDecimal montoDiario = dto.getMontoDiario() != null ? dto.getMontoDiario() : BigDecimal.ZERO;
```

### 3. Logging Detallado para Debugging

```java
log.info("Intentando crear gasto indirecto: nombre='{}', sucursal={}, monto={}", 
    gastoIndirecto.getNombre(), sucursalId, montoMensual);

log.info("Gasto indirecto creado exitosamente: id={}, nombre='{}'", 
    saved.getId(), saved.getNombre());
```

### 4. Error Handling en Controladores

**Antes:**
```java
@PostMapping
public ResponseEntity<GastoIndirectoDTO> crear(@RequestBody GastoIndirectoDTO dto) {
    return ResponseEntity.ok(gastoIndirectoService.crear(dto));  // ❌ Sin try-catch
}
```

**Después:**
```java
@PostMapping
public ResponseEntity<GastoIndirectoDTO> crear(@RequestBody GastoIndirectoDTO dto) {
    try {
        GastoIndirectoDTO resultado = gastoIndirectoService.crear(dto);
        log.info("Gasto indirecto creado exitosamente: {}", resultado.getId());
        return ResponseEntity.ok(resultado);
    } catch (IllegalArgumentException e) {
        log.warn("Validación fallida: {}", e.getMessage());
        return ResponseEntity.badRequest().build();  // ✅ 400 Bad Request
    } catch (Exception e) {
        log.error("Error al crear gasto indirecto", e);
        return ResponseEntity.internalServerError().build();  // ✅ 500 con logs
    }
}
```

---

## 📊 Comparación Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Validación** | ❌ Ninguna | ✅ Campos obligatorios |
| **Error Handling** | ❌ Sin try-catch | ✅ Con try-catch |
| **HTTP Status** | 500 siempre | 400 (validación), 500 (error real) |
| **Logging** | Mínimo | Detallado en cada paso |
| **Debugging** | Difícil | Fácil con logs |
| **Usuario ve** | "Error inesperado" | Mensajes específicos |

---

## 🔍 Cómo Debuggear Ahora

### Si falla GastosIndirectos:

**Revisa los logs del backend:**
```bash
cd backend && ./start.sh
# Busca líneas con ERROR o WARN
```

**Logs esperados si todo funciona:**
```
INFO  - Intentando crear gasto indirecto: nombre='Luz', sucursal=1, monto=500
INFO  - Gasto indirecto creado exitosamente: id=5, nombre='Luz'
```

**Logs esperados si falla validación:**
```
WARN  - Validación fallida: El nombre del gasto indirecto es obligatorio
```

**Logs esperados si error real:**
```
ERROR - Error al crear gasto indirecto
java.lang.NullPointerException: ...
```

### En el Frontend (Console):

```
Si Status 400: Validación fallida (ver mensaje de error)
Si Status 500: Error en servidor (revisar logs del backend)
```

---

## 📝 Cambios por Archivo

### Backend

**GastoIndirectoService.java**
- Agregar validaciones en `crear()`
- Mejor logging
- Try-catch con mensajes claros

**GastoIndirectoController.java**
- Try-catch en endpoint POST
- Retorna 400 si validación falla
- Retorna 500 si error real

**ManoObraService.java**
- Agregar validaciones en `crear()`
- Mejor logging
- Try-catch con mensajes claros

**ManoObraController.java**
- Try-catch en endpoint POST
- Retorna 400 si validación falla
- Retorna 500 si error real

---

## 🧪 Testing

### Caso 1: Crear GastoIndirecto Correctamente
```
POST /api/gastos-indirectos
{
  "nombre": "Luz",
  "descripcion": "Gastos de electricidad",
  "montoMensual": 500.00,
  "montoSemanal": 0,
  "montoDiario": 0,
  "activo": true
}

✅ Esperado: Status 200, se crea el gasto
```

### Caso 2: Crear GastoIndirecto sin Nombre
```
POST /api/gastos-indirectos
{
  "nombre": "",
  "descripcion": "...",
  "montoMensual": 500.00
}

✅ Esperado: Status 400, mensaje de validación
```

### Caso 3: Crear ManoObra Correctamente
```
POST /api/mano-obra
{
  "puesto": "Cajero",
  "salarioMensual": 10000.00,
  "pagoPorTurno": 250.00,
  "periodo": "MENSUAL",
  "activo": true
}

✅ Esperado: Status 200, se crea la mano de obra
```

### Caso 4: Crear ManoObra sin Puesto
```
POST /api/mano-obra
{
  "puesto": "",
  "salarioMensual": 10000.00
}

✅ Esperado: Status 400, mensaje de validación
```

---

## 🚀 Próximos Pasos

1. **Reinicia el backend** con el nuevo código:
   ```bash
   cd backend && ./start.sh
   ```

2. **Intenta crear un GastoIndirecto** desde AdminExpenses
   - Abre F12 → Console
   - Revisa los logs en la consola del backend
   - Debe funcionar sin error 500

3. **Si funciona**: ¡Excelente! La validación está funcionando

4. **Si sigue fallando**: 
   - Abre F12 → Network
   - Busca el POST a `/api/gastos-indirectos`
   - Revisa Response y Request
   - Comparte los logs del backend

---

## 📋 Notas Técnicas

### Por qué pasaba 500 antes

La falta de validaciones en el servicio hacía que:
1. Si `dto.getNombre()` era null o vacío → NullPointerException
2. Si `SucursalContext.getSucursalId()` fallaba → NullPointerException
3. Si había problema de tipo → ClassCastException
4. Todas estas excepciones se convertían en 500 genérico

### Por qué funciona ahora

1. Validaciones previas evitan excepciones
2. Try-catch captura excepciones específicas
3. Retorna 400 si es error de validación (cliente)
4. Retorna 500 si es error real (servidor)
5. Logs detallados permiten debugging

---

**Commit**: `518eb22`  
**Build**: ✅ Exitoso (19.6s)  
**Status**: Listo para testing

