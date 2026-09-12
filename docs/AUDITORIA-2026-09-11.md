# Auditoría Completa — Punto de Venta (2026-09-11)

Sistema: monorepo POS. Backend Java 21 + Spring Boot 3.5.7 (215 archivos, 5 tests), Frontend React 18 + TS 5.3 + Vite 5 (27 páginas, 0 tests), 22 migraciones Flyway, PostgreSQL Railway.

---

## 1. CRÍTICO — corrupción de datos / pérdida de dinero / brecha

### C1. Ventas aceptan precios y descuentos del cliente sin verificar servidor
- `backend/.../service/VentaService.java:216-218` — `precioUnitario = itemDTO.precioUnitario() != null ? itemDTO.precioUnitario() : producto.getPrecio()`. El request del cliente sobrescribe el precio de BD.
- `VentaService.java:261` — `descuento = request.descuento()`, sin tope, sin verificación de permiso.
- Impacto: cajero/cliente manipula total de venta. Fix: servidor recalcula subtotal/total SIEMPRE desde `producto.getPrecio()` (+ extras de variante/atributos) o exige rol ADMIN/GERENTE para override explícito.

### C2. Las ventas NO descuentan inventario
- `VentaService.java:302-310` — `// COMENTADO TEMPORALMENTE: descontarInventario(ventaGuardada)`. 
- `VentaService.java:213` — `// TODO: Validar stock suficiente (pendiente)`.
- Consecuencia: stock nunca baja con la venta; el inventario reportado no refleja la realidad; "uso correcto del sistema" imposible sin esto. Fix: reactivar consumo por recetas dentro de la misma transacción + validación de stock suficiente + bloqueo pesimista/`@Version` en el ingrediente.

### C3. Fallback de sucursal inseguro en `SucursalContextFilter`
- `backend/.../security/SucursalContextFilter.java:183-192` — en cualquier excepción del filtro: `SucursalContext.setSucursal(1L, "Default-ERROR")`. Escribe datos de cualquier sucursal en la sucursal 1. Contradice su propio comentario (líneas 169-178: "NO usar fallback a sucursal 1"). Fix: eliminar catch-fallback; si no hay sucursal, 401/403.

### C4. JWT secret por defecto commiteado
- `backend/src/main/resources/application.properties:143` — `jwt.secret=punto-de-venta-secret-key-2025-...` es fallback público. Si Railway pierde la env `JWT_SECRET`, cualquier persona forja tokens admin.
- Fix: `jwt.secret=${JWT_SECRET}` sin default (o arranque exige la var), rotar secret actual.

### C5. Rate limiter NO protege login/register (brute force abierto)
- `backend/.../filter/RateLimitFilter.java:132-138` — `shouldNotFilter()` devuelve `true` para `/api/v1/auth/login|register|refresh` → **salta el filtro completo** (global y por usuario). El javadoc dice "pero no del por-usuario" — falso. Login no tiene límite.
- Además `X-RateLimit-Limit: 100` hardcoded (línea 83/91) vs bucket real de 500 (línea 42).
- Fix: no excluir login del rate limit por-IP con ventana corta (5 intentos/15 min) + `X-RateLimit-Reset` real.

---

## 2. ALTO

### A1. Sin optimistic locking (`@Version`) en ninguna entidad
`@Version` — 0 usos en 37 entidades. Ediciones concurrentes de producto/precio/stock = lost update silencioso.

### A2. Paginación solo en 3 dominios
`Pageable` solo en ventas, compras, productos y costo histórico. El resto carga listas completas; `ProductoController.java:124` hace `PageRequest.of(0, 5000)` como "limitar". POS y AdminSales/AdminInventory sin tope server-side → degradación con volumen.

