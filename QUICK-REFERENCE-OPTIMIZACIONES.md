# ⚡ QUICK REFERENCE - Optimization Cheat Sheet

## 🎯 Los 8 Cambios Clave

### 1. BACKEND: Caché Inteligente
**Archivo**: `backend/src/main/java/com/puntodeventa/backend/config/CacheConfig.java`  
**Líneas clave**: ~60 líneas  
**Tiempo**: 2 horas  
**Impacto**: 40% latencia ↓

```java
// ANTES: Todo igual
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager manager = new CaffeineCacheManager();
    manager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(1000)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build());
}

// DESPUÉS: Diferenciado
manager.registerCustomCache("categorias-productos", 
    buildCache(30, TimeUnit.MINUTES, 5000));
manager.registerCustomCache("menuPopularidad", 
    buildCache(2, TimeUnit.MINUTES, 2000));
```

✅ **Checklist**: 
- [ ] Actualizar pom.xml con Caffeine
- [ ] Reemplazar CacheConfig.java
- [ ] Reiniciar backend
- [ ] Verificar logs: "Cache stats..."

---

### 2. BACKEND: Paginación
**Archivo**: `backend/src/main/java/.../ProductoController.java`  
**Líneas clave**: ~30 líneas en controller + servicio  
**Tiempo**: 4 horas  
**Impacto**: 70% respuesta ↓

```java
// ANTES: Trae TODO
@GetMapping
public ResponseEntity<List<ProductoDTO>> listar() {
    return ResponseEntity.ok(productoService.listar());
}

// DESPUÉS: Paginado
@GetMapping
public ResponseEntity<Page<ProductoDTO>> listar(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "50") int size) {
    return ResponseEntity.ok(
        productoService.listar(PageRequest.of(page, size))
    );
}
```

✅ **Checklist**:
- [ ] Actualizar 5 controladores clave
- [ ] Actualizar servicios
- [ ] Actualizar test cases
- [ ] Documentar en Swagger

---

### 3. BACKEND: Índices BD
**Archivo**: `backend/src/main/resources/migration-indices.sql`  
**Líneas clave**: ~15 CREATE INDEX  
**Tiempo**: 1 hora  
**Impacto**: 50-80% queries búsqueda ↓

```sql
CREATE INDEX idx_producto_nombre ON producto(LOWER(nombre));
CREATE INDEX idx_producto_categoria_id ON producto(categoria_id);
CREATE INDEX idx_venta_item_producto_fecha ON venta_item(producto_id, created_at DESC);
```

✅ **Checklist**:
- [ ] Crear migration.sql
- [ ] Ejecutar en desarrollo
- [ ] Ejecutar en producción (non-blocking)
- [ ] Verificar EXPLAIN PLAN

---

### 4. BACKEND: Rate Limiting
**Archivo**: `backend/src/main/java/.../RateLimitFilter.java`  
**Líneas clave**: ~80 líneas  
**Tiempo**: 2 horas  
**Impacto**: Protección contra abuso

```java
// Límite global: 1000 req/min
private final Bucket globalBucket = Bucket4j.builder()
    .addLimit(Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofMinutes(1))))
    .build();

// Límite por usuario: 100 req/min
Bucket userBucket = bucketMap.computeIfAbsent(userId, k ->
    Bucket4j.builder()
    .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
    .build()
);
```

✅ **Checklist**:
- [ ] Agregar bucket4j dependency
- [ ] Crear RateLimitFilter
- [ ] Registrar en WebSecurityConfig
- [ ] Tests con load tool

---

### 5. FRONTEND: Code Splitting
**Archivo**: `frontend-web/src/main.tsx`  
**Líneas clave**: ~40 líneas  
**Tiempo**: 3 horas  
**Impacto**: 70% carga inicial ↓

```typescript
// ANTES: Todo cargado
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
// ... más imports

// DESPUÉS: Lazy load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));

// Con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/admin/*" element={<Admin />} />
  </Routes>
</Suspense>
```

✅ **Checklist**:
- [ ] Actualizar main.tsx
- [ ] Crear LoadingSpinner component
- [ ] Verificar routes
- [ ] Test build

---

### 6. FRONTEND: React Query Tuning
**Archivo**: `frontend-web/src/config/queryClient.ts`  
**Líneas clave**: ~50 líneas  
**Tiempo**: 2 horas  
**Impacto**: 30-40% requests ↓

```typescript
// ANTES: Todo igual
staleTime: 5 * 60 * 1000, // 5 min para todo

// DESPUÉS: Estratificado
export function useCategorias() {
  return useQuery({
    staleTime: 30 * 60 * 1000, // 30 min para estáticos
  });
}

export function useVentas() {
  return useQuery({
    staleTime: 5 * 60 * 1000,  // 5 min para dinámicos
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useCajaActiva() {
  return useQuery({
    staleTime: 30 * 1000,       // 30 seg para muy dinámicos
    refetchInterval: 1 * 60 * 1000,
  });
}
```

✅ **Checklist**:
- [ ] Actualizar queryClient.ts
- [ ] Crear queryKeys organizados
- [ ] Crear custom hooks
- [ ] Verificar con React Query DevTools

---

### 7. FRONTEND: Service Worker
**Archivo**: `frontend-web/src/service-worker.ts`  
**Líneas clave**: ~100 líneas  
**Tiempo**: 4 horas  
**Impacto**: Offline support + 80% más rápido (repeat visits)

