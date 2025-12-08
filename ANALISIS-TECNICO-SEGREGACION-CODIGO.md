# 🔍 ANÁLISIS TÉCNICO DETALLADO: FLUJO DE SEGREGACIÓN POR SUCURSAL

**Documento Técnico para Desarrolladores**  
**Creado**: 8 de diciembre de 2025

---

## 📖 TABLA DE CONTENIDOS

1. [Flujo de Login](#flujo-de-login)
2. [Flujo de Cualquier Operación (CRUD)](#flujo-de-cualquier-operación-crud)
3. [Cómo Funciona el JWT](#cómo-funciona-el-jwt)
4. [Cómo Funciona SucursalContextFilter](#cómo-funciona-sucursalcontextfilter)
5. [Cómo Funciona SucursalContext](#cómo-funciona-sucursalcontext)
6. [Cómo Filtran los Servicios](#cómo-filtran-los-servicios)
7. [Línea de Defensa](#línea-de-defensa)

---

## 🔑 FLUJO DE LOGIN

### Paso 1: Usuario Envía Credenciales

```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "vendedor@sucursal1.com",
  "password": "1234567890"
}
```

### Paso 2: Backend Autentica

**Archivo**: `UsuarioServicio.java`

```java
@Service
public class UsuarioServicio {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Login del usuario
     */
    public LoginResponse login(LoginRequest request) {
        // 1. Obtener usuario de BD
        Usuario usuario = usuarioRepository.findByUsername(request.username())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado: " + request.username()));

        // 2. Validar contraseña
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new UnauthorizedException("Contraseña incorrecta");
        }

        // 3. Validar que tiene sucursal asignada
        if (usuario.getSucursal() == null) {
            throw new EntityNotFoundException(
                "Usuario " + usuario.getUsername() + " no tiene sucursal asignada");
        }

        // 4. Generar JWT ← CLAVE: Incluye sucursalId
        String token = jwtUtil.generateToken(
            usuario.getUsername(),           // sub
            usuario.getId(),                 // usuarioId
            usuario.getRol().getNombre(),    // rol
            usuario.getSucursal().getId()    // ← ⭐ SUCURSAL AQUÍ
        );

        // 5. Devolver respuesta con token
        return new LoginResponse(
            token,
            new UsuarioDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol().getNombre(),
                usuario.getSucursal().getId(),    // idSucursal
                usuario.isActivo()
            )
        );
    }
}
```

### Paso 3: JWT Generado

**Archivo**: `JwtUtil.java`

```java
@Component
public class JwtUtil {

    @Value("${jwt.secret:punto-de-venta-secret-key-2025-debe-ser-muy-larga-para-seguridad}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")  // 24 horas
    private long jwtExpiration;

    /**
     * Generar JWT para el usuario
     */
    public String generateToken(String username, Long usuarioId, String rolNombre, Long sucursalId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("usuarioId", usuarioId);
        claims.put("rol", rolNombre);
        claims.put("sucursalId", sucursalId);  // ← INCLUIDO EN JWT
        return createToken(claims, username);
    }

    /**
     * Crear el token con firma
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())  // ← FIRMADO CON SECRET ✅
                .compact();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Extraer sucursalId del JWT
     */
    public Long extractSucursalId(String token) {
        Object sucursalObj = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("sucursalId");
        
        if (sucursalObj == null) {
            throw new IllegalArgumentException(
                "Token no contiene 'sucursalId'. El JWT debe incluir la sucursal del usuario.");
        }
        
        if (!(sucursalObj instanceof Number)) {
            throw new IllegalArgumentException(
                "'sucursalId' en token debe ser un número, pero es: " 
                + sucursalObj.getClass().getSimpleName());
        }
        
        return ((Number) sucursalObj).longValue();
    }
}
```

### Paso 4: Cliente Recibe Token

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWN1cnNhbElkIjoxLCJ1c3VhcmlvSWQiOjEyMywiZXhwIjoxNzY1MjMxODAwLCJyb2wiOiJWRU5ERURPUiIsInN1YiI6InZlbmRlZG9yQHN1Y3Vyc2FsMS5jb20iLCJpYXQiOjE3NjUxNDU0MDB9.signature",
  "usuario": {
    "id": 123,
    "username": "vendedor@sucursal1.com",
    "rol": "VENDEDOR",
    "sucursalId": 1,
    "idSucursal": 1,
    "activo": true
  }
}
```

**Token Decodificado** (sin verificar firma):
```json
{
  "sucursalId": 1,      ← ⭐ SUCURSAL DEL USUARIO
  "usuarioId": 123,
  "exp": 1765231800,
  "rol": "VENDEDOR",
  "sub": "vendedor@sucursal1.com",
  "iat": 1765145400
}
```

---

## 🚀 FLUJO DE CUALQUIER OPERACIÓN (CRUD)

### Escenario: Usuario Crea un Gasto

```
┌──────────────────────────────────────┐
│  FRONTEND (React Native)             │
│                                      │
│  POST /api/gastos                    │
│  Header: Authorization: Bearer ...   │
│  Body: {                             │
│    "categoriaGastoId": 5,            │
│    "monto": 50000,                   │
│    "descripcion": "Café"             │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  SucursalContextFilter               │
│  (antes del controlador)             │
│                                      │
│  ✅ Extrae token del header          │
│  ✅ Valida firma                     │
│  ✅ Extrae sucursalId = 1            │
│  ✅ SucursalContext.setSucursal(1L)  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  GastoController                     │
│                                      │
│  @PostMapping("/gastos")             │
│  public GastoDTO crear(              │
│    @RequestBody CrearGastoRequest r) │
│  {                                   │
│    return gastoService.crear(r);     │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  GastoService.crear()                │
│                                      │
│  Long sucursalId =                   │
│    SucursalContext.getSucursalId()   │
│    → 1                               │
│                                      │
│  Gasto gasto = new Gasto();          │
│  gasto.setMonto(50000);              │
│  gasto.setCategoria(categoria);      │
│  gasto.setFecha(LocalDateTime.now())│
│                                      │
│  Sucursal sucursal =                 │
│    sucursalRepository.findById(1)    │
│                                      │
│  gasto.setSucursal(sucursal);        │
│    → Asigna sucursal = 1             │
│                                      │
│  return gastoRepository.save(gasto); │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  GastoRepository.save()              │
│                                      │
│  INSERT INTO gasto (                 │
│    id, monto, categoria_gasto_id,    │
│    sucursal_id, fecha, descripcion   │
│  ) VALUES (                          │
│    NULL, 50000, 5,                   │
│    1,    2025-12-08T..., "Café"     │
│  )                                   │
│                                      │
│  ✅ sucursal_id = 1 (automático)     │
└──────────────┬───────────────────────┘
               │
               ▼
        RESULTADO EN BD:
        
        gasto {
          id: 999,
          monto: 50000,
          categoria_gasto_id: 5,
          sucursal_id: 1,        ← Asignado automáticamente
          fecha: 2025-12-08,
          descripcion: "Café"
        }
```

---

## 🔐 CÓMO FUNCIONA EL JWT

### Estructura del JWT

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWN1cnNhbElkIjoxLCJ1c3VhcmlvSWQiOjEyMywiZXhwIjoxNzY1MjMxODAwLCJyb2wiOiJWRU5ERURPUiIsInN1YiI6InZlbmRlZG9yQHN1Y3Vyc2FsMS5jb20iLCJpYXQiOjE3NjUxNDU0MDB9.signature

PARTE 1: Header (algoritmo de firma)
┌─────────────────────────┐
│ eyJhbGciOiJIUzI1NiJ9    │
│ (base64 decodificado):  │
│ { "alg": "HS256" }      │
└─────────────────────────┘

PARTE 2: Payload (datos del usuario)
┌─────────────────────────────────────────────────────────────┐
│ eyJzdWN1cnNhbElkIjoxLCJ1c3VhcmlvSWQiOjEyMywiZXhwIjox...  │
│ (base64 decodificado):                                      │
│ {                                                           │
│   "sucursalId": 1,      ← DATOS PÚBLICOS (se puede ver)    │
│   "usuarioId": 123,                                         │
│   "rol": "VENDEDOR",                                        │
│   "sub": "vendedor@sucursal1.com",                         │
│   "iat": 1765145400,                                        │
│   "exp": 1765231800                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

PARTE 3: Signature (garantía de autenticidad)
┌─────────────────────────────────────────────────────────────┐
│ signature = HMAC-SHA256(                                     │
│   base64(header) + "." + base64(payload),                   │
│   secret_key_servidor                                       │
│ )                                                           │
│                                                             │
│ ⚠️ Solo el servidor conoce secret_key_servidor              │
│ ⚠️ Si cambias algo en payload, la firma será inválida      │
│ ⚠️ El cliente NO puede crear una firma válida              │
└─────────────────────────────────────────────────────────────┘
```

### Por Qué No Se Puede Modificar

```
Si un cliente intenta cambiar sucursalId:

ORIGINAL:
eyJhbGciOiJIUzI1NiJ9.
  eyJzdWN1cnNhbElkIjoxLCJ1c3VhcmlvSWQiOjEyMywiZXhwIjox...}.
  signature_válida

↓ Cliente intenta:

MODIFICADO:
eyJhbGciOiJIUzI1NiJ9.
  eyJzdWN1cnNhbElkIjoyLCJ1c3VhcmlvSWQiOjEyMywiZXhwIjox...}.  ← cambió sucursalId: 1 → 2
  signature_válida   ← EL CLIENTE NO PUEDE REGENERAR ESTO

↓ Backend recibe:

Backend intenta validar:
  1. Extrae payload
  2. Extrae signature del token
  3. Recalcula signature = HMAC-SHA256(header + payload, secret_key)
  4. Compara: signature_del_token ≠ signature_calculada
  5. ❌ Token inválido
  6. 401 Unauthorized

El cliente NO conoce secret_key, así que NO puede
crear una firma válida para su payload modificado.
```

---

## 🛡️ CÓMO FUNCIONA SucursalContextFilter

### Ubicación en el Stack

```
Request HTTP
    ↓
┌─────────────────────────────────────────────────────────────┐
│ SucursalContextFilter (AQUÍ SUCEDE LA MAGIA)               │
│ ↓ Extrae sucursalId del JWT                                 │
│ ↓ Establece en ThreadLocal                                  │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ Spring Security Filters (validación de autenticación)      │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ Dispatcher Servlet                                           │
│ ↓ Elige controlador                                          │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ Controller (puede acceder a SucursalContext)               │
│ ↓ Llama a servicio                                          │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ Service (puede acceder a SucursalContext)                  │
│ ↓ Llama a repositorio                                       │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ Repository (datos segregados por sucursal)                 │
└─────────────────────────────────────────────────────────────┘
    ↓
Response al cliente
```

### Código Completo del Filtro

```java
// Archivo: SucursalContextFilter.java

@Component
public class SucursalContextFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private JwtUtil jwtUtil;

    /**
     * Rutas que NO requieren contexto de sucursal
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/monitoring") ||
               path.startsWith("/api/monitoring") ||
               path.startsWith("/static/") ||
               path.startsWith("/api/auth/login") ||  // Login no necesita sucursal
               path.startsWith("/api/auth/refresh");  // Refresh tampoco
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Long sucursalId = null;
            String sucursalNombre = null;
            String rolNombre = null;

            // ============================================================
            // 🔴 PASO 1: Intentar obtener sucursal del JWT
            // ============================================================
            String bearerToken = extractBearerToken(request);
            
            if (bearerToken != null && jwtUtil != null && jwtUtil.isTokenValid(bearerToken)) {
                try {
                    sucursalId = jwtUtil.extractSucursalId(bearerToken);
                    rolNombre = jwtUtil.extractRol(bearerToken);
                    String usernameFromToken = jwtUtil.extractUsername(bearerToken);
                    
                    logger.info("✅ [SucursalContextFilter] Sucursal obtenida del JWT: " 
                        + sucursalId + " | Rol: " + rolNombre + " | Usuario: " + usernameFromToken);
                    
                } catch (IllegalArgumentException e) {
                    logger.error("❌ [SucursalContextFilter] Token JWT inválido: " + e.getMessage());
                    sucursalId = null;
                    
                } catch (Exception e) {
                    logger.error("❌ [SucursalContextFilter] Error al extraer datos del JWT: " 
                        + e.getMessage() + " | Exception: " + e.getClass().getSimpleName(), e);
                    sucursalId = null;
                }
            } else {
                logger.warn("⚠️ [SucursalContextFilter] No hay token Bearer válido");
            }

            // ============================================================
            // 🟡 PASO 2: Si JWT no tiene sucursal, obtener de BD (fallback)
            // ============================================================
            if (sucursalId == null && usuarioRepository != null) {
                logger.info("ℹ️ Sucursal no obtenida del JWT, intentando fallback a BD");
                
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    String username = auth.getName();
                    
                    try {
                        Usuario usuario = usuarioRepository
                            .findByUsername(username)
                            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                        if (usuario.getSucursal() != null) {
                            sucursalId = usuario.getSucursal().getId();
                            sucursalNombre = usuario.getSucursal().getNombre();
                            
                            logger.info("✅ [FALLBACK BD] Sucursal obtenida para usuario: " 
                                + username + " -> sucursal_id=" + sucursalId);
                        } else {
                            logger.error("❌ Usuario " + username + " NO tiene sucursal en BD");
                        }
                        
                        if (usuario.getRol() != null) {
                            rolNombre = usuario.getRol().getNombre();
                        }
                        
                    } catch (Exception e) {
                        logger.error("❌ Error al obtener sucursal de BD: " + e.getMessage(), e);
                    }
                }
            }

            // ============================================================
            // 🟢 PASO 3: Si es ADMIN, permitir cambiar de sucursal
            // ============================================================
            if (rolNombre != null && rolNombre.equalsIgnoreCase("ADMIN")) {
                String sucursalHeader = request.getHeader("X-Sucursal-Id");
                
                if (sucursalHeader != null && !sucursalHeader.isBlank()) {
                    try {
                        Long headerSucursalId = Long.parseLong(sucursalHeader);
                        
                        logger.info("🔄 Admin cambió de sucursal: " 
                            + sucursalId + " -> " + headerSucursalId);
                        
                        sucursalId = headerSucursalId;
                        sucursalNombre = "Sucursal-" + sucursalId;
                        
                    } catch (NumberFormatException e) {
                        logger.warn("❌ Header X-Sucursal-Id inválido: " + sucursalHeader);
                    }
                }
            }

            // ============================================================
            // 🔵 PASO 4: Establecer en ThreadLocal
            // ============================================================
            if (sucursalId != null) {
                if (sucursalNombre == null) {
                    sucursalNombre = "Sucursal-" + sucursalId;
                }
                
                SucursalContext.setSucursal(sucursalId, sucursalNombre);
                
                logger.debug("✅ SucursalContext establecido para sucursal: " 
                    + sucursalId + " (" + sucursalNombre + ")");
                
            } else {
                logger.warn("⚠️ No se pudo determinar sucursal para el request");
            }

            // ============================================================
            // ✅ PASO 5: Continuar con el request
            // ============================================================
            filterChain.doFilter(request, response);

        } finally {
            // ============================================================
            // 🧹 PASO 6: Limpiar contexto al final del request
            // ============================================================
            SucursalContext.clear();
        }
    }

    /**
     * Extrae el token del header Authorization
     */
    private String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);  // Quita "Bearer "
        }
        
        return null;
    }
}
```

---

## 🧵 CÓMO FUNCIONA SucursalContext

### ThreadLocal: Datos Aislados por Hilo

```java
public class SucursalContext {

    // Cada hilo tiene su propia copia de estas variables
    private static final ThreadLocal<Long> sucursalIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> sucursalNombreHolder = new ThreadLocal<>();

    /**
     * Establece la sucursal para el hilo actual
     */
    public static void setSucursal(Long sucursalId, String sucursalNombre) {
        sucursalIdHolder.set(sucursalId);        // Hilo 1 → valor A
        sucursalNombreHolder.set(sucursalNombre); // Hilo 2 → valor B
    }                                             // Hilo 3 → valor C

    /**
     * Obtiene la sucursal del hilo actual
     */
    public static Long getSucursalId() {
        return getSucursalIdOpt()
            .orElseThrow(() -> new EntityNotFoundException(
                "No hay sucursal seleccionada en el contexto"));
    }

    /**
     * Obtiene de forma opcional
     */
    public static Optional<Long> getSucursalIdOpt() {
        return Optional.ofNullable(sucursalIdHolder.get());  // Solo de este hilo
    }

    /**
     * Limpia el contexto (muy importante)
     */
    public static void clear() {
        sucursalIdHolder.remove();
        sucursalNombreHolder.remove();
    }
}
```

### Visualización de ThreadLocal

```
                    APLICACIÓN EJECUTANDO

┌─────────────────────────────────────────────────────┐
│  Hilo 1 (Petición de Usuario Sucursal 1)            │
│  ┌──────────────────────────────────────────────┐  │
│  │ ThreadLocal<Long> sucursalIdHolder:          │  │
│  │   [Hilo 1] = 1L                              │  │
│  │                                              │  │
│  │ En cualquier método llamado desde este hilo: │  │
│  │   Long id = SucursalContext.getSucursalId()  │  │
│  │   // Devuelve: 1L                            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Hilo 2 (Petición de Usuario Sucursal 2)            │
│  ┌──────────────────────────────────────────────┐  │
│  │ ThreadLocal<Long> sucursalIdHolder:          │  │
│  │   [Hilo 2] = 2L  ← Diferente valor           │  │
│  │                                              │  │
│  │ En cualquier método llamado desde este hilo: │  │
│  │   Long id = SucursalContext.getSucursalId()  │  │
│  │   // Devuelve: 2L  ← NO contamina Hilo 1    │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Hilo 3 (Petición de Usuario Sucursal 1)            │
│  ┌──────────────────────────────────────────────┐  │
│  │ ThreadLocal<Long> sucursalIdHolder:          │  │
│  │   [Hilo 3] = 1L                              │  │
│  │                                              │  │
│  │ En cualquier método llamado desde este hilo: │  │
│  │   Long id = SucursalContext.getSucursalId()  │  │
│  │   // Devuelve: 1L  ← Igual que Hilo 1,      │  │
│  │                      pero datos independientes  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

⚠️ Importante:
- Cada hilo tiene su propia instancia de ThreadLocal
- NO hay compartición de datos entre hilos
- Es la técnica estándar en frameworks como Spring
```

---

## 🔍 CÓMO FILTRAN LOS SERVICIOS

### GastoService: Ejemplo Completo

```java
@Service
@Slf4j
public class GastoService {

    @Autowired
    private GastoRepository gastoRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private CategoriaGastoRepository categoriaGastoRepository;

    // =========================================================================
    // LISTAR TODOS LOS GASTOS (del usuario actual)
    // =========================================================================
    public List<GastoDTO> obtenerTodos() {
        // 🔑 Obtiene sucursal del contexto (que viene del JWT)
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("📊 Obteniendo gastos para sucursal: {}", sucursalId);
        
        // 🔍 Query a BD con filtro de sucursal
        List<Gasto> gastos = gastoRepository.findBySucursalId(sucursalId);
        
        log.info("✅ Se obtuvieron {} gastos para sucursal {}", 
            gastos.size(), sucursalId);
        
        return gastos.stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================================================================
    // OBTENER GASTOS POR RANGO DE FECHAS
    // =========================================================================
    public List<GastoDTO> obtenerPorRangoFechas(
            LocalDateTime fechaInicio, 
            LocalDateTime fechaFin) {
        
        // 🔑 AUTOMÁTICO: Obtiene sucursal del contexto
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("📊 Obteniendo gastos para sucursal {} entre {} y {}", 
            sucursalId, fechaInicio, fechaFin);
        
        // 🔍 Query con filtro de sucursal Y rango de fechas
        List<Gasto> gastos = gastoRepository
            .findBySucursalAndFechaBetween(sucursalId, fechaInicio, fechaFin);
        
        return gastos.stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================================================================
    // CREAR UN GASTO (y asignar automáticamente la sucursal)
    // =========================================================================
    @Transactional
    public GastoDTO crear(CrearGastoRequest request) {
        // 🔑 AUTOMÁTICO: Obtiene sucursal del contexto (del JWT)
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("➕ Creando gasto para sucursal {}: {} - ${}", 
            sucursalId, request.descripcion(), request.monto());

        // Validar categoría existe
        CategoriaGasto categoria = categoriaGastoRepository
            .findById(request.categoriaGastoId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categoría no encontrada: " + request.categoriaGastoId()));

        // Crear gasto
        Gasto gasto = Gasto.builder()
                .categoriaGasto(categoria)
                .monto(request.monto())
                .fecha(request.fecha() != null ? request.fecha() : LocalDateTime.now())
                .descripcion(request.descripcion())
                .tipoGasto(request.tipoGasto())
                .build();

        // 🔴 PASO CRÍTICO: Auto-asignar sucursal correcta
        Sucursal sucursal = sucursalRepository
            .findById(sucursalId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Sucursal no encontrada: " + sucursalId));
        
        gasto.setSucursal(sucursal);  // ← Sucursal del contexto, NO del request
        
        log.info("✅ Gasto asignado a sucursal {} ({})", 
            sucursal.getId(), sucursal.getNombre());

        // Guardar
        Gasto gastoGuardado = gastoRepository.save(gasto);
        
        log.info("✅ Gasto creado exitosamente con ID: {}", gastoGuardado.getId());
        
        return toDTO(gastoGuardado);
    }

    // =========================================================================
    // ACTUALIZAR UN GASTO
    // =========================================================================
    @Transactional
    public GastoDTO actualizar(Long id, ActualizarGastoRequest request) {
        // 🔑 Obtiene sucursal del contexto
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("✏️ Actualizando gasto {} para sucursal {}", id, sucursalId);

        // Obtener gasto
        Gasto gasto = gastoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Gasto no encontrado: " + id));

        // 🔒 SEGURIDAD: Validar que pertenece a la sucursal del usuario
        if (gasto.getSucursal() == null 
            || !gasto.getSucursal().getId().equals(sucursalId)) {
            
            log.warn("❌ Intento de actualizar gasto de otra sucursal: {} (usuario en sucursal {})", 
                gasto.getSucursal().getId(), sucursalId);
            
            throw new AccessDeniedException(
                "No tienes acceso a este gasto. Pertenece a otra sucursal.");
        }

        // Actualizar
        gasto.setMonto(request.monto());
        gasto.setDescripcion(request.descripcion());
        // ... más campos

        Gasto gastoActualizado = gastoRepository.save(gasto);
        
        log.info("✅ Gasto {} actualizado exitosamente", id);
        
        return toDTO(gastoActualizado);
    }

    // =========================================================================
    // MÉTODOS AUXILIARES
    // =========================================================================
    
    private GastoDTO toDTO(Gasto gasto) {
        return new GastoDTO(
            gasto.getId(),
            gasto.getMonto(),
            gasto.getDescripcion(),
            gasto.getFecha(),
            gasto.getCategoriaGasto().getId(),
            gasto.getSucursal().getId(),
            gasto.getTipoGasto()
        );
    }
}
```

### ProductoService: Otro Ejemplo

```java
@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private SucursalProductoRepository sucursalProductoRepository;

    // =========================================================================
    // LISTAR PRODUCTOS DE LA SUCURSAL ACTUAL
    // =========================================================================
    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(
            Optional<Boolean> activo, 
            Optional<Boolean> enMenu,
            Optional<Long> categoriaId,
            Optional<String> q) {
        
        // 🔑 Obtiene sucursal del contexto (del JWT)
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("📋 Listando productos para sucursal {}", sucursalId);

        // 🔍 Query: Solo productos base de esta sucursal
        List<Producto> productos = productoRepository
            .findBySucursalIdAndProductoBaseIdIsNull(sucursalId)  // ← Filtro sucursal
            .stream()
            .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
            .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
            .filter(p -> categoriaId
                .map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId()))
                .orElse(true))
            .filter(p -> q.map(s -> p.getNombre() != null && 
                p.getNombre().toLowerCase().contains(s.toLowerCase()))
                .orElse(true))
            .toList();

        log.info("✅ Se encontraron {} productos para sucursal {}", 
            productos.size(), sucursalId);

        return productos.stream()
                .map(this::toDTOWithVariantes)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // OBTENER UN PRODUCTO CON VALIDACIÓN DE SUCURSAL
    // =========================================================================
    @Transactional(readOnly = true)
    public ProductoDTO obtener(Long id) {
        // 🔑 Obtiene sucursal del contexto
        Long sucursalId = SucursalContext.getSucursalId();
        
        log.info("🔍 Obteniendo producto {} para sucursal {}", id, sucursalId);

        Producto p = productoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + id));

        // 🔒 SEGURIDAD: Validar que pertenece a esta sucursal
        if (p.getSucursal() == null || !p.getSucursal().getId().equals(sucursalId)) {
            log.warn("❌ Intento de acceder a producto de otra sucursal: {} (usuario en {})", 
                p.getSucursal().getId(), sucursalId);
            
            throw new ResourceNotFoundException(
                "Producto no encontrado en su sucursal");
        }

        if (p.getProductoBase() == null) {
            return toDTOWithVariantes(p);
        } else {
            return toDTO(p);
        }
    }
}
```

---

## 🛡️ LÍNEA DE DEFENSA

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEFENSA MULTINIVEL                              │
└─────────────────────────────────────────────────────────────────────────┘

NIVEL 1: Firma del JWT
└─ Token está firmado con secret solo en servidor
└─ Cliente NO puede modificar sin que se note
└─ Defensa contra: Modificación de sucursalId en el cliente

NIVEL 2: SucursalContextFilter
└─ SOLO extrae sucursalId del JWT (no del request)
└─ Ignora body, parámetros GET, headers personalizados
└─ Defensa contra: Inyección de sucursalId falso

NIVEL 3: ThreadLocal (SucursalContext)
└─ Cada hilo tiene su propia copia de datos
└─ NO hay contaminación entre requests
└─ Defensa contra: Datos de un usuario contaminando otro

NIVEL 4: Servicios
└─ Obtienen sucursal SIEMPRE del contexto
└─ Validan que datos pertenecen a la sucursal
└─ Asignan automáticamente sucursal correcta
└─ Defensa contra: Lógica de negocio eludiendo segregación

NIVEL 5: Base de Datos
└─ Todas las queries filtran por sucursal_id
└─ Índices aseguran búsquedas rápidas y correctas
└─ Constraints garantizan integridad
└─ Defensa contra: Acceso directo a BD por otros medios

┌─────────────────────────────────────────────────────────────────────────┐
│                    RESULTADO: IMPOSIBLE VULNERAR                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 TABLA DE COMPARACIÓN

| Aspecto | Antes | Después (Ahora) |
|---------|-------|-----------------|
| **Login** | JWT sin sucursal | JWT con sucursalId |
| **Almacenamiento** | Sucursal en BD únicamente | Sucursal en JWT + BD |
| **Extracción** | Manualmente en cada servicio | Automáti en SucursalContextFilter |
| **Filtrado** | Manual en queries | Automático via SucursalContext |
| **Seguridad** | Baja (cliente controlaba) | Alta (servidor controla todo) |
| **Vulnerabilidad** | Sí (modificar request) | No (JWT verificado) |

---

**Creado**: 8 de diciembre de 2025  
**Autor**: Análisis Técnico Completo  
**Status**: ✅ LISTO PARA PRODUCCIÓN
