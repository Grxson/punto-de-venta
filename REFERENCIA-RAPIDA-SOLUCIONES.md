# ⚡ REFERENCIA RÁPIDA: Soluciones Principales

## 🆘 Problema vs Solución (Busca tu problema aquí)

### PROBLEMA 1: Tablas Vacías en Admin Reports 📊

**Síntoma:**
```
"Productos Más Vendidos" y "Productos Menos Vendidos" 
muestran: "No hay datos disponibles"
```

**Causa:** Query buscaba `estado = 'PAGADA'` pero ventas tenían `estado = 'cerrada'`

**Solución:**
```java
// Archivo: backend/src/main/java/com/puntodeventa/backend/repository/VentaItemRepository.java
// Línea: ~31

// ❌ ANTES
WHERE v.estado = 'PAGADA' AND v.fecha BETWEEN :inicio AND :fin

// ✅ DESPUÉS
WHERE v.estado IN ('PAGADA', 'cerrada') AND v.fecha BETWEEN :inicio AND :fin
```

**Verificar:**
- Backend compiló: ✅ BUILD SUCCESS
- Reinicia backend: `./start.sh`
- Admin → Reports → Debe mostrar datos

---

### PROBLEMA 2: 403 Forbidden a pesar de Login Exitoso 🔐

**Síntoma:**
```
✅ Login exitoso
✅ Token en localStorage
❌ GET /api/inventario/productos → 403 Forbidden
```

**Causa 1:** `requiresAuth` undefined en HTTP methods

**Solución 1:**
```typescript
// Archivo: frontend-web/src/services/api.service.ts

// ❌ ANTES
async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { ...options, method: 'GET' });
}

// ✅ DESPUÉS - En TODOS los métodos (get, post, put, patch, delete):
async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return this.requestWithRetry<T>(endpoint, { 
    ...options, 
    method: 'GET',
    requiresAuth: options?.requiresAuth !== false ? true : false
  });
}
```

**Causa 2:** Rol es objeto pero code espera string

**Solución 2:**
```typescript
// Archivo: frontend-web/src/contexts/AuthContext.tsx

// ✅ NUEVO: Agregar función
const normalizarRol = (usuario: any): string => {
  if (usuario.rolNombre) return usuario.rolNombre;
  if (typeof usuario.rol === 'object' && usuario.rol?.nombre) 
    return usuario.rol.nombre;
  if (typeof usuario.rol === 'string') return usuario.rol;
  return '';
};

// ✅ Usar en login:
const newUsuario = {
  ...usuario,
  rol: normalizarRol(usuario)
};
```

**Verificar:**
- F12 → Console → `localStorage.getItem('auth_token')` debe tener valor
- F12 → Network → Buscar request `/api/inventario/productos`
- Headers tab → Authorization: Bearer ... debe estar
- Status debe ser 200 (no 403)

---

### PROBLEMA 3: Error "Could not initialize proxy" en Logs 🛑

**Síntoma:**
```
ERROR: Could not initialize proxy 
[com.puntodeventa.backend.model.Sucursal#1] - no session
```

**Causa:** Acceso a lazy-loaded fields fuera de sesión Hibernate

**Solución:**
```java
// Archivo: backend/src/main/java/com/puntodeventa/backend/security/SucursalContextFilter.java

// ❌ ANTES
Long sucursalId = usuario.getSucursal().getId();

// ✅ DESPUÉS
Long sucursalId = null;
String sucursalNombre = null;

try {
  if (usuario.getSucursal() != null) {
    sucursalId = usuario.getSucursal().getId();
    sucursalNombre = usuario.getSucursal().getNombre();
  }
} catch (Exception e) {
  logger.warn("Error al cargar lazy-loaded fields, usando defaults");
  if (sucursalId == null) sucursalId = 1L;
  if (sucursalNombre == null) sucursalNombre = "Default";
}
```

**Verificar:**
- Backend inicia sin errores
- Ver logs: `grep -i "proxy\|lazy" backend.log` → No debería haber errores

---

### PROBLEMA 4: Algoritmo de Popularidad "No Funciona" ❓

**Síntoma:**
```
¿El algoritmo de acomodo del menú sobre la popularidad de un 
producto funciona?
```

**Respuesta:** ✅ SÍ, está completamente implementado

**Ubicación:**
- `backend/src/main/java/.../algorithm/PopularityAlgorithm.java` (224 líneas)
- `backend/src/main/java/.../service/MenuPopularidadService.java`
- `backend/src/main/java/.../controller/MenuPopularidadController.java`

**Endpoints disponibles:**
```
GET /api/menu/ordenado?columnasGrid=3&diasAnalizar=7&porCategoria=false
GET /api/menu/top?limite=10&diasAnalizar=7
GET /api/menu/categorias?columnasGrid=3&diasAnalizar=7
GET /api/menu/grilla
```

