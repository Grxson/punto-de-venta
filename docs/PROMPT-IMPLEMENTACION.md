# PROMPT DE IMPLEMENTACIÓN — Auditoría Punto de Venta (2026-09-11)

Copia este bloque completo en el agente implementador (main thread o `cavecrew-builder` por fases).

---

## ROL

Eres ingeniero senior backend (Spring Boot 3.5.7 / Java 21) y frontend (React 18 / TS 5.3 / Vite). Implementas los hallazgos de `docs/AUDITORIA-2026-09-11.md` en orden de prioridad. NO introduzcas features nuevas. NO renombres APIs públicas. Respeta los patrones del repo: DTOs con records, pattern matching con switch, `getFirst()/getLast()` de Sequenced Collections, Swagger `@Operation` en todo endpoint nuevo.

## REGLAS GLOBALES

- Cada cambio compila: `cd backend && ./mvnw clean compile -DskipTests`.
- Frontend: `cd frontend-web && npx tsc --noEmit && npx eslint`.
- Tests backend (los 5 existentes) deben seguir pasando: `cd backend && ./mvnw test`.
- NO toques nada fuera del alcance de una tarea. Un commit por tarea (mensaje `fix:` español).
- No borres endpoints; solo endurece su lógica interna.
- Si una tarea no se puede completar sin romper API existente, deja TODO explicando el conflicto y sigue.

---

## FASE 0 — Seguridad y corrección (crítico)

### T0.1 — Validar precio, cantidad y descuento en servidor (C1)
Archivo: `backend/src/main/java/com/puntodeventa/backend/service/VentaService.java`

- En `crearVenta`, para cada `itemDTO`: ignorar `precioUnitario()` del request y tomar SIEMPRE `producto.getPrecio()` de la BD limpia en la misma transacción.
- Mantener una excepción explícita: si el request trae `precioUnitario` distinto y el usuario autenticado tiene rol `ADMIN` o `GERENTE` (no CAJERO), usar el precio del request y registrar `LogEntry` con `tipo=PRECIO_OVERRIDE`, `usuario`, `producto`, diferencia.
- `descuento` del request: validar `0 <= descuento <= subtotal`. Si `descuento > 0` y el usuario es CAJERO, aplicar SOLO si `descuento <= 10% del subtotal`; si excede, rechazar con `IllegalArgumentException("Descuento fuera de rango para cajero")`.
- Recomputar `subtotal`, `descuento`, `total`, `pagos` acumulados SIEMPRE en servidor a partir de los items validados; nunca confiar en los totales del request.
- Criterio: un request con `precioUnitario: 0.01` y `total: 1` debe terminar con total correcto según BD; cajero con descuento 50% → 400.

### T0.2 — Reactivar descuento de inventario transaccional (C2)
Archivo: `backend/src/main/java/com/puntodeventa/backend/service/VentaService.java`

- Descomentar y completar `descontarInventario` dentro de `@Transactional` de `crearVenta`:
  1. Validar stock suficiente de cada ingrediente de la receta (`receta` del producto/sucursal) antes de guardar la venta. Si `stock < requerido`, retornar 400 con mensaje citando producto y cantidad.
  2. Descontar stock: `stock -= cantidad * factorReceta` por ingrediente (respetar `unidadUso` vs `unidadStock`, usar `factorConversion` de la tabla `receta` si existe).
  3. Insertar `InventarioMovimiento` con `tipo=VENTA_ITEM` o reutilizar el enum que ya exista, `cantidad` negativa, `causaVentaId`, `sucursalId`.
  4. Todo dentro de la misma transacción; si el descuento falla, rollback total de la venta.
- Si la tabla `receta` no tiene filas para un producto vendido, descuenta nada y loguea advertencia (no falles la venta).
- Criterio: venta exitosa → stock del ingrediente baja la cantidad exacta; `InventarioMovimiento` tiene la fila; venta con stock insuficiente → 400 y sin venta creada.

### T0.3 — Eliminar fallback inseguro de sucursal (C3)
Archivo: `backend/src/main/java/com/puntodeventa/backend/security/SucursalContextFilter.java`

