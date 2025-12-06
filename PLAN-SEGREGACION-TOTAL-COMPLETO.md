# 🎯 PLAN COMPLETO: Segregación Total de Datos por Sucursal

## Estado Actual
- ✅ JWT con sucursalId
- ✅ GastoService filtra por sucursal
- ⏳ TODO: Productos, Ventas, Inventario, Reportes, Frontend POS

## 🏗️ Arquitectura de Creación Automática

### Patrón a Implementar en TODOS los servicios:

```java
// PATRÓN: Crear recurso CON sucursal_id automático del usuario

@Transactional
public VentaDTO crear(CrearVentaRequest request) {
    // 1. Obtener sucursal del usuario actual
    Long sucursalId = SucursalContext.getSucursalId();
    
    // 2. Crear entidad
    Venta venta = Venta.builder()
        .usuario(usuario)
        .sucursal(sucursalRepository.findById(sucursalId).orElseThrow())
        .monto(request.monto())
        .fecha(LocalDateTime.now())
        .build();
    
    // 3. Guardar
    return toDTO(ventaRepository.save(venta));
}
```

---

## 📋 Lista de Servicios a Modificar

### 🔴 CRÍTICO (POS - Venta Directa)

| Servicio | Métodos Críticos | Cambio |
|----------|-----------------|--------|
| **VentaService** | crear(), obtenerTodas(), obtenerPorRangoFechas(), actualizar(), cancelar() | Filtrar por sucursal + guardar sucursal_id automático |
| **CarritoService** | crearVenta(), procesarVenta() | Guardar venta con sucursal_id del usuario |
| **ProductoService** | obtenerTodos(), obtenerEnMenu(), buscar() | Filtrar por sucursal actual |
| **DescuentoService** | obtenerPorProducto(), aplicarDescuento() | Filtrar por sucursal |

### 🟠 ALTA (Admin - Gastos)

| Servicio | Métodos Críticos | Cambio |
|----------|-----------------|--------|
| **GastoService** | ✅ YA HECHO | obtenerTodos(), crear() con sucursal automático |
| **InventarioMovimientoService** | obtenerTodos(), crear() | Filtrar + guardar sucursal_id automático |
| **MermaService** | obtenerTodos(), crear() | Filtrar + guardar sucursal_id automático |
| **CompraService** | obtenerTodas(), crear() | Filtrar + guardar sucursal_id automático |

### 🟡 MEDIA (Admin - Reportes)

| Servicio | Métodos Críticos | Cambio |
|----------|-----------------|--------|
| **DashboardService** | obtenerEstadisticas(), obtenerKPIs() | Filtrar por sucursal |
| **ReporteService** | reporteVentas(), reporteGastos(), reporteInventario() | Filtrar por sucursal |
| **CorteService** | obtenerCortesActuales(), generarCorte() | Filtrar por sucursal + crear con sucursal_id |

### 🟢 BAJA (Admin - Catálogos)

| Servicio | Métodos Críticos | Cambio |
|----------|-----------------|--------|
| **UsuarioServicio** | obtenerPorSucursal() | ✅ YA HECHO |
| **ProductoRepository** | findBySucursalId() | Agregar método si no existe |
| **CategoriaProductoRepository** | findBySucursalId() | Agregar método si no existe |

---

## 🛠️ FASE 1: Repositories con findBySucursalId()

### Archivos a Modificar:

```
✅ GastoRepository - YA TIENE: findBySucursalId(), findBySucursalAndFechaBetween()
✅ UsuarioRepository - YA TIENE: findBySucursalId()
⏳ ProductoRepository - AGREGAR: findBySucursalId(), findBySucursalIdAndEnMenu()
⏳ VentaRepository - AGREGAR: findBySucursalId(), findBySucursalIdAndFechaBetween()
⏳ InventarioMovimientoRepository - AGREGAR: findBySucursalId()
⏳ MermaRepository - AGREGAR: findBySucursalId()
⏳ CompraRepository - AGREGAR: findBySucursalId()
⏳ DescuentoRepository - AGREGAR: findBySucursalId()
⏳ CorteRepository - AGREGAR: findBySucursalId(), findBySucursalIdOrderByFechaDesc()
```

### Patrón para cada Repository:

```java
// EJEMPLO: ProductoRepository
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findBySucursalId(Long sucursalId);
    
    List<Producto> findBySucursalIdAndActivoTrue(Long sucursalId);
    
    List<Producto> findBySucursalIdAndEnMenuTrue(Long sucursalId);
    
    @Query("SELECT p FROM Producto p WHERE p.sucursal.id = :sucursalId AND p.nombre LIKE %:nombre%")
    List<Producto> buscarBySucursalYNombre(@Param("sucursalId") Long sucursalId, @Param("nombre") String nombre);
}
```

---

## 🔧 FASE 2: Servicios - Obtener Datos

### VentaService.obtenerTodas()

```java
// ANTES
public List<VentaDTO> obtenerTodas() {
    return ventaRepository.findAll().stream()  // ❌ TODOS los datos
        .map(this::toDTO)
        .toList();
}

// DESPUÉS
public List<VentaDTO> obtenerTodas() {
    Long sucursalId = SucursalContext.getSucursalId();  // ✅ Sucursal del usuario
    return ventaRepository.findBySucursalId(sucursalId).stream()
        .map(this::toDTO)
        .toList();
}
```

### ProductoService.obtenerTodos()

```java
// ANTES
public List<ProductoDTO> obtenerTodos() {
    return productoRepository.findAll().stream()  // ❌ TODOS los productos
        .map(this::toDTO)
        .toList();
}

// DESPUÉS
public List<ProductoDTO> obtenerTodos() {
    Long sucursalId = SucursalContext.getSucursalId();  // ✅ Sucursal del usuario
    return productoRepository.findBySucursalId(sucursalId).stream()
        .map(this::toDTO)
        .toList();
}
```

### ReporteService.reporteVentas()

```java
// ANTES
public ReporteVentasDTO reporteVentas(LocalDate desde, LocalDate hasta) {
    List<Venta> ventas = ventaRepository.findByFechaBetween(desde, hasta);  // ❌ TODAS las sucursales
    // ... cálculos ...
}

// DESPUÉS
public ReporteVentasDTO reporteVentas(LocalDate desde, LocalDate hasta) {
    Long sucursalId = SucursalContext.getSucursalId();  // ✅ Sucursal del usuario
    List<Venta> ventas = ventaRepository.findBySucursalIdAndFechaBetween(sucursalId, desde, hasta);
    // ... cálculos ...
}
```

---

## ➕ FASE 3: Servicios - Crear Datos CON sucursal_id Automático

### VentaService.crear()

```java
@Transactional
public VentaDTO crear(CrearVentaRequest request) {
    // 1. OBTENER SUCURSAL AUTOMÁTICAMENTE
    Long sucursalId = SucursalContext.getSucursalId();
    Sucursal sucursal = sucursalRepository.findById(sucursalId)
        .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));
    
    // 2. Obtener usuario
    Usuario usuario = usuarioRepository.findById(usuarioIdDelToken)
        .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    
    // 3. Crear venta CON sucursal_id
    Venta venta = Venta.builder()
        .sucursal(sucursal)  // ✅ AUTOMÁTICO del contexto
        .usuario(usuario)
        .monto(request.monto())
        .metodoPago(metodoPago)
        .estado(EstadoVenta.COMPLETADA)
        .fecha(LocalDateTime.now())
        .build();
    
    // 4. Guardar
    Venta ventaGuardada = ventaRepository.save(venta);
    
    log.info("✅ Venta creada en sucursal {} (ID: {})", sucursal.getNombre(), ventaGuardada.getId());
    return toDTO(ventaGuardada);
}
```

### GastoService.crear() - MEJORARLO

```java
@Transactional
public GastoDTO crear(CrearGastoRequest request) {
    // 1. OBTENER SUCURSAL AUTOMÁTICAMENTE
    Long sucursalId = SucursalContext.getSucursalId();
    Sucursal sucursal = sucursalRepository.findById(sucursalId)
        .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));
    
    // 2. Obtener categoría
    CategoriaGasto categoria = categoriaGastoRepository.findById(request.categoriaGastoId())
        .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada"));
    
    // 3. Crear gasto CON sucursal_id
    Gasto gasto = Gasto.builder()
        .sucursal(sucursal)  // ✅ AUTOMÁTICO del contexto
        .categoriaGasto(categoria)
        .monto(request.monto())
        .descripcion(request.descripcion())
        .fecha(LocalDateTime.now())
        .build();
    
    // 4. Guardar
    Gasto gastoGuardado = gastoRepository.save(gasto);
    return toDTO(gastoGuardado);
}
```

### MermaService.crear()

```java
@Transactional
public MermaDTO crear(CrearMermaRequest request) {
    // 1. OBTENER SUCURSAL AUTOMÁTICAMENTE
    Long sucursalId = SucursalContext.getSucursalId();
    Sucursal sucursal = sucursalRepository.findById(sucursalId)
        .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));
    
    // 2. Crear merma
    Merma merma = Merma.builder()
        .sucursal(sucursal)  // ✅ AUTOMÁTICO
        .producto(producto)
        .cantidad(request.cantidad())
        .razon(request.razon())
        .fecha(LocalDateTime.now())
        .build();
    
    // 3. Guardar
    return toDTO(mermaRepository.save(merma));
}
```

---

## 🚫 FASE 4: Validación en UPDATE/DELETE

### Patrón de Validación:

```java
@Transactional
public VentaDTO actualizar(Long ventaId, ActualizarVentaRequest request) {
    // 1. Obtener venta
    Venta venta = ventaRepository.findById(ventaId)
        .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada"));
    
    // 2. VALIDAR que pertenece a la sucursal del usuario
    Long sucursalDelUsuario = SucursalContext.getSucursalId();
    if (!venta.getSucursal().getId().equals(sucursalDelUsuario)) {
        throw new AccessDeniedException(
            "No tienes permiso para editar venta de otra sucursal"
        );
    }
    
    // 3. Actualizar
    venta.setMonto(request.monto());
    venta.setUpdatedAt(LocalDateTime.now());
    
    return toDTO(ventaRepository.save(venta));
}
```

---

## 📊 FASE 5: Reportes y Estadísticas

### DashboardService.obtenerEstadisticas()

```java
public DashboardDTO obtenerEstadisticas(LocalDate fecha) {
    // 1. OBTENER SUCURSAL DEL USUARIO
    Long sucursalId = SucursalContext.getSucursalId();
    
    // 2. Calcular ventas del día
    BigDecimal ventasHoy = ventaRepository.findBySucursalIdAndFecha(sucursalId, fecha)
        .stream()
        .map(Venta::getMonto)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    // 3. Calcular gastos del día
    BigDecimal gastosHoy = gastoRepository.findBySucursalIdAndFecha(sucursalId, fecha)
        .stream()
        .map(Gasto::getMonto)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    // 4. Calcular ganancia
    BigDecimal ganancia = ventasHoy.subtract(gastosHoy);
    
    // 5. Retornar DTO CON DATOS DE SUCURSAL
    return DashboardDTO.builder()
        .sucursalId(sucursalId)
        .sucursalNombre(SucursalContext.getSucursalNombre().orElse("Unknown"))
        .ventasHoy(ventasHoy)
        .gastosHoy(gastosHoy)
        .ganancia(ganancia)
        .build();
}
```

---

## 🖥️ FASE 6: Frontend - POS Integration

### Cambios en Frontend

```typescript
// 1. Contexto de autenticación ya tiene sucursal_id del JWT

// 2. Crear venta automáticamente con sucursal_id
const crearVenta = async (items: CarritoItem[]) => {
    const { user } = useAuth();  // user.sucursal_id viene del JWT
    
    const venta = {
        items: items,
        // sucursal_id se envía automáticamente en JWT
        // Backend obtiene del SucursalContext
    };
    
    return await ventasService.crear(venta);
};

// 3. Dashboard muestra sucursal actual
const Dashboard = () => {
    const { user } = useAuth();  // user.sucursal_id
    
    return (
        <div>
            <h1>Dashboard - {user?.sucursal?.nombre}</h1>
            {/* Estadísticas de esta sucursal */}
        </div>
    );
};
```

---

## ✅ Testing Completo

### Test 1: Usuario sucursal 1 crea venta
```bash
POST /api/ventas
{
  "items": [{ "productoId": 1, "cantidad": 2 }],
  "total": 50.00
}

✅ Respuesta: Venta guardada con sucursal_id = 1
```

### Test 2: Usuario sucursal 2 NO ve venta de sucursal 1
```bash
GET /api/ventas

✅ Respuesta: Array vacío (no tiene ventas en su sucursal)
```

### Test 3: Admin ve ventas de múltiples sucursales
```bash
GET /api/ventas
Header: X-Sucursal-Id: 1

✅ Respuesta: Ventas de sucursal 1 (cuando admin la selecciona)
```

---

## 📈 Prioridades de Implementación

```
SEMANA 1 (Esta):
1. Repositories con findBySucursalId() ............... 1 hora
2. VentaService - crear() y obtenerTodas() ......... 1 hora
3. ProductoService - obtenerTodos() ................ 30 min
4. GastoService - mejorar crear() .................. 30 min

SEMANA 2:
5. InventarioMovimientoService ..................... 1 hora
6. MermaService .................................... 45 min
7. CompraService ................................... 45 min
8. ReporteService ................................... 2 horas

SEMANA 3:
9. DashboardService ................................ 1 hora
10. Frontend POS Integration ........................ 2 horas
11. Testing completo ............................... 2 horas
```

---

## 🎯 Resultado Final

**Cuando esté completo:**

```
Usuario LogIn en Sucursal 1
    ↓
JWT: { sucursalId: 1, usuarioId: 35, ... }
    ↓
Crea Venta → SucursalContext.getSucursalId() = 1 → Venta.sucursal_id = 1
    ↓
Ve Dashboard → Solo estadísticas de Sucursal 1
    ↓
Accede a Admin → Solo datos de Sucursal 1
    ↓
Intenta ver datos de Sucursal 2 → AccessDeniedException (sin ser admin)
    ↓
Admin con header X-Sucursal-Id: 2 → Ve datos de Sucursal 2
```

---

## 🔒 Seguridad Garantizada

- ✅ Usuario NO puede ver datos de otra sucursal
- ✅ Usuario NO puede crear recursos en otra sucursal
- ✅ Usuario NO puede editar recursos de otra sucursal
- ✅ Admin puede cambiar contexto con header
- ✅ SucursalContext se limpia después del request
- ✅ Validación en BD: sucursal_id NOT NULL con FK

---

## 📊 Archivos a Modificar (Total: ~15-20 archivos)

```
REPOSITORIES (8 archivos):
├─ ProductoRepository.java
├─ VentaRepository.java
├─ InventarioMovimientoRepository.java
├─ MermaRepository.java
├─ CompraRepository.java
├─ DescuentoRepository.java
├─ CorteRepository.java
└─ CategoriaProductoRepository.java

SERVICIOS (8 archivos):
├─ VentaService.java
├─ ProductoService.java
├─ InventarioMovimientoService.java
├─ MermaService.java
├─ CompraService.java
├─ ReporteService.java
├─ DashboardService.java
└─ CorteService.java

FRONTEND (4 archivos):
├─ useCategorias.ts
├─ useProductos.ts
├─ useVentas.ts
└─ useDashboard.ts
```

---

**Duración Estimada**: 8-10 horas para implementación completa
**Complejidad**: Media (patrones repetitivos)
**Testing**: Alta (seguridad crítica)
