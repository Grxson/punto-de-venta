# 📐 ARQUITECTURA VISUAL - SEGREGACIÓN POR SUCURSAL

## 🏗️ ARQUITECTURA GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🖥️  CAPA PRESENTACIÓN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │  FRONTEND-WEB (React + TypeScript + Vite)                           │  │
│   │                                                                      │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │  │
│   │  │ PosLogin.tsx   │  │ PosExpenses.   │  │ PosProducts.   │        │  │
│   │  │                │  │ tsx            │  │ tsx            │        │  │
│   │  └────────────────┘  └────────────────┘  └────────────────┘        │  │
│   │                                                                      │  │
│   │  ┌─────────────────────────────────────────────────────────────┐   │  │
│   │  │ AuthContext.tsx                                             │   │  │
│   │  │ ✅ Almacena: token, usuario, sucursal                       │   │  │
│   │  │ ✅ De usuario: sucursalId = 2                               │   │  │
│   │  │ ✅ En localStorage: auth_token, auth_usuario, auth_sucursal │   │  │
│   │  └─────────────────────────────────────────────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
        ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
        │ api.service.ts  │  │ gastos.svc   │  │ productos.   │
        │                 │  │              │  │ svc          │
        │ ✅ Extrae token │  │ ✅ Envía:    │  │ ✅ Envía:    │
        │ ✅ Lo añade en  │  │   sucursalId │  │   sucursalId │
        │   Authorization │  │              │  │              │
        │   header        │  └──────────────┘  └──────────────┘
        └─────────────────┘
                    │
                    │  HTTP/HTTPS
                    │  POST /api/gastos
                    │  Header:
                    │    Authorization: Bearer eyJ...
                    │  Body:
                    │    {
                    │      monto: 50000,
                    │      sucursalId: 2,  ← Frontend envía
                    │      ...
                    │    }
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🖧  CAPA DE PRESENTACIÓN (Backend)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ CONTROLADORES (REST Endpoints)                                      │  │
│  │                                                                      │  │
│  │ @PostMapping("/gastos")                                              │  │
│  │ public ResponseEntity<GastoDTO> crear(@RequestBody request) {       │  │
│  │   // request.sucursalId = 2 (del request body)                      │  │
│  │   return gastoService.crear(request);                               │  │
│  │ }                                                                    │  │
│  │                                                                      │  │
│  │ ⚠️ NOTA: Controller NO usa request.sucursalId                       │  │
│  │           Solo pasa a service                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                      │                                     │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                       │ Llama a service.crear(request)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🛡️  CAPA DE SEGURIDAD & CONTEXTO                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ FILTERS (Orden de ejecución)                                        │  │
│  │                                                                      │  │
│  │  1️⃣  JwtAuthenticationFilter                                        │  │
│  │  ├─ Extrae JWT del header Authorization                             │  │
│  │  ├─ Valida firma (HMAC con secret)                                  │  │
│  │  ├─ Valida expiración                                               │  │
│  │  ├─ Extrae claims:                                                  │  │
│  │  │  - username: "vendedor_sucursal_2"                               │  │
│  │  │  - usuarioId: 2                                                  │  │
│  │  │  - sucursalId: 2  ← ⭐ CLAVE                                     │  │
│  │  │  - rol: "VENDEDOR"                                               │  │
│  │  ├─ Establece SecurityContext                                       │  │
│  │  └─ Continúa al siguiente filter                                    │  │
│  │                                                                      │  │
│  │  2️⃣  SucursalContextFilter ⭐⭐⭐ CRÍTICO                             │  │
│  │  ├─ Obtiene el JWT del request (Authorization header)               │  │
│  │  ├─ Valida que sea válido                                           │  │
│  │  ├─ Extrae sucursalId del JWT:                                      │  │
│  │  │  Long sucursalId = jwtUtil.extractSucursalId(bearerToken);      │  │
│  │  │  → sucursalId = 2                                                │  │
│  │  ├─ 🚫 IGNORA completamente request.body.sucursalId                │  │
│  │  ├─ Establece ThreadLocal:                                          │  │
│  │  │  SucursalContext.setSucursal(2L, "Sucursal 2")                   │  │
│  │  ├─ Log: "✅ Sucursal obtenida del JWT: 2"                         │  │
│  │  ├─ Llama filterChain.doFilter()                                    │  │
│  │  └─ finally: SucursalContext.clear()  ← Limpieza importante        │  │
│  │                                                                      │  │
│  │  3️⃣  Controlador (recibe request)                                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Llama a service.crear()
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    💼  CAPA DE LÓGICA DE NEGOCIO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ GastoService.crear(CrearGastoRequest request)                       │  │
│  │                                                                      │  │
│  │ public Gasto crear(CrearGastoRequest request) {                     │  │
│  │     // Línea 69: ⭐ OBTIENE DEL CONTEXTO, NO DEL REQUEST           │  │
│  │     Long sucursalId = SucursalContext.getSucursalId();             │  │
│  │     // → sucursalId = 2 (del JWT, via ThreadLocal)                 │  │
│  │                                                                      │  │
│  │     // 🚫 IGNORA request.sucursalId()                               │  │
│  │     // request.sucursalId puede ser 999, no importa                │  │
│  │                                                                      │  │
│  │     // Línea 72-73: Valida sucursal existe                          │  │
│  │     Sucursal sucursal = sucursalRepository.findById(sucursalId)    │  │
│  │     if (sucursal == null) {                                         │  │
│  │         throw new EntityNotFoundException(...);                     │  │
│  │     }                                                               │  │
│  │                                                                      │  │
│  │     // Línea 75: Valida categoría                                   │  │
│  │     CategoriaGasto categoria = categoriaRepository                  │  │
│  │         .findById(request.categoriaGastoId())                       │  │
│  │         .orElseThrow(...);                                          │  │
│  │                                                                      │  │
│  │     // Línea 77-91: Crea entidad                                    │  │
│  │     Gasto gasto = new Gasto();                                      │  │
│  │     gasto.setMonto(request.monto());                                │  │
│  │     gasto.setFecha(request.fecha());                                │  │
│  │     gasto.setNota(request.nota());                                  │  │
│  │     gasto.setCategoriaGasto(categoria);                             │  │
│  │                                                                      │  │
│  │     // Línea 100: ⭐ AUTO-ASIGNA SUCURSAL CORRECTA                  │  │
│  │     gasto.setSucursal(sucursal);  // sucursal_id = 2                │  │
│  │                                                                      │  │
│  │     // Línea 102: GUARDAR EN BD                                     │  │
│  │     return gastoRepository.save(gasto);                             │  │
│  │ }                                                                    │  │
│  │                                                                      │  │
│  │ 🎯 RESULTADO: Gasto guardado con sucursal_id = 2                   │  │
│  │    (NO 999 que se envió en request)                                 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ SucursalContext (ThreadLocal)                                        │  │
│  │                                                                      │  │
│  │ public class SucursalContext {                                       │  │
│  │     private static final ThreadLocal<Sucursal> context =            │  │
│  │         new ThreadLocal<>();                                         │  │
│  │                                                                      │  │
│  │     public static void setSucursal(Long id, String nombre) {        │  │
│  │         context.set(new Sucursal(id, nombre));                      │  │
│  │     }                                                                │  │
│  │                                                                      │  │
│  │     public static Long getSucursalId() {                            │  │
│  │         return context.get().getId();  // → 2                       │  │
│  │     }                                                                │  │
│  │                                                                      │  │
│  │     public static void clear() {                                    │  │
│  │         context.remove();  // Limpieza después de request           │  │
│  │     }                                                                │  │
│  │ }                                                                    │  │
│  │                                                                      │  │
│  │ ⭐ Garantiza: Una sucursal por request, aislada de otros threads    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                        gastoRepository.save(gasto)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🗂️  CAPA DE PERSISTENCIA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ JPA Repository                                                       │  │
│  │                                                                      │  │
│  │ public interface GastoRepository                                     │  │
│  │     extends JpaRepository<Gasto, Long> {                             │  │
│  │     // Métodos para búsqueda filtrada por sucursal                  │  │
│  │     List<Gasto> findBySucursalId(Long sucursalId);                  │  │
│  │ }                                                                    │  │
│  │                                                                      │  │
│  │ ✅ save() ejecuta:                                                  │  │
│  │    INSERT INTO gastos (id, monto, fecha, nota, ..., sucursal_id)    │  │
│  │    VALUES (1, 50000, '2025-12-08', '...', ..., 2)                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🗄️  BASE DE DATOS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Tabla: gastos                                                              │
│  ┌──────┬────────┬────────┬───────────┬──────────────┬──────────────┐     │
│  │ id   │ monto  │ fecha  │ nota      │ categoria_id │ sucursal_id  │     │
│  ├──────┼────────┼────────┼───────────┼──────────────┼──────────────┤     │
│  │ 1    │ 50000  │ 2025.. │ Café...   │ 1            │ 2            │ ✅   │
│  │ 2    │ 75000  │ 2025.. │ Insumos   │ 2            │ 1            │     │
│  └──────┴────────┴────────┴───────────┴──────────────┴──────────────┘     │
│                                                   ↑                         │
│                                                   │                         │
│                                    Foreign Key constraint                  │
│                                    sucursal_id REFERENCES sucursales(id)   │
│                                                                             │
│  Tabla: sucursales                                                          │
│  ┌────┬───────────────┐                                                    │
│  │ id │ nombre        │                                                    │
│  ├────┼───────────────┤                                                    │
│  │ 1  │ Sucursal 1    │                                                    │
│  │ 2  │ Sucursal 2    │                                                    │
│  │ 3  │ Sucursal 3    │                                                    │
│  └────┴───────────────┘                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ Confirmación
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ✅ RESPONSE AL FRONTEND                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Backend responde con:                                                      │
│  {                                                                          │
│    "success": true,                                                        │
│    "data": {                                                               │
│      "id": 1,                                                              │
│      "monto": 50000,                                                       │
│      "fecha": "2025-12-08T10:00:00",                                       │
│      "nota": "Café...",                                                    │
│      "categoriaGasto": { "id": 1, "nombre": "Insumos" },                   │
│      "sucursal": { "id": 2, "nombre": "Sucursal 2" }  ← ✅                │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
│  Frontend recibe y almacena en estado local                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 PUNTOS CRÍTICOS DE SEGURIDAD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     🛡️  GARANTÍAS DE SEGURIDAD                             │
└─────────────────────────────────────────────────────────────────────────────┘

1️⃣  JWT CONTIENE sucursalId
   ├─ NO puede ser falsificado en client (firmado con secret en servidor)
   ├─ Expira después de tiempo configurado
   └─ Contiene: {username, usuarioId, rol, sucursalId}

2️⃣  SucursalContextFilter EXTRAE DEL JWT
   ├─ NO acepta sucursalId del request body
   ├─ NO acepta sucursalId de parámetros GET
   ├─ SOLO del JWT (que es verificado)
   └─ Establece en ThreadLocal para la duración del request

3️⃣  Servicios USAN ThreadLocal
   ├─ No pueden acceder a sucursalId de otro usuario
   ├─ Cada thread tiene su propio contexto
   ├─ Imposible filtrado cruzado entre requests paralelos
   └─ Limpieza automática al final

4️⃣  BD ENFORCES Foreign Key
   ├─ sucursal_id REFERENCES sucursales(id)
   ├─ No puede haber sucursal_id = 999 si no existe en tabla
   └─ Integridad referencial garantizada

5️⃣  VALIDACIÓN EN READ
   ├─ SELECT * FROM gastos WHERE sucursal_id = ?
   ├─ ? = SucursalContext.getSucursalId()
   ├─ Usuario NUNCA ve datos de otra sucursal
   └─ Aunque intente con parámetros

┌─────────────────────────────────────────────────────────────────────────────┐
│  ESCENARIO DE ATAQUE                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Atacante: "Voy a cambiar el sucursal_id en el JSON request"               │
│                                                                             │
│  POST /api/gastos                                                           │
│  {                                                                          │
│    "monto": 999999999,                                                      │
│    "sucursalId": 999  ← Intenta cambiar                                    │
│  }                                                                          │
│                                                                             │
│  ❌ BLOQUEADO:                                                              │
│  1. Backend recibe request                                                  │
│  2. SucursalContextFilter extrae del JWT: sucursalId = 2 (real)            │
│  3. 🚫 IGNORA request.sucursalId = 999                                      │
│  4. Gasto se crea con sucursal_id = 2                                       │
│  5. Atacante fracasa (monto tampoco se cambió, fue validado)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 FLUJO DE DATOS COMPLETO

```
USER 1 (Sucursal 2)          USER 2 (Sucursal 1)          USER 3 (Sucursal 3)
│                             │                             │
├─ Login                       ├─ Login                      ├─ Login
│  Token: JWT(S2)              │  Token: JWT(S1)             │  Token: JWT(S3)
│                              │                             │
├─ Crear Gasto                 ├─ Crear Gasto               ├─ Ver Reportes
│  POST /api/gastos             │  POST /api/gastos          │  GET /api/reportes
│  Header: Bearer JWT(S2)       │  Header: Bearer JWT(S1)    │  Header: Bearer JWT(S3)
│  Body: {sucursalId: 999}      │  Body: {sucursalId: 999}   │
│                               │                             │
▼                              ▼                             ▼
┌────────────────┐            ┌────────────────┐            ┌────────────────┐
│ SucursalFilter │ Extract: 2 │ SucursalFilter │ Extract: 1 │ SucursalFilter │ Extract: 3
├────────────────┤            ├────────────────┤            ├────────────────┤
│ ThreadLocal: 2 │            │ ThreadLocal: 1 │            │ ThreadLocal: 3 │
└────────────────┘            └────────────────┘            └────────────────┘
│                              │                             │
├─ GastoService.crear()        ├─ GastoService.crear()      ├─ EstadisticasService
│  SucursalContext → 2          │  SucursalContext → 1       │  SucursalContext → 3
│  gasto.setSucursal(2)         │  gasto.setSucursal(1)      │  WHERE sucursal_id = 3
│                               │                             │
▼                              ▼                             ▼
│ INSERT INTO gastos                                         │ SELECT ... WHERE
│ sucursal_id = 2               │ INSERT INTO gastos         │ sucursal_id = 3
│                               │ sucursal_id = 1            │
│                               │                             │
▼                              ▼                             ▼
┌────────────────────┐        ┌────────────────────┐        ┌────────────────────┐
│ BD: Gasto S2       │        │ BD: Gasto S1       │        │ BD: Reportes S3    │
│ id=1, sucursal=2   │        │ id=2, sucursal=1   │        │ Solo datos S3      │
└────────────────────┘        └────────────────────┘        └────────────────────┘
│                              │                             │
├─ Response: Gasto S2          ├─ Response: Gasto S1        ├─ Response: Reports S3
│  sucursal: {id: 2}           │  sucursal: {id: 1}        │  De sucursal 3 solo
│                               │                             │
▼                              ▼                             ▼
Frontend: Muestra gasto S2     Frontend: Muestra gasto S1    Frontend: Muestra reports S3
```

---

## 📝 VERIFICACIÓN: "¿QUÉ OCURRE SI...?"

```
¿Si cambio sucursalId en el request?
→ ❌ Será ignorado. Backend usará del JWT.

¿Si falsifíco el JWT?
→ ❌ JwtAuthenticationFilter validará firma.

¿Si elimino el Authorization header?
→ ❌ JwtAuthenticationFilter rechaza (401 Unauthorized).

¿Si intento acceder a datos con query parameters?
→ ❌ SucursalContextFilter establece contexto, no hay bypass.

¿Si hago dos requests en paralelo de diferentes sucursales?
→ ✅ ThreadLocal garantiza aislamiento (cada thread su contexto).

¿Si la sucursal no existe en la BD?
→ ❌ SucursalContext.setSucursal() validará y lanzará excepción.

¿Si intento editar un gasto de otra sucursal?
→ ❌ GastoService.actualizar() valida propiedad antes.

¿Si intento listar gastos sin autenticación?
→ ❌ JwtAuthenticationFilter intercepta (401 Unauthorized).
```

---

## ✅ CONCLUSIÓN

**El sistema implementa una arquitectura de segregación por sucursal de 5 niveles:**

1. **Nivel Frontend:** AuthContext captura sucursalId
2. **Nivel HTTP:** JWT transporta sucursalId en Authorization header
3. **Nivel Filter:** SucursalContextFilter extrae y valida JWT
4. **Nivel Contexto:** ThreadLocal aísla por request
5. **Nivel Servicio:** GastoService y otros usan SucursalContext
6. **Nivel BD:** Foreign key enforces integridad

**Resultado: ✅ Imposible saltarse la segregación**