### A3. Cachés sin registrar → sin TTL ni límite
`CacheConfig.java` registra 16 cachés custom, pero:
- `EstadisticasService.java:194` usa `"productos-top"` — NO registrada.
- `SucursalProductoService.java:35` usa `"productosSucursal"` — NO registrada.
Ambas caen al builder default de `CaffeineCacheManager` → sin expiración, sin `maximumSize` → crecimiento de memoria sin bound.

### A4. Swagger/OpenAPI público en producción
`application-railway.properties:76` `springdoc.swagger-ui.enabled=true` + rutas swagger en permitAll (SecurityConfig). Expone schemas, contratos y URLs de todos los endpoints. Recomendado: `enabled=false` en railway o proteger con auth.

### A5. Cajas/turnos: SQL nativo con fallback por defecto
`VentaService.java:345-415` — consultas nativas a `cajas`/`turnos` (tablas **ausentes en las 22 migraciones**) con `catch (Exception ignored)` y fallback `cajaId=1` / `turnoId=1`. Toda venta en Railway probablemente cae en el fallback silencioso + `request.cajaId()`/`turnoId()` envuelto en try/catch inútil (160-181). Sin corte de caja real ni turnos correctos. Fix: migración real de `cajas`/`turnos` + entidades, o eliminar columnas.

### A6. Manejo de excepciones por heurística
`GlobalExceptionHandler.java:116-151` — `IllegalArgumentException` → 401 si el mensaje contiene "username/password/contraseña/credencial". Frágil y acoplado al texto. Faltan handlers de: `ConstraintViolationException`, `AccessDeniedException` (hoy 403 plano sin body), `HttpMessageNotReadableException`, `MethodArgumentTypeMismatchException`. Errores de dominio deben ser excepciones propias.

### A7. DataInitializer destructivo
`backend/.../config/DataInitializer.java:49-60` — si arranca `dev-h2` con datos existentes: `DELETE FROM` usuarios/roles/sucursales + `ALTER ... RESTART` — borra datos silenciosamente al hacer boot. Protegido por profile, pero high-stakes.

### A8. Refresh-token muerto en frontend
- Backend: `/api/auth/refresh` existe. Frontend: `api.config.ts` tiene `REFRESH_TOKEN` sin uso; `api.service.ts:154-181` ante 401 borra sesión y redirige a `/login?expired=true` — sin intentar refresh. Sesiones de 8h se pierden; UX molesta.
- Fix: interceptor con refresh de una sola vez + retry de la request original (cola de requests en vuelo).

### A9. Reportes: 4 llamadas por vista, filtros client-side, doble caché
`frontend-web/src/pages/admin/hooks/useReportData.ts:24-122` — resumen, top productos, ventas, gastos = 4 requests secuenciales SIN keys de React Query; gastos filtrados CLIENT-SIDE con `new Date` (93-96) aunque el endpoint ya filtra (backend `GastoRepository` filtra por rango). Aparte, `useReportsLocalStorage` cachea en localStorage (5MB límite, hasta varios días). Inconsistencia potencial entre reporte y datos reales + latencia creciente.

### A10. Soft-delete manual en ~10 entidades
Flags `activo`/`disponibleEnMenu` (migraciones boolean→smallint: V009, V016, V021) sin `@SQLDelete`/`@Where` — cada query manual debe acordarse de filtrar. Riesgo: consultas que omiten el filtro devuelven borrados lógicos; consistencia a cargo de cada desarrollador.

### A11. Logging excesivo en frontend prod
- 128 `console.log` en `src/`; `api.service.ts:133` imprime el body completo de cada request (incluye datos potencialmente sensibles) en consola del cliente.
- `application.properties:114-117` — `DEBUG` para `com.puntodeventa` y `SQL TRACE` como base (el perfil railway lo corrige, pero el default de dev es ruidoso/leaky).

### A12. Dependencias muertas / infladas
- `mysql-connector-j` en pom (línea 117) — no se usa (H2+Postgres).
- `react-hook-form@7.48` instalado pero 0 usos — 139 formularios manuales con estado string.
- `@tanstack/react-query-devtools` bundleado en producción (`main.tsx:20`).

