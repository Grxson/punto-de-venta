# 🎯 RECOMENDACIONES INMEDIATAS: Mejorar Robustez
**Mejoras recomendadas para implementar en próximos días**

---

## 🔴 CRÍTICAS (Implementar YA)

### 1. Agregar manejo de errores en Frontend
**Archivo:** `AdminReports.tsx`  
**Línea:** 140-160

**Cambio recomendado:**
```typescript
// ✨ Cargar gastos detallados para mostrar en GeneralCutTab
try {
  const gastosResponse = await apiService.get(
    `${API_ENDPOINTS.GASTOS}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
  );

  if (gastosResponse.success && gastosResponse.data) {
    const gastosFormateados = gastosResponse.data.map((gasto: any) => ({
      id: gasto.id,
      monto: parseFloat(gasto.monto) || 0,
      categoriaGastoNombre: gasto.categoriaGastoNombre || 'Sin categoría',
      proveedorNombre: gasto.proveedorNombre || 'Sin proveedor',
      nota: gasto.nota || '',
      fecha: gasto.fecha,
    }));
    setGastosDetallados(gastosFormateados);
  } else {
    console.warn('⚠️ Error cargando gastos detallados:', gastosResponse.error);
    setGastosDetallados([]);  // Fallback
  }
} catch (error) {
  console.error('❌ Excepción al cargar gastos:', error);
  setGastosDetallados([]);  // Fallback
}
```

**Por qué:** Si falla la request, el usuario verá gastos vacíos sin saber por qué. El error quedará visible.

---

### 2. Validar sucursalId en Backend
**Archivo:** `EstadisticasService.java`  
**Línea:** 50

**Cambio recomendado:**
```java
public ResumenVentasDiaDTO resumenRango(LocalDateTime desde, LocalDateTime hasta,
                LocalDate fechaRepresentativa) {
    log.info("📊 [EstadisticasService] resumenRango: desde={}, hasta={}, fechaRepresentativa={}", desde,
                    hasta, fechaRepresentativa);
    
    // ✅ VALIDACIÓN CRÍTICA
    Long sucursalId = SucursalContext.getSucursalId();
    if (sucursalId == null) {
        log.error("❌ CRÍTICO: SucursalContext.getSucursalId() retornó NULL");
        throw new UnauthorizedException("No hay sucursal en el contexto del usuario");
    }
    
    // ... resto del código
}
```

**Por qué:** Si `sucursalId` es NULL, la query va a comportarse inesperadamente. Mejor fallar rápido.

---

### 3. Crear índice en BD para Performance
**Ejecutar en Railway:**

```sql
-- Índice para queries de gastos por sucursal y fecha
CREATE INDEX IF NOT EXISTS idx_gasto_sucursal_fecha 
ON gastos(sucursal_id, fecha);

-- Índice para queries de ventas por sucursal y fecha
CREATE INDEX IF NOT EXISTS idx_venta_sucursal_fecha 
ON ventas(sucursal_id, fecha);

-- Verificar que existen:
SELECT indexname, tablename FROM pg_indexes 
WHERE tablename IN ('gastos', 'ventas') 
ORDER BY tablename;
```

**Por qué:** Sin índices, las queries CAST(g.fecha AS DATE) serán lentas con muchos datos.

---

## 🟡 MEDIANAS (Implementar esta semana)

### 4. Agregar Tests Unitarios
**Crear archivo:** `EstadisticasServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
class EstadisticasServiceTest {
    
    @Mock
    private VentaRepository ventaRepository;
    
    @Mock
    private GastoRepository gastoRepository;
    
    @InjectMocks
    private EstadisticasService estadisticasService;
    
    @Test
    void testResumenRangoSumaTodasLasVentasDelRango() {
        // Arrange
        LocalDateTime desde = LocalDateTime.parse("2025-12-15T00:00:00");
        LocalDateTime hasta = LocalDateTime.parse("2025-12-21T23:59:59");
        
        ResumenVentasAggregate mockAgg = new ResumenVentasAggregate(
            BigDecimal.valueOf(11000),  // totalVentas
            BigDecimal.valueOf(2364),   // totalCostos
            33L, 100L                   // cantidadVentas, itemsVendidos
        );
        
        when(ventaRepository.aggregateResumenBySucursal(1L, desde, hasta))
            .thenReturn(mockAgg);
        
        when(gastoRepository.sumMontoByAllTypesAndSucursalAndFechaBetween(1L, desde, hasta))
            .thenReturn(BigDecimal.valueOf(4636));
        
        // Act
        try (var context = mockStatic(SucursalContext.class)) {
            context.when(SucursalContext::getSucursalId).thenReturn(1L);
            ResumenVentasDiaDTO resultado = estadisticasService.resumenRango(desde, hasta, desde.toLocalDate());
            
            // Assert
            assertEquals(BigDecimal.valueOf(11000), resultado.totalVentas());
            assertEquals(BigDecimal.valueOf(4636), resultado.totalGastos());
            assertEquals(BigDecimal.valueOf(6364), resultado.margenBruto());
        }
    }
    
    @Test
    void testGastosNullRetornaCero() {
        // Arrange
        LocalDateTime desde = LocalDateTime.parse("2025-12-15T00:00:00");
        LocalDateTime hasta = LocalDateTime.parse("2025-12-21T23:59:59");
        
        when(ventaRepository.aggregateResumenBySucursal(any(), any(), any()))
            .thenReturn(new ResumenVentasAggregate(BigDecimal.ZERO, BigDecimal.ZERO, 0L, 0L));
        
        when(gastoRepository.sumMontoByAllTypesAndSucursalAndFechaBetween(any(), any(), any()))
            .thenReturn(null);  // Simular NULL
        
        // Act
        try (var context = mockStatic(SucursalContext.class)) {
            context.when(SucursalContext::getSucursalId).thenReturn(1L);
            ResumenVentasDiaDTO resultado = estadisticasService.resumenRango(desde, hasta, desde.toLocalDate());
            
            // Assert
            assertEquals(BigDecimal.ZERO, resultado.totalGastos());
        }
    }
}
```

**Por qué:** Prevenir regresiones si alguien modifica `EstadisticasService`.

---

### 5. Implementar Caché de Reportes
**Archivo:** `EstadisticasService.java`

```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@Slf4j
public class EstadisticasService {
    
    @Cacheable(
        value = "reportes_resumen",
        key = "#sucursalId + '_' + #desde.toLocalDate() + '_' + #hasta.toLocalDate()",
        unless = "#result == null"
    )
    public ResumenVentasDiaDTO resumenRango(LocalDateTime desde, LocalDateTime hasta,
                    LocalDate fechaRepresentativa) {
        // Query que ahora será cacheada
        // ...
    }
    
    // Invalidar caché cuando se crea una venta
    @CacheEvict(value = "reportes_resumen", allEntries = true)
    @Transactional
    public VentaDTO crearVenta(CrearVentaRequest request) {
        // ...
    }
    
    // Invalidar caché cuando se crea un gasto
    @CacheEvict(value = "reportes_resumen", allEntries = true)
    @Transactional
    public GastoDTO crearGasto(CrearGastoRequest request) {
        // ...
    }
}
```

**Configuración en `application.properties`:**
```properties
spring.cache.type=simple
spring.cache.cache-names=reportes_resumen
```

**Por qué:** Si múltiples usuarios de la misma sucursal ven reportes, evita queries duplicadas.

---

### 6. Agregar Monitoreo en Producc...

### 6. Documentar en Swagger
**Agregar a `EstadisticasController.java`:**

```java
@GetMapping("/ventas/rango")
@Operation(
    summary = "Resumen de ventas en rango de fechas",
    description = "Retorna resumen SEGREGADO por sucursal del usuario: ventas totales, gastos, ganancia, etc.",
    parameters = {
        @Parameter(name = "desde", description = "Fecha inicio (ISO 8601)", required = true),
        @Parameter(name = "hasta", description = "Fecha fin (ISO 8601)", required = true)
    },
    responses = {
        @ApiResponse(responseCode = "200", description = "Resumen calculado correctamente"),
        @ApiResponse(responseCode = "401", description = "No autorizado / Sin sucursal en JWT"),
        @ApiResponse(responseCode = "400", description = "Parámetros inválidos")
    }
)
public ResponseEntity<ResumenVentasDiaDTO> resumenRango(...) {
```

**Por qué:** Documentar para que próximos desarrolladores entiendan el comportamiento.

---

## 🟢 BAJAS PRIORIDAD (Implementar cuando haya tiempo)

### 7. Audit Trail para Gastos
```java
@Entity
@Table(name = "gasto_audit")
public class GastoAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long gastoId;
    private String accion;  // CREATE, UPDATE, DELETE
    private Long usuarioId;
    private LocalDateTime timestamp;
    private String cambios;  // JSON de qué cambió
}
```

**Por qué:** Auditoría para cumplimiento regulatorio.

---

### 8. Endpoint Unificado de Reportes
```java
@GetMapping("/resumen-completo")
public ResponseEntity<ResumenCompletoDTO> resumenCompleto(
    @RequestParam LocalDateTime desde,
    @RequestParam LocalDateTime hasta) {
    
    return ResponseEntity.ok(new ResumenCompletoDTO(
        estadisticasService.resumenRango(desde, hasta, desde.toLocalDate()),
        estadisticasService.rendimientoProductosRango(desde, hasta, 10),
        gastoService.obtenerPorRangoFechas(desde, hasta)
    ));
}
```

**Por qué:** Reduce el número de requests frontend → backend.

---

## 📋 TABLA DE PRIORIZACIÓN

| # | Tarea | Prioridad | Esfuerzo | Impacto | Cuándo |
|---|-------|-----------|----------|---------|--------|
| 1 | Manejo de errores en Frontend | 🔴 CRÍTICA | 30 min | 🔴 Alto | HOY |
| 2 | Validar sucursalId en Backend | 🔴 CRÍTICA | 15 min | 🔴 Alto | HOY |
| 3 | Crear índices en BD | 🔴 CRÍTICA | 5 min | 🔴 Alto | HOY |
| 4 | Tests unitarios | 🟡 MEDIA | 2 horas | 🟡 Medio | Esta semana |
| 5 | Implementar Caché | 🟡 MEDIA | 1 hora | 🟢 Bajo | Próxima semana |
| 6 | Documentar en Swagger | 🟡 MEDIA | 30 min | 🟢 Bajo | Próxima semana |
| 7 | Audit Trail | 🟢 BAJA | 3 horas | 🟢 Bajo | Mes que viene |
| 8 | Endpoint Unificado | 🟢 BAJA | 1 hora | 🟡 Medio | Mes que viene |

---

## ✅ CHECKLIST ANTES DE MERGEAR CAMBIOS FUTUROS

Antes de mergear cualquier cambio que afecte reportes o gastos:

- [ ] Ejecutar `./mvnw clean test` (pasar todos los tests)
- [ ] Verificar que Corte General muestra gastos correctos
- [ ] Cambiar de sucursal y verificar segregación
- [ ] Revisar logs en backend (buscar advertencias/errores)
- [ ] Medir performance (< 2 segundos para cargar reportes)
- [ ] Actualizar documentación si cambió lógica

---

**Documento creado:** 20 de Diciembre 2025