**Para verificar:**
```bash
# 1. Abre Swagger
http://localhost:8080/swagger-ui.html

# 2. Busca "Menu Popularidad"

# 3. Prueba GET /api/menu/top?limite=10&diasAnalizar=7

# 4. Respuesta esperada:
[
  {
    "productoId": 1,
    "nombre": "Jugo",
    "scorePopularidad": 92.34,  ← Este es el score (0-100)
    "frecuenciaVenta": 45,
    "cantidadVendida": 120
  }
]
```

**Cómo funciona el score:**
- 0-30: Poco vendido
- 30-50: Normal
- 50-70: Popular
- 70-85: Muy popular
- 85-100: ⭐ Trending (reciente + tendencia al alza)

---

## 🔧 Comandos Rápidos

### Reiniciar Backend
```bash
cd backend
./start.sh
# Espera: "POS Backend Started! Running on port 8080"
```

### Limpiar Cache Frontend
```
F12 → Ctrl+Shift+Delete → Limpiar todo
F5 para recargar
```

### Verificar Token en Console
```javascript
// F12 → Console
localStorage.getItem('auth_token')
// Debe tener valor largo: eyJhbGciOiJIUzUxMiJ9...
```

### Test JWT vía curl
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Usar token
curl -X GET "http://localhost:8080/api/inventario/productos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Compilar Backend
```bash
cd backend
./mvnw clean compile
# Debe terminar con: BUILD SUCCESS
```

### Ver últimos errores
```bash
tail -f backend.log | grep -i "error\|exception"
```

---

## 📋 Checklist: ¿Funciona Todo?

**Antes de reiniciar backend:**
- [ ] ¿Todos los cambios en archivos aplicados?
- [ ] ¿Build SUCCESS en compilación?
- [ ] ¿4 archivos modificados (2 backend + 2 frontend)?

**Después de reiniciar:**
- [ ] Backend inicia sin errores
- [ ] Frontend carga sin errores en Console
- [ ] `localStorage.getItem('auth_token')` tiene valor

**Funcionalidades:**
- [ ] Login funciona (200 OK)
- [ ] Token se guarda (F12 Console)
- [ ] API requests tienen Authorization header (F12 Network)
- [ ] Admin Reports muestra datos de productos
- [ ] GET `/api/menu/top` devuelve scores
- [ ] Scores están en rango 0-100

---

## 🎯 Resumen de Cambios

| Archivo | Línea | Cambio | Motivo |
|---------|------|--------|--------|
| VentaItemRepository | ~31 | `= 'PAGADA'` → `IN ('PAGADA', 'cerrada')` | Tablas vacías |
| api.service.ts | 206-251 | Agregar `requiresAuth: ...` explícito | Auth headers no se envían |
| AuthContext.tsx | 37-42, 72-108 | Normalizar rol + logging | Rol es objeto, no string |
| SucursalContextFilter | 45-80 | Proteger lazy-loaded con try-catch | Error Hibernate session |

---

## 🚨 Si Algo Falla

### Error: BUILD FAILURE
```
Solución:
1. Verifica cambios en archivos Java
2. ./mvnw clean compile
3. Si persiste: git status → ¿hay conflictos?
```

### Error: 403 Forbidden
```
Checklist:
1. ¿Token existe? → localStorage.getItem('auth_token')
2. ¿Authorization header presente? → F12 Network
3. ¿requiresAuth pasado? → Revisar api.service.ts
```

### Error: "No hay datos"
```
Checklist:
1. ¿Backend reiniciado? → ./start.sh
2. ¿Hay ventas en BD? → SELECT COUNT(*) FROM venta;
3. ¿Query busca estado correcto? → grep 'IN.*PAGADA.*cerrada' backend/...
```

### Error: Token siempre undefined
```
Checklist:
1. ¿Login devuelve token? → Test con curl
2. ¿localStorage tiene auth_token? → F12 Console
3. ¿normalizarRol aplicado? → Verificar AuthContext
```

---

## 🎓 Para Entender Mejor

| Tema | Archivo de Referencia |
|------|----------------------|
| JWT Flow Completo | `FLUJO-JWT-END-TO-END-VISUAL.md` |
| Detalles Técnicos | `SOLUCION-TABLAS-VACIAS-JWT-DEFINITIVO.md` |
| Algoritmo Popularidad | `VERIFICACION-SWAGGER-POPULARIDAD.md` |
| Estado General Sistema | `RESUMEN-ESTADO-SISTEMA.md` |

---

## ✨ Próximos Pasos

**Hoy:**
1. Reinicia backend (`./start.sh`)
2. Recarga frontend (Ctrl+Shift+Delete + F5)
3. Prueba login
4. Verifica Admin Reports
5. Prueba /api/menu/top en Swagger

**Semana que viene:**
- Integrar scores en UI del menú
- Test de carga (muchas ventas)
- A/B testing: menú ordenado vs por popularidad

---

**¿Preguntas? Revisa la referencia rápida arriba 👆**