- Eliminar el `catch` que hace `SucursalContext.setSucursal(1L, "Default-ERROR")`.
- Si la sucursal no se resuelve (usuario sin `sucursalId`, header inválido, excepción al cargar): responder `401 Unauthorized` con JSON `{ "error": "Sucursal no resuelta" }` y propagar como `SucursalException` tipada.
- Criterio: request sin header `X-Sucursal-Id` cuando el usuario es ADMIN → 401; CAJERO con sucursal correcta → flujo normal.

### T0.4 — JWT secret obligatorio en producción (C4)
Archivo: `backend/src/main/resources/application.properties`

- Quitar el default hardcodeado. Dejar: `jwt.secret=${JWT_SECRET}` SIN valor por defecto.
- En `backend/src/main/resources/application-railway.properties`: confirmar `JWT_SECRET` ya inyectado (si no, añadir: `jwt.secret=${JWT_SECRET}`), y documentar en `backend/README.md` que Railway DEBE definir `JWT_SECRET` (generar con `openssl rand -base64 64`).
- En `JwtService` (o donde se lea `jwt.secret`): si el valor resuelto está vacío o es la constante vieja, lanzar excepción al arrancar (`JwtSecretNotConfiguredException`) — fail-fast, nunca fallback.
- Criterio: `mvnw clean compile` OK; arrancar sin `JWT_SECRET` → app no levanta con mensaje claro; con env → normal.

### T0.5 — Rate limit real sobre login (C5)
Archivo: `backend/src/main/java/com/puntodeventa/backend/filter/RateLimitFilter.java`

- En `shouldNotFilter`: NO excluir `/api/v1/auth/login` ni `/api/v1/auth/register` de la capa por-IP. Mantener excluido de la capa por-usuario solo si no hay usuario autenticado en login (natural).
- Implementar, en la misma clase o en un filtro nuevo dedicado, límite por IP para login: 5 intentos / ventana 15 minutos, con contador persistente en memoria (ConcurrentHashMap) y reset de contador en login exitoso.
- Corregir el header `X-RateLimit-Limit` para que refleje el bucket real (500) o el límite de login por IP, y añadir `X-RateLimit-Remaining` y `X-RateLimit-Reset` reales.
- Criterio: 6º login fallido seguido desde misma IP → 429 con `Retry-After`; login correcto resetea contador.

### T0.6 — Optimistic locking `@Version` (A1)
Archivos: entidades núcleo — `Producto`, `Ingrediente`, `Venta`, `VentaItem`, `Compra`, `CompraItem`, `Gasto`, `Productoperecedero` (o como se llamen las 8 entidades base según paquete `model`).