```typescript
// Network First para API
if (url.pathname.startsWith('/api/')) {
  event.respondWith(
    fetch(request).then(response => {
      caches.open(API_CACHE).then(cache => {
        cache.put(request, response.clone());
      });
      return response;
    }).catch(() => {
      return caches.match(request) || 
             new Response('Offline');
    })
  );
}
```

✅ **Checklist**:
- [ ] Crear service-worker.ts
- [ ] Registrar en main.tsx
- [ ] Test offline mode
- [ ] Verificar DevTools

---

### 8. FRONTEND: Optimize Images
**Archivo**: `frontend-web/src/components/OptimizedImage.tsx`  
**Líneas clave**: ~60 líneas  
**Tiempo**: 2 horas  
**Impacto**: 40-60% image size ↓

```typescript
export function OptimizedImage({ src, alt, width, height, loading = 'lazy' }) {
  return (
    <picture>
      <source type="image/webp" srcSet={`${src.replace(/\.jpg/, '.webp')} 1x`} />
      <img src={src} alt={alt} loading={loading} decoding="async" />
    </picture>
  );
}
```

✅ **Checklist**:
- [ ] Crear OptimizedImage.tsx
- [ ] Setup vite-plugin-image-optimization
- [ ] Convertir imágenes a WebP
- [ ] Test load time

---

## 📊 RESUMEN TABULAR

| # | Cambio | Archivo | Tiempo | Impacto | Esfuerzo | Riesgo |
|---|--------|---------|--------|---------|----------|--------|
| 1 | Caché | CacheConfig.java | 2h | 40% ↓ | ⭐ | ⭐ |
| 2 | Paginación | ProductoController | 4h | 70% ↓ | ⭐⭐ | ⭐ |
| 3 | Índices | migration.sql | 1h | 50% ↓ | ⭐ | ⭐ |
| 4 | Rate Limit | RateLimitFilter | 2h | Protec | ⭐⭐ | ⭐ |
| 5 | Code Split | main.tsx | 3h | 70% ↓ | ⭐⭐ | ⭐ |
| 6 | Que Tuning | queryClient.ts | 2h | 40% ↓ | ⭐ | ⭐ |
| 7 | Service Worker | service-worker.ts | 4h | 80% ↓* | ⭐⭐ | ⭐⭐ |
| 8 | Img Opt | OptimizedImage | 2h | 60% ↓ | ⭐ | ⭐ |

**Total: 20h críticos, 60-80h con tests y validación**

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### Semana 1 (Críticos)
```
Lunes:      1. Caché (2h)
            2. Paginación start (2h)

Martes:     2. Paginación finish (2h)
            3. Índices (1h)

Miércoles:  5. Code Splitting (3h)
            6. React Query (2h)

Jueves:     4. Rate Limiting (2h)
            Backend tests (3h)

Viernes:    7. Service Worker (4h)
            Frontend tests (3h)
```

### Semana 2 (Complementarios)
```
Lunes-Martes:   8. Image Optimization (2h)
                Optimizaciones menores

Miércoles-Viernes: Tests, validación, documentación
```

---

## 🔧 COMANDOS ÚTILES

### Backend
```bash
# Compilar
cd backend && ./mvnw clean compile

# Tests
./mvnw test

# Verificar caché stats
curl http://localhost:8080/api/monitoring/cache/stats | jq

# Load test
ab -n 1000 -c 50 http://localhost:8080/api/inventario/productos?page=0&size=50
```

### Frontend
```bash
# Build
npm run build

# Verificar bundle
npm run build -- --report

# Lighthouse
npx lighthouse http://localhost:5173 --output-path=./lighthouse.html

# Service Worker test
curl -I http://localhost:5173 # Verificar headers cache
```

---

## ✅ CRITERIOS DE ÉXITO

### Backend ✅
- [ ] Cache hit rate > 80%
- [ ] Query time avg < 200ms
- [ ] Load test: 100+ usuarios sin error
- [ ] CPU < 50% con 100 usuarios

### Frontend ✅
- [ ] Lighthouse > 85
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] Bundle init < 300KB

### Combined ✅
- [ ] Usuarios simultáneos: 50 → 200+
- [ ] Respuesta API: 800ms → 200ms
- [ ] Carga página: 3.5s → 1.0s

---

## 📞 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| Cache no funciona | Verificar CacheConfig registrado, @Cacheable en métodos |
| Paginación rompe UI | Verificar API contracts, actualizar frontend requests |
| SW no funciona | Verificar HTTPS/localhost, limpiar caché, refresh hard |
| Bundle aún grande | Usar `npm run build -- --report` para identificar |
| Load test falla | Aumentar connection pool, verificar índices BD |

---

## 📚 REFERENCIAS RÁPIDAS

```
CacheConfig: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 1.1
Paginación: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 1.2
Índices: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 1.4
Code Splitting: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 2.1
React Query: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 2.3
Service Worker: GUIA-PRACTICA-IMPLEMENTACION.md / Paso 2.4

Análisis detallado: ANALISIS-RENDIMIENTO-COMPLETO.md
Monitoreo: MONITOREO-METRICAS-RENDIMIENTO.md
```

---

## 🎯 PRÓXIMO PASO

1. **Ahora**: Revisar este cheat sheet (5 min)
2. **Siguiente**: RESUMEN-EJECUTIVO.md (15 min)
3. **Luego**: GUIA-PRACTICA-IMPLEMENTACION.md (empieza Paso 1.1)

---

**Versión**: 1.0  
**Última actualización**: 9 de diciembre 2025