---

## 3. MEDIO

### M1. Deuda TODO/FIXME
Backend: 307; frontend: 322. Los más riesgosos: `VentaService` (stock, IVA, descuentos), `Application`, mapeos incompletos.

### M2. Arquitectura de datos frontend partida
- POS (`PosHome`, `PosCart`, `PosSales`): estado manual `useState` + recarga manual + WebSocket.
- Admin: React Query con `queryDefaults` estratificados excelentes (`queryClient.ts`).
- Resultado: mismas entidades cacheadas por dos mecanismos; POS re-fetches en cada montaje; sin invalidación compartida. Recomendado: unificar bajo React Query + invalidación por evento WebSocket.

### M3. Modelo de variantes = filas de producto
`Producto.variantes` = hijos `Producto` con `productoBase` (VariantesManager/AtributosManager). Coste: receta/costo por variante no soportado (solo base), precio duplicado, limpieza compleja. Funcional, pero el margen y el costo por variante son inexactos — clave para reportes serios.

### M4. Precio editable en el carrito POS
`PosHome.tsx:73-75` — edición inline de precio por item (`editingPriceId`). Legítima para descuentos, pero **sin control server** (conecta con C1). Debe exigir rol + auditoría.

### M5. Reportes almacenados en localStorage
`useReportsLocalStorage.ts` — datos de reportes cacheados en el navegador con TTL por días; riesgo de datos viejos presentados como nuevos y cuota de 5MB. Sustituir por caché React Query + `staleTime` + agrupación server-side.

### M6. Tests: 5 backend / 0 frontend / sin CI
`src/test` — 5 archivos para 215 java. Frontend: ni un test. No hay `.github/workflows`. Para un sistema de caja: inaceptable.

### M7. ESLint: 395 problemas legacy (371 errors)
Lint funcional desde hoy, pero el repo entero tiene errores `no-explicit-any` (139), hooks, etc. Limpieza por lotes.

### M8. Docs desactualizados
AGENTS.md: dice "HTTP Basic Auth, JWT planned" (JWT YA implementado), "26 migrations" (son 22), menciona profile `dev-local` (no existe; el real es `dev-h2`), afirma "Vite no ve env runtime + env-config.js" (ok) pero describe flujo viejo.

### M9. `any`+formularios manuales
139 `as any`/`any` en TS. Formularios con estado disperso (`useState` por campo, strings para montos). Sin `react-hook-form` → validación UX inconsistente, sin errores por campo estándar, sin dirty-state.

### M10. WebSocket sin segregación por sucursal
`WebSocketNotificationService.notificarVentaCreada` difunde a todos los conectados; handshake STOMP sin token en el reconnect/auth (verificar `websocket.service.ts` subscribe). Actividad de venta de sucursal A visible para usuario de sucursal B (aunque la UI filtre, el evento llega).

### M11. Exportar/reportes: solo CSV de inventario
`AdminInventory.tsx:264-273` — único CSV. Sin PDF/Excel para reportes, corte de caja, estados financieros. No hay `GeneralCutTab` en backend (el componente `GeneralCutTab.tsx` existe en frontend).

### M12. PWA cachea el API
`vite.config.ts` — `runtimeCaching` NetworkFirst 5 min sobre API: muestra ventas/stock potencialmente stale en offline. Combinar con invalidación/`stale-while-revalidate` fino.

### M13. Monitoreo incompleto
- `PerformanceMetricsController` — endpoint `web-vitals` documentado como permitAll en SecurityConfig pero **no existe en el controller** (404 siempre). Código muerto en ambos lados.
- No hay alertas programáticas; solo endpoint custom `/monitoring`.
- Sin `@Scheduled` para limpieza de logs/cachés; `LogEntry` persiste en DB (crecimiento).