- Añadir campo `@Version private Long version;` a cada una, con columna `version BIGINT NOT NULL DEFAULT 0` en las migraciones Flyway — crear UNA migración nueva `V1.0.2__add_version_columns.sql` con `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- NO tocar DTOs (la versión no se expone).
- Criterio: dos actualizaciones concurrentes al mismo Producto → la segunda lanza `OptimisticLockException`; agregar handler en `GlobalExceptionHandler` → 409 con mensaje "Datos modificados por otro usuario, recarga e intenta de nuevo".

### T0.7 — Registrar cachés huérfanas (A3)
Archivo: `backend/src/main/java/com/puntodeventa/backend/config/CacheConfig.java`

- Registrar en el `CaffeineCacheManager` (con el builder custom que ya existe) las cachés:
  - `productos-top` (usada en `EstadisticasService.java:194`)
  - `productosSucursal` (usada en `SucursalProductoService.java:35`)
  - `reportes-inventario` si existe en `InventarioMovimientoReporteService` (buscar `@Cacheable` restantes y registrarlas todas: grepear `@Cacheable(value = "…")` y comparar contra las 16 ya registradas).
- TTL acorde al dominio: `productos-top` 5 min, `productosSucursal` 2 min, con `maximumSize(500)` y `recordStats` activado.
- Criterio: grepear `@Cacheable(value=` → ninguna caché sin entrada en `CacheConfig`.

### T0.8 — RBAC por endpoint (A14)
Archivo: `backend/src/main/java/com/puntodeventa/backend/config/SecurityConfig.java`

- Reemplazar la regla global del tipo "todos los /api/** autenticados" por `requestMatchers` con `hasAuthority('ROLE_ADMIN')` / `hasAuthority('ROLE_GERENTE')` explícitos:
  - `/api/v1/ventas/**` → `hasAnyAuthority('ROLE_ADMIN','ROLE_CAJERO','ROLE_GERENTE')`
  - `/api/v1/usuarios/**`, `/api/monitoring/**`, `/api/v1/reportes/**`, `/api/v1/compras/**`, `/api/v1/gastos/**` → `hasAnyAuthority('ROLE_ADMIN','ROLE_GERENTE')`
  - `/api/v1/productos/**` GET → 3 roles; POST/PUT/DELETE → ADMIN (GERENTE si el repo ya lo permitía, verifica `@PreAuthorize` existentes y respétalos)
- Confirmar que los `@PreAuthorize` existentes en controllers sigan consistentes (no contradecir SecurityConfig).
- Criterio: token de cajero contra `POST /api/v1/productos` → 403; contra `/api/v1/ventas` → 200. Probar con `curl` tras levantar.

---

## FASE 1 — Datos correctos

### T1.1 — Manejo completo de excepciones (A6)
Archivo: `backend/src/main/java/com/puntodeventa/backend/exception/GlobalExceptionHandler.java`

- Eliminar la heurística de `IllegalArgumentException` → 401. Sustituir por excepción de dominio `CredencialesInvalidasException` lanzada en el login (buscar dónde se valida auth y usarla).
- Añadir handlers:
  - `ConstraintViolationException` → 400 con la lista de campos violados.
  - `AccessDeniedException` → 403 con body JSON.
  - `HttpMessageNotReadableException` → 400 "JSON inválido".
  - `MethodArgumentTypeMismatchException` → 400 "Parámetro inválido: {name}".
  - `OptimisticLockException` → 409 (del T0.6).
- Criterio: login fallido → 401 correcto sin depender del texto del mensaje; body mal formado → 400 con mensaje útil.

### T1.2 — Refresh token funcional en frontend (A8)
Archivos: `frontend-web/src/services/api.service.ts`, `frontend-web/src/config/api.config.ts`

- Implementar en `api.service.ts` un `refreshPromise` único: al recibir 401 en cualquier request, si existe token de refresh, llamar `/api/auth/refresh` una sola vez (deduplicado), actualizar tokens en `localStorage`/estado, re-intentar la request original y encolar las que llegaron durante el refresh.
- Si el refresh falla → recién ahí logout + redirección `/login?expired=true`.
- Eliminar la constante muerta `REFRESH_TOKEN` de `api.config.ts` o usarla.
- Criterio: con sesión vencida, la app sigue funcionando sin logout; con refresh vencido, logout normal.

### T1.3 — Reportes server-side + React Query (A9, M5)
- Backend: en `EstadisticasService` (o `ReporteController`) añadir UN endpoint agregado: `GET /api/v1/reportes/diario?desde&hasta` devolviendo `{ resumen, productosTop, ventas (paginadas a 500), gastos }` en un solo payload, con `@Cacheable` por rango de fechas (TTL 5 min).
- Frontend `useReportData.ts`: colapsar las 4 llamadas en 1; eliminar el filtrado client-side de gastos (confiar en `desde/hasta` del endpoint). Mantener el contrato de tipos de `reportTypes.ts` intacto.
- `useReportsLocalStorage.ts`: eliminar o reducir a caché de React Query (`staleTime: 60s`) — no reescribir reportes en localStorage; borrar entradas existentes con una migración de clave (nueva versión de key, vieja se ignora).
- Criterio: tab de reportes hace 1 request por rango; cambiar rango re-filtra en servidor; sin datos stale en localStorage.

### T1.4 — Migración real de cajas/turnos o limpieza (A5)
- Verificar en las 22 migraciones si `cajas`/`turnos` existen (grepear). Si NO existen:
  - Opción A (recomendada): migración `V1.0.3__add_cajas_turnos.sql` creando `cajas(id, sucursal_id, nombre, activo)` y `turnos(id, caja_id, usuario_id, apertura, cierre)` ; entidades + repos `CajaRepository`/`TurnoRepository`; reemplazar el SQL nativo de `VentaService.java:345-415` por los repos.
  - Opción B si el tiempo no da: eliminar caja/turno de `crearVenta` (guardar null) y borrar el SQL nativo con fallback, dejando TODO para la fase 2.
- Criterio: levantar en railway → sin excepciones ignoradas por cajas; crear venta sin parámetros de caja → OK y logueado.

### T1.5 — Spring Security: swagger off en prod + limpieza global (A4, A12)
- `application-railway.properties`: `springdoc.swagger-ui.enabled=false`, `springdoc.api-docs.enabled=false` (o proteger con rol ADMIN si se necesita acceso manual: `requestMatchers("/v3/api-docs/**", "/swagger-ui/**").hasAuthority('ROLE_ADMIN')`).
- `application.properties:114-117`: bajar logging base a `INFO`; dejar `DEBUG` solo en profile dev (`application-dev-h2.properties` si existe).
- Frontend `main.tsx`: `ReactQueryDevtools` SOLO si `import.meta.env.DEV`.
- `api.service.ts:133`: quitar el `console.log` de bodies completos; dejar un `console.debug` de path+status.
- Pom: quitar `mysql-connector-j`; `package.json`: quitar `react-hook-form` (0 usos) y `@tanstack/react-query-devtools` (pasa a `devDependencies`).
- Criterio: `npx tsc --noEmit` + `npx eslint` limpios; `npm run build:prod` sin devtools en bundle (verificar con grep en `dist/assets`).

### T1.6 — Soft-delete centralizado (A10, primera parte)
- Backend: en las 3-4 entidades con mayor riesgo (`Producto`, `Categoria`, `Subcategoria`, `Gasto`): anotar `@SQLDelete(sql = "UPDATE x SET activo = 0 WHERE id = ?")` y `@Where(clause = "activo = 1")` en las clases. Ajustar los `@Query` JPQL que ya filtran `activo` para no filtrar dos veces (innecesario, no dañino — evaluar y dejar consistente).
- NO tocar ventas/compras (histórico no debe ocultarse).
- Criterio: `productoRepository.deleteById` → UPDATE no DELETE; queries de listado no devuelven inactivos.

### T1.7 — Tests núcleo (M6, primera tanda)
- Backend `src/test`: añadir tests para
  1. `VentaService.crearVenta` — precio de BD predomina, descuento cajero tope 10%, stock insuficiente → rollback.
  2. `RateLimitFilter` — 6º intento → 429.
  3. `EstadisticasService.resumenRango` — rango filtrado y cacheado (dos llamadas → 1 query, `Cache` contador).
- Usar H2 (profile test) como los 5 tests existentes. NO Mockito puro si el repo no lo usa; seguir el patrón de los tests presentes.
- Criterio: `cd backend && ./mvnw test` → todo verde (existentes + nuevos).

---

## FASE 2 — UX y reportes (opcional, continuar si todo lo anterior quedó verde)

Tras Fase 1, sigo con: tablas admin paginadas server-side (AdminSales/AdminInventory/AdminCategorias con `page/size/sort`), export PDF/Excel, variantes con costo propio, react-hook-form en formularios principales (ProductoForm, CompraForm, UsuarioForm), menú POS con búsqueda/atajos, validación UX consistente, limpieza de 128 `console.log` y 139 `any`.

---

## VERIFICACIÓN FINAL (siempre ejecutar al cerrar)

```powershell
cd backend; ./mvnw clean package -DskipTests   # compila + empaqueta
cd backend; ./mvnw test                        # 5 existentes + nuevos verdes
cd frontend-web; npx tsc --noEmit
cd frontend-web; npx eslint
cd frontend-web; npm run build:prod            # bundle sin devtools
```

## ENTREGABLES

1. Commits por tarea con prefijo `fix:` (o `feat:` solo para migraciones nuevas).
2. Al final: lista `archivo:línea → qué cambió` por cada hallazgo, marcando cuáles quedaron 100%, cuáles parciales y cuáles requieren decisión de negocio.
3. Si algún hallazgo requiere confirmación del cliente (p. ej. precio override por rol, límite 10% descuento cajero), dejarlo PLANTEADO y no inventar el valor.