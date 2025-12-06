# 📋 Plan de Segregación de Datos por Sucursal

## Objetivo
Implementar que cada usuario vea y manipule SOLO datos de su sucursal asignada, basado en el usuario autenticado.

## 🏗️ Arquitectura Actual

### Componentes ya existentes:
1. ✅ **SucursalContext** - ThreadLocal para almacenar sucursal del usuario actual
2. ✅ **SucursalContextFilter** - Filtro HTTP que establece la sucursal en cada request
3. ✅ **JwtUtil** - Genera JWT con usuarioId y rol (FALTA agregar sucursal_id)
4. ✅ **V011 Migration** - Agregó sucursal_id a todas las tablas
5. ✅ **V012 Sync** - Sincronizó datos a sucursal 1

### Cambios necesarios:

## 🔴 PHASE 1: JWT & Authentication (Prioridad Alta)

### 1.1 Actualizar JwtUtil para incluir sucursal_id
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/security/JwtUtil.java`

```java
// CAMBIO REQUERIDO
public String generateToken(String username, Long usuarioId, String rolNombre, Long sucursalId) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("usuarioId", usuarioId);
    claims.put("rol", rolNombre);
    claims.put("sucursalId", sucursalId);  // NUEVA
    return createToken(claims, username);
}

// AGREGAR EXTRACTOR
public Long extractSucursalId(String token) {
    return ((Number) Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("sucursalId")).longValue();
}
```

### 1.2 Actualizar UsuarioDetallesService.authenticate()
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/security/UsuarioDetallesService.java`

```java
// CAMBIO REQUERIDO
// Al generar el token, incluir sucursal_id del usuario
String token = jwtUtil.generateToken(
    usuario.getUsername(), 
    usuario.getId(), 
    usuario.getRol().getNombre(),
    usuario.getSucursal().getId()  // NUEVA LÍNEA
);
```

---

## 🟠 PHASE 2: Filtrado en Servicios (Prioridad Alta)

### 2.1 Categorías de Gastos (CRÍTICO)
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/service/CategoriaGastoService.java`

**Estado Actual**: `obtenerTodas()` retorna todas sin filtrar
**Problema**: Admin ve categorías de todas las sucursales

**Solución**:
```java
@Transactional(readOnly = true)
public List<CategoriaGastoDTO> obtenerTodas() {
    Long sucursalId = SucursalContext.getSucursalId();
    return categoriaGastoRepository.findBySucursalIdAndActivoTrue(sucursalId).stream()
        .map(this::toDTO)
        .toList();
}
```

### 2.2 Gastos (CRÍTICO)
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/service/GastoService.java`

**Estado Actual**: 
- `obtenerTodos()` - Sin filtrar
- `obtenerPorRangoFechas()` - Sin filtrar

**Solución**:
```java
public List<GastoDTO> obtenerTodos() {
    Long sucursalId = SucursalContext.getSucursalId();
    return gastoRepository.findBySucursalId(sucursalId).stream()
        .map(this::toDTO)
        .toList();
}

public List<GastoDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
    Long sucursalId = SucursalContext.getSucursalId();
    return gastoRepository.findBySucursalAndFechaBetween(sucursalId, fechaInicio, fechaFin).stream()
        .map(this::toDTO)
        .toList();
}
```

### 2.3 Productos (CRÍTICO)
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/service/ProductoService.java`

**Estado Actual**: Posiblemente sin filtrar por sucursal
**Solución**: Usar `SucursalProductoService` que ya tiene métodos filtrados

### 2.4 Usuarios (CRÍTICO - Ya parcialmente hecho)
**Archivo**: `/backend/src/main/java/com/puntodeventa/backend/service/UsuarioServicio.java`

**Estado Actual**: `obtenerUsuariosPorSucursal()` ya filtra
**Verificar**: Que todos los métodos en UsuarioServicio usen SucursalContext

### 2.5 Inventario (Movimientos, Mermas, Compras)
**Archivos**: 
- `InventarioMovimientoService`
- `MermaService`
- `CompraService`

**Solución**: Agregar filtrado por SucursalContext en obtenerTodos()

---

## 🟡 PHASE 3: Controllers & Endpoints (Prioridad Media)

### 3.1 Actualizar todos los GetMapping sin parámetros

**Patrón a seguir**:
```java
// ANTES
@GetMapping
public ResponseEntity<List<GastoDTO>> obtenerTodos() {
    return ResponseEntity.ok(gastoService.obtenerTodos());
}