### M14. RBAC pobre
3 roles (ADMIN/CAJERO/GERENTE) chequeados mayormente con strings (`rol.nombre.equalsIgnoreCase("ADMIN")`) y `AdminRoute` (frontend, componente — jugable). Sin autorización por endpoint en Spring Security (`hasAuthority`) — cualquier cajero con token puede llamar admin APIs si conoce las rutas.

---

## 4. BAJO / MENOR

- Emojis en logs y UI (`🔥` emoji `AdminCompras:45`, emojis en `LogService`, `PosSales`).
- `spring.security.user.password=admin123` en application.properties (perfil dev; railway lo sobrescribe, pero el default es débil).
- `banner.txt` custom OK; `spring.jpa.show-sql=true` base (dev).
- Prioridad `hasRestored`/route-restorer con `localStorage` por usuario — sin `useMemo` fuerte en layouts (32 usos en total, algunos solo para filtros).
- CORS `cors.allowed-headers=*` (aceptable en prod detras de CORS_ prefijo).
- Touch targets: MUI default `minHeight: 48px` bueno; sin soporte teclado/foco dedicado en POS grid.

---

## 5. ROADMAP POR FASES

**Fase 0 — Seguridad/corrección (2-3 días)**
1. C1: precios/cantidad/descuento recalculados en servidor; override con permiso.
2. C2: reactivar descuento de inventario por recetas (transacción + stock check).
3. C3: eliminar fallback sucursal 1; 401 si no hay contexto.
4. C4: `jwt.secret=${JWT_SECRET}` sin default + rotar.
5. C5: rate limit en login por IP (5/15min) y corregir headers.
6. A1: `@Version` en Producto, Ingrediente, Venta, Compra.
7. A3: registrar cachés huérfanas.
8. A14: RBAC por endpoint (`hasAuthority`), remover `AdminRoute` como única barrera.

**Fase 1 — Datos correctos (1 semana)**
9. Movimientos de inventario automáticos (venta→consumo, compra→entrada, merma→salida) en `InventarioMovimiento` existente.
10. Reportes: endpoints agregados server-side (un solo request por tab), quitar filtrado client-side y localStorage, React Query.
11. Refresh-token interceptor; devtools fuera de prod; limpiar `console.log`.
12. Migración real `cajas`+`turnos` o eliminarlas; matar native SQL.
13. Handlers de excepción completos + excepciones de dominio.
14. Soft-delete con `@SQLDelete` + `@Where` o auditoría de queries.

**Fase 2 — UX admin + reportes (2 semanas)**
15. Tablas admin paginadas server-side con sorting/filtrado (transparentes de datos grandes).
16. Exportar PDF/Excel (corte de caja, ventas, inventario, gastos); `GeneralCutTab` server-side.
17. Variantes: receta/costo por variante (margen real); atributos con stock opcional.
18. Equivalentes de formularios con react-hook-form + validación por campo + dirty state.
19. Menú POS: búsqueda, atajos teclado, badges de inventario bajo, sold por popularidad (ya existe el servicio).

**Fase 3 — Confiabilidad (1 mes)**
20. Tests: venta (precio/stock/descuento), auth (rate limit, RBAC), inventario (movimientos), reports.
21. CI: GitHub Actions (build, tsc, lint, test) por servicio.
22. Observabilidad: métricas Micrometer + alertas en Railway; limpieza de `LogEntry` programada.
23. Empty-states, skeletons, a11y (focus, anuncios ARIA), dark mode opcional.

---

## 6. Números clave
- Backend: 215 java · 5 tests · 22 migrations · 307 TODO · 0 `@Version` · 3 dominios paginados · 1 fallback inseguro · 1 precio-client-side · 0 descuento de inventario.
- Frontend: 27 páginas · 128 `console.log` · 139 `any` · 322 TODO · 395 errores eslint · 1 servicio refresh muerto · 4 requests por reporte · 0 tests.
- Infra: 1 secret committeado · rate limit inefectivo en login · swagger público prod · devtools en bundle · mysql dep muerta.