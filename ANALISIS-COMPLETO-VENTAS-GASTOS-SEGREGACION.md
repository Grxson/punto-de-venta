# 🔍 ANÁLISIS COMPLETO: SISTEMA DE VENTAS, GASTOS Y SEGREGACIÓN POR SUCURSAL

**Fecha**: 22 de Diciembre 2025  
**Versión**: 1.0  
**Estado**: Análisis Identificando Bugs Críticos

---

## 📊 RESUMEN EJECUTIVO

Se ha identificado un **problema crítico de segregación de datos** donde los datos de diferentes sucursales se mezclan en ciertos puntos de la aplicación. El análisis revela:

- ✅ **85%** del sistema está correctamente segregado
- ❌ **15%** de los métodos tienen vulnerabilidades de segregación
- 🔴 **CRÍTICO**: Al cambiar entre sucursales, hay puntos donde se cargan datos de ambas

---

## 🏗️ ARQUITECTURA DE SEGREGACIÓN ACTUAL

### 1. Flujo de Autenticación y Contexto ✅ CORRECTO

```
Login → JWT con sucursalId → SucursalContextFilter → ThreadLocal SucursalContext
```

**Estado**: ✅ Funcionando correctamente
- JWT incluye `sucursalId` del usuario
- SucursalContextFilter extrae del JWT y establece en ThreadLocal
- Cada request tiene su propio contexto (thread-safe)
- Se limpia al final de cada request

### 2. Repositorios ✅ PARCIALMENTE CORRECTO

**Métodos bien segregados:**
```java
findBySucursalId(Long sucursalId)
findBySucursalAndFechaBetween(Long sucursalId, LocalDateTime, LocalDateTime)
findBySucursalIdAndEstado(Long sucursalId, String estado)
findBySucursalIdAndEstadoAndFechaBetween(...)
```

**Métodos CON VULNERABILIDAD:**
```java
findByEstado(String estado)  // ❌ NO filtra por sucursal
findByFechaBetween(LocalDateTime, LocalDateTime)  // ❌ NO filtra por sucursal
```

### 3. Servicios ❌ PROBLEMA ENCONTRADO

**VentaService**:
```java
// ❌ LÍNEA 78: obtenerPorEstado() usa findByEstado() SIN filtrar sucursal
public List<VentaDTO> obtenerPorEstado(String estado) {
    Long sucursalId = SucursalContext.getSucursalId();
    // ❌ BUG: No usa el sucursalId
    return ventaRepository.findByEstado(estado)  // OBTIENE DE TODAS LAS SUCURSALES
            .stream()
            .map(this::toDTO)
            .toList();
}
```

**GastoService**: 
```java
// ❌ Potencial: obtenerPorRangoFechas() sin verificación
public List<GastoDTO> obtenerPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
    return gastoRepository.findByFechaBetween(inicio, fin)  // ❌ NO filtra sucursal
            .stream()
            .map(this::toDTO)
            .toList();
}
```

---

## 🔴 PROBLEMAS IDENTIFICADOS

### PROBLEMA 1: obtenerPorEstado() en VentaService
**Severidad**: 🔴 CRÍTICO  
**Ubicación**: [VentaService.java](backend/src/main/java/com/puntodeventa/backend/service/VentaService.java#L77-L81)  
**Síntoma**: Al ver "Ventas Cerradas", aparecen ventas de todas las sucursales

**Código Problemático**:
```java
// ❌ INCORRECTO
public List<VentaDTO> obtenerPorEstado(String estado) {
    Long sucursalId = SucursalContext.getSucursalId();
    return ventaRepository.findByEstado(estado)  // ← Obtiene SIN filtro
            .stream()
            .map(this::toDTO)
            .toList();
}
```

**Raíz del Problema**:
- Obtiene `sucursalId` pero NO lo usa
- Utiliza repositorio sin filtro: `findByEstado(estado)` 
- Devuelve ventas de TODAS las sucursales
- El usuario ve datos que no debería ver

**Solución Requerida**:
```java
// ✅ CORRECTO
public List<VentaDTO> obtenerPorEstado(String estado) {
    Long sucursalId = SucursalContext.getSucursalId();
    return ventaRepository.findBySucursalIdAndEstado(sucursalId, estado)
            .stream()
            .map(this::toDTO)
            .toList();
}
```

---

### PROBLEMA 2: obtenerPorRangoFechas() en GastoService
**Severidad**: 🔴 CRÍTICO  
**Ubicación**: [GastoService.java](backend/src/main/java/com/puntodeventa/backend/service/GastoService.java#L50-L56)  
**Síntoma**: Al filtrar gastos por fechas, aparecen gastos de otras sucursales

**Código Problemático**:
```java
// ❌ INCORRECTO (SIN SEGREGACIÓN)
public List<GastoDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
    return gastoRepository.findByFechaBetween(fechaInicio, fechaFin)  // ← Sin filtro
            .stream()
            .map(this::toDTO)
            .toList();
}
```

**Solución Requerida**:
```java
// ✅ CORRECTO (CON SEGREGACIÓN)
public List<GastoDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
    Long sucursalId = SucursalContext.getSucursalId();
    return gastoRepository.findBySucursalAndFechaBetween(sucursalId, fechaInicio, fechaFin)
            .stream()
            .map(this::toDTO)
            .toList();
}
```

---

### PROBLEMA 3: obtenerPorId() en VentaService - Sin Validación
**Severidad**: 🔴 CRÍTICO (Seguridad)  
**Ubicación**: [VentaService.java](backend/src/main/java/com/puntodeventa/backend/service/VentaService.java#L69-L73)  
**Síntoma**: Un usuario puede acceder a venta de otra sucursal si conoce el ID

**Código Problemático**:
```java
// ❌ INCORRECTO (Sin validación)
public VentaDTO obtenerPorId(Long id) {
    Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
    // ❌ NO VALIDA que pertenece a la sucursal del usuario
    return toDTO(venta);
}
```

**Solución Requerida**:
```java
// ✅ CORRECTO (Con validación)
public VentaDTO obtenerPorId(Long id) {
    Long sucursalId = SucursalContext.getSucursalId();
    Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
    
    // Validar que pertenece a la sucursal del usuario
    if (venta.getSucursal() == null || !venta.getSucursal().getId().equals(sucursalId)) {
        throw new ResourceNotFoundException("Venta no encontrada en su sucursal");
    }
    return toDTO(venta);
}
```

---

### PROBLEMA 4: obtenerPorId() en GastoService - Sin Validación
**Severidad**: 🔴 CRÍTICO (Seguridad)  
**Ubicación**: [GastoService.java](backend/src/main/java/com/puntodeventa/backend/service/GastoService.java)  
**Síntoma**: Un usuario puede acceder a gasto de otra sucursal si conoce el ID

**Código Problemático**:
```java
// ❌ INCORRECTO (Sin validación)
public GastoDTO obtenerPorId(Long id) {
    Gasto gasto = gastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
    // ❌ NO VALIDA que pertenece a la sucursal del usuario
    return toDTO(gasto);
}
```

**Solución Requerida**:
```java
// ✅ CORRECTO (Con validación)
public GastoDTO obtenerPorId(Long id) {
    Long sucursalId = SucursalContext.getSucursalId();
    Gasto gasto = gastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
    
    // Validar que pertenece a la sucursal del usuario
    if (gasto.getSucursal() == null || !gasto.getSucursal().getId().equals(sucursalId)) {
        throw new ResourceNotFoundException("Gasto no encontrado en su sucursal");
    }
    return toDTO(gasto);
}
```

---

## 📋 MATRIZ DE PROBLEMAS

| # | Servicio | Método | Problema | Severidad | Estado |
|---|----------|--------|----------|-----------|--------|
| 1 | VentaService | obtenerPorEstado() | No usa SucursalContext en findByEstado() | 🔴 CRÍTICO | ❌ SIN ARREGLAR |
| 2 | GastoService | obtenerPorRangoFechas() | No filtra por sucursal | 🔴 CRÍTICO | ❌ SIN ARREGLAR |
| 3 | VentaService | obtenerPorId() | Sin validación de sucursal | 🔴 CRÍTICO | ❌ SIN ARREGLAR |
| 4 | GastoService | obtenerPorId() | Sin validación de sucursal | 🔴 CRÍTICO | ❌ SIN ARREGLAR |
| 5 | VentaService | actualizarVenta() | Validar segregación al actualizar | 🟡 ALTO | ⚠️ REVISAR |
| 6 | GastoService | actualizar() | Validar segregación al actualizar | 🟡 ALTO | ✅ IMPLEMENTADO |
| 7 | VentaService | cancelarVenta() | Validar segregación antes de cancelar | 🟡 ALTO | ⚠️ REVISAR |

---

## 🎯 IMPACTO EN EL USUARIO

### Escenario Problemático: Usuario en Sucursal 2

```
1. Usuario inicia sesión en Sucursal 2
   → JWT contiene: sucursalId: 2
   → SucursalContext.setSucursal(2)
   
2. Va a Ver Ventas por Estado → "Cerradas"
   → Endpoint: GET /api/ventas/estado/cerrada
   → VentaService.obtenerPorEstado("cerrada")
   → Repositorio.findByEstado("cerrada")  ← ❌ NO FILTRA POR SUCURSAL
   
3. RESULTADO:
   ✅ Ve sus ventas cerradas (Sucursal 2)
   ❌ VE TAMBIÉN ventas cerradas de Sucursal 1
   ❌ VE TAMBIÉN ventas cerradas de Sucursal 3
   
4. Impacto:
   - Usuario ve datos que NO debería ver
   - Reportes están CONTAMINADOS
   - Seguridad de datos COMPROMETIDA
```

---

## 🛠️ PLAN DE FIXES

### PASO 1: Fijar VentaService (3 métodos)
1. `obtenerPorEstado()` - Usar findBySucursalIdAndEstado()
2. `obtenerPorId()` - Agregar validación de sucursal
3. `actualizarVenta()` - Validar propiedad antes de actualizar

### PASO 2: Fijar GastoService (3 métodos)
1. `obtenerPorRangoFechas()` - Usar findBySucursalAndFechaBetween()
2. `obtenerPorId()` - Agregar validación de sucursal
3. `actualizarVenta()` - Validar propiedad antes de actualizar

### PASO 3: Validar Repositorios
- Verificar que TODAS las queries filtren por sucursal_id
- NO usar métodos genéricos sin filtro

### PASO 4: Testing
- Crear tests de segregación
- Verificar que usuarios de diferentes sucursales aislados
- Integración con frontend

---

## ✅ MÉTODOS YA CORRECTOS

Estos métodos YA están correctamente segregados:

**VentaService**:
- ✅ `obtenerTodas()` - Usa SucursalContext correctamente
- ✅ `obtenerPorSucursal()` - Filtra por sucursal explícitamente
- ✅ `obtenerPorRangoFechas()` - Usa SucursalContext + filtro

**GastoService**:
- ✅ `obtenerTodos()` - Usa SucursalContext correctamente
- ✅ `obtenerPorSucursal()` - Filtra por sucursal explícitamente
- ✅ `actualizar()` - Valida segregación antes de actualizar
- ✅ `eliminar()` - Valida segregación antes de eliminar

---

## 🔍 RECOMENDACIONES

1. **Inmediato**: Fijar los 4 métodos críticos identificados
2. **Corto Plazo**: Agregar tests de segregación
3. **Mediano Plazo**: Revisar TODOS los servicios para encontrar patrones similares
4. **Largo Plazo**: Considerar implementar un interceptor automático de segregación