// DESPUÉS - El filtrado ocurre en el servicio automáticamente
@GetMapping
public ResponseEntity<List<GastoDTO>> obtenerTodos() {
    return ResponseEntity.ok(gastoService.obtenerTodos());
}
```

Endpoints críticos:
- `GET /api/finanzas/categorias-gasto` 
- `GET /api/finanzas/gastos`
- `GET /api/inventario/productos`
- `GET /api/inventario/categorias-productos`
- `GET /api/auth/usuarios` (si existe)
- `GET /api/ventas`
- Todos los reportes

### 3.2 Agregar validación en POST/PUT/DELETE

```java
// Al crear/actualizar/eliminar, validar que el recurso pertenece a la sucursal del usuario
@PostMapping
public ResponseEntity<GastoDTO> crear(@RequestBody CrearGastoRequest request) {
    Long sucursalDelUsuario = SucursalContext.getSucursalId();
    
    // Validar que el gasto se crea en la sucursal del usuario
    if (!request.sucursalId().equals(sucursalDelUsuario)) {
        throw new AccessDeniedException("No tienes permiso para crear gastos en otra sucursal");
    }
    
    return ResponseEntity.ok(gastoService.crear(request));
}
```

---

## 🟢 PHASE 4: Frontend Integration (Prioridad Media)

### 4.1 Crear Hook para obtener sucursal del usuario
**Archivo**: `/frontend-web/src/hooks/useSucursalActual.ts` (NUEVO)

```typescript
export const useSucursalActual = () => {
  const { user } = useAuth();
  return user?.sucursal || null;
};
```

### 4.2 Usar contexto en hooks de datos
```typescript
// EJEMPLO: useCategorias.ts
export const useCategorias = () => {
  const sucursal = useSucursalActual();
  
  return useQuery({
    queryKey: ['categorias', sucursal?.id],
    queryFn: () => categoriasService.listar({ sucursalId: sucursal?.id }),
    enabled: !!sucursal,
  });
};
```

---

## 📊 Matriz de Cambios Requeridos

| Componente | Archivo | Cambio | Prioridad |
|-----------|---------|--------|-----------|
| JWT | JwtUtil.java | Agregar sucursalId a token | 🔴 Alta |
| Autenticación | UsuarioDetallesService.java | Incluir sucursal en token | 🔴 Alta |
| Gastos | GastoService.java | Filtrar por SucursalContext en obtenerTodos() | 🔴 Alta |
| Cat. Gastos | CategoriaGastoService.java | Filtrar por SucursalContext en obtenerTodas() | 🔴 Alta |
| Usuarios | UsuarioServicio.java | Validar todos los métodos usan SucursalContext | 🔴 Alta |
| Productos | ProductoService.java | Usar SucursalProductoService | 🔴 Alta |
| Inventario | InventarioMovimientoService | Filtrar por SucursalContext | 🟠 Media |
| Mermas | MermaService | Filtrar por SucursalContext | 🟠 Media |
| Compras | CompraService | Filtrar por SucursalContext | 🟠 Media |
| Reportes | ReportService | Filtrar por SucursalContext | 🟠 Media |
| Ventas | VentaService | Validar sucursal en crear | 🟡 Baja |
| Repositories | *Repository.java | Agregar findBySucursalId si no existe | 🟡 Baja |

---

## ✅ Verificación Final

Después de implementar, validar:

```bash
# 1. Usuario de Sucursal 1 NO ve datos de otras sucursales
curl -H "Authorization: Bearer $TOKEN_USER_SUCURSAL_1" \
  http://localhost:8080/api/finanzas/gastos

# 2. Admin con header X-Sucursal-Id ve datos de otras sucursales
curl -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "X-Sucursal-Id: 2" \
  http://localhost:8080/api/finanzas/gastos

# 3. POST requiere sucursal_id válida
curl -X POST http://localhost:8080/api/finanzas/gastos \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sucursalId": 1, ...}'

# 4. Token JWT contiene sucursal_id
curl http://localhost:8080/api/auth/login \
  -d '{"username":"dev","password":"desarrollador"}' | jq '.token'
# Decodificar y verificar que contiene sucursalId
```

---

## 📝 Notas Importantes

1. **SucursalContext**: Ya filtra automáticamente en ThreadLocal, los servicios lo obtienen con `SucursalContext.getSucursalId()`
2. **Admin Override**: El filtro permite que ADMIN use header `X-Sucursal-Id` para cambiar contexto
3. **Transacciones**: Los cambios mantienen `@Transactional` y `@Cacheable`
4. **Logging**: Agregar logs cuando se filtren datos por sucursal
5. **Performance**: Las queries ya tienen índices por sucursal_id (V011)

---

## 🔄 Orden de Implementación Recomendado

1. ✅ JWT: Agregar sucursalId al token (HECHO HOY)
2. 🔴 GastoService: Filtrar obtenerTodos() y obtenerPorRangoFechas()
3. 🔴 CategoriaGastoService: Filtrar obtenerTodas()
4. 🔴 ProductoService: Validar que usa SucursalProductoService
5. 🔴 UsuarioServicio: Verificar todos los métodos usan SucursalContext
6. 🟠 Servicios restantes: Inventario, Mermas, Compras
7. 🟡 Frontend: Actualizar hooks para incluir sucursalId
8. ✅ Testing: Verificar todo funciona con distintas sucursales
