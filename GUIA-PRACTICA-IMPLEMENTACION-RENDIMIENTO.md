# 🛠️ GUÍA PRÁCTICA DE IMPLEMENTACIÓN - OPTIMIZACIONES DE RENDIMIENTO

## 📍 Fase 1: BACKEND (SEMANA 1)

### Paso 1.1: Mejorar CacheConfig.java

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/config/CacheConfig.java`

```java
package com.puntodeventa.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuración optimizada de caché Caffeine
 * Diferencia entre datos estáticos, semi-estáticos y dinámicos
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * CacheManager con configuración por tipo de dato
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        
        // Catálogos ESTÁTICOS (30 min, 5000 entries)
        manager.registerCustomCache("categorias-productos", 
            buildCache(30, TimeUnit.MINUTES, 5000));
        
        manager.registerCustomCache("categorias-gastos",
            buildCache(30, TimeUnit.MINUTES, 5000));
        
        manager.registerCustomCache("metodos-pago",
            buildCache(30, TimeUnit.MINUTES, 3000));
        
        manager.registerCustomCache("roles",
            buildCache(30, TimeUnit.MINUTES, 1000));
        
        manager.registerCustomCache("permisos",
            buildCache(30, TimeUnit.MINUTES, 2000));
        
        manager.registerCustomCache("sucursales",
            buildCache(30, TimeUnit.MINUTES, 500));
        
        manager.registerCustomCache("unidades",
            buildCache(30, TimeUnit.MINUTES, 500));
        
        // Datos SEMI-ESTÁTICOS (15 min, 10000 entries)
        manager.registerCustomCache("productos",
            buildCache(15, TimeUnit.MINUTES, 10000));
        
        manager.registerCustomCache("proveedores",
            buildCache(15, TimeUnit.MINUTES, 5000));
        
        manager.registerCustomCache("ingredientes",
            buildCache(15, TimeUnit.MINUTES, 8000));
        
        manager.registerCustomCache("recetas",
            buildCache(15, TimeUnit.MINUTES, 5000));
        
        manager.registerCustomCache("subcategorias",
            buildCache(15, TimeUnit.MINUTES, 5000));
        
        // Datos DINÁMICOS (3-5 min, 2000 entries)
        manager.registerCustomCache("inventario",
            buildCache(5, TimeUnit.MINUTES, 2000));
        
        manager.registerCustomCache("turnos-activos",
            buildCache(3, TimeUnit.MINUTES, 1000));
        
        manager.registerCustomCache("cajas-activas",
            buildCache(3, TimeUnit.MINUTES, 500));
        
        // Menú por popularidad (2 min, muy dinámico)
        manager.registerCustomCache("menuPopularidad",
            buildCache(2, TimeUnit.MINUTES, 2000));
        
        // Estadísticas de ventas (1 min, muy dinámico)
        manager.registerCustomCache("estadisticas-ventas",
            buildCache(1, TimeUnit.MINUTES, 1000));
        
        return manager;
    }

    /**
     * Constructor para caché con tiempo de expiración personalizado
     */
    private com.github.benmanes.caffeine.cache.Cache<Object, Object> buildCache(
            long duration, 
            TimeUnit unit, 
            int maxSize) {
        return Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(duration, unit)
                .recordStats()
                .build();
    }
}
```

**Cambios clave:**
- ✅ Aumentó maxSize de 1000 a 5000-10000
- ✅ Diferentes tiempos de expiración (1 min a 30 min)
- ✅ Cachés especializados por tipo de dato
- ✅ recordStats() para monitoreo

---

### Paso 1.2: Agregar Paginación a ProductoController

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/controller/ProductoController.java`

```java
package com.puntodeventa.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.service.ProductoService;

import java.util.Optional;

@RestController
@RequestMapping("/api/inventario/productos")
@Tag(name = "Inventario - Productos", description = "Endpoints para gestión de productos del menú")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(summary = "Listar productos con paginación")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<Page<ProductoDTO>> listar(
            @Parameter(description = "Página (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Cantidad por página (máx 200)", example = "50")
            @RequestParam(defaultValue = "50") int size,
            
            @RequestParam Optional<Boolean> activo,
            @RequestParam(name = "enMenu") Optional<Boolean> enMenu,
            @RequestParam Optional<Long> categoriaId,
            @RequestParam(name = "q") Optional<String> query,
            
            @Parameter(description = "Campo para ordenar", example = "nombre")
            @RequestParam(defaultValue = "nombre") String sortBy) {
        
        // Validar y limitar tamaño
        size = Math.min(Math.max(size, 1), 200);
        
        Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by(sortBy).ascending()
        );
        
        return ResponseEntity.ok(
            productoService.listar(activo, enMenu, categoriaId, query, pageable)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }

    @GetMapping("/{id}/variantes")
    @Operation(summary = "Obtener variantes de un producto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<Page<ProductoDTO>> obtenerVariantes(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        size = Math.min(Math.max(size, 1), 200);
        Pageable pageable = PageRequest.of(page, size);
        
        return ResponseEntity.ok(
            productoService.obtenerVariantes(id, pageable)
        );
    }

    @PostMapping
    @Operation(summary = "Crear producto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<ProductoDTO> crear(@RequestBody ProductoDTO dto) {
        return ResponseEntity.status(201).body(productoService.crear(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<ProductoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ProductoDTO dto) {
        return ResponseEntity.ok(productoService.actualizar(id, dto));
    }
}
```

---

### Paso 1.3: Actualizar ProductoService

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/service/ProductoService.java`

```java
package com.puntodeventa.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.ProductoRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    /**
     * Listar productos con paginación y filtros
     */
    public Page<ProductoDTO> listar(
            Optional<Boolean> activo,
            Optional<Boolean> enMenu,
            Optional<Long> categoriaId,
            Optional<String> query,
            Pageable pageable) {
        
        Specification<Producto> spec = Specification.where(null);
        
        // Filtro: activo
        if (activo.isPresent()) {
            spec = spec.and((root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("activo"), activo.get())
            );
        }
        
        // Filtro: en menú
        if (enMenu.isPresent()) {
            spec = spec.and((root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("enMenu"), enMenu.get())
            );
        }
        
        // Filtro: categoría
        if (categoriaId.isPresent()) {
            spec = spec.and((root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("categoriaId"), categoriaId.get())
            );
        }
        
        // Búsqueda: nombre (ILIKE para case-insensitive)
        if (query.isPresent()) {
            String q = "%" + query.get() + "%";
            spec = spec.and((root, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("nombre")),
                    q.toLowerCase()
                )
            );
        }
        
        return productoRepository.findAll(spec, pageable)
            .map(productoMapper::toDTO);
    }

    public ProductoDTO obtener(Long id) {
        return productoRepository.findById(id)
            .map(productoMapper::toDTO)
            .orElseThrow(() -> 
                new ResourceNotFoundException("Producto no encontrado: " + id)
            );
    }

    public Page<ProductoDTO> obtenerVariantes(Long productoId, Pageable pageable) {
        return productoRepository.findByProductoPadreId(productoId, pageable)
            .map(productoMapper::toDTO);
    }

    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = productoMapper.toEntity(dto);
        return productoMapper.toDTO(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Producto no encontrado: " + id)
            );
        
        productoMapper.updateEntity(dto, producto);
        return productoMapper.toDTO(productoRepository.save(producto));
    }
}
```

---

### Paso 1.4: Agregar Índices a Base de Datos

**Archivo**: `backend/src/main/resources/migration-indices.sql`

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_producto_nombre 
  ON producto(LOWER(nombre));

CREATE INDEX IF NOT EXISTS idx_producto_categoria_id 
  ON producto(categoria_id);

CREATE INDEX IF NOT EXISTS idx_producto_activo 
  ON producto(activo);

CREATE INDEX IF NOT EXISTS idx_producto_en_menu 
  ON producto(en_menu);

-- Índices para menú por popularidad (queries analytics)
CREATE INDEX IF NOT EXISTS idx_venta_item_producto_fecha 
  ON venta_item(producto_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_venta_item_sucursal_fecha 
  ON venta_item(sucursal_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_venta_fecha_sucursal 
  ON venta(fecha, sucursal_id);

CREATE INDEX IF NOT EXISTS idx_gasto_fecha_sucursal 
  ON gasto(fecha, sucursal_id);

-- Índices para filtros
CREATE INDEX IF NOT EXISTS idx_categoria_activo 
  ON categoria_producto(activo);

CREATE INDEX IF NOT EXISTS idx_ingrediente_activo 
  ON ingrediente(activo);

CREATE INDEX IF NOT EXISTS idx_proveedor_activo 
  ON proveedor(activo);

-- Índices para subcategorías
CREATE INDEX IF NOT EXISTS idx_subcategoria_categoria_id 
  ON subcategoria(categoria_id);

CREATE INDEX IF NOT EXISTS idx_subcategoria_activo 
  ON subcategoria(activo);

-- Índices compuestos para queries complejas
CREATE INDEX IF NOT EXISTS idx_venta_sucursal_rango 
  ON venta(sucursal_id, created_at DESC) 
  WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_producto_categoria_activo 
  ON producto(categoria_id, activo);

-- Índice para búsquedas full-text (PostgreSQL)
-- CREATE INDEX idx_producto_nombre_fulltext 
--   ON producto USING GIN (to_tsvector('spanish', nombre));
```

**Cómo ejecutar:**
```bash
# Si usas Flyway (recomendado)
# Renombrar a: backend/src/main/resources/db/migration/V1_X__add_performance_indexes.sql

# Si ejecutas manual
# 1. Iniciar backend
# 2. Ir a http://localhost:8080/h2-console (desarrollo)
# 3. Copiar y ejecutar las queries

# En PostgreSQL (producción)
# psql -U postgres -d puntodeventa < migration-indices.sql
```

---

### Paso 1.5: Implementar Rate Limiting

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/filter/RateLimitFilter.java`

```java
package com.puntodeventa.backend.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filtro de Rate Limiting para proteger API
 * Límite: 100 requests/min por usuario, 1000/min global
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> bucketMap = new ConcurrentHashMap<>();
    
    // Límite global: 1000 requests/minuto
    private final Bucket globalBucket = Bucket4j.builder()
        .addLimit(Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofMinutes(1))))
        .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        
        // Obtener identificador del usuario (IP si no autenticado)
        String userId = getClientIdentifier(request);
        
        // Verificar límite global
        if (!globalBucket.tryConsume(1)) {
            log.warn("🚫 Rate limit global alcanzado");
            response.setStatus(429);
            response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
            return;
        }
        
        // Verificar límite por usuario (100/min)
        Bucket userBucket = bucketMap.computeIfAbsent(userId, k ->
            Bucket4j.builder()
                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
                .build()
        );
        
        if (!userBucket.tryConsume(1)) {
            log.warn("🚫 Rate limit por usuario alcanzado: {}", userId);
            response.setStatus(429);
            response.addHeader("X-RateLimit-Remaining", "0");
            response.getWriter().write("{\"error\":\"User rate limit exceeded\"}");
            return;
        }
        
        // Headers informativos
        response.addHeader("X-RateLimit-Remaining", String.valueOf(userBucket.estimateAbilityToConsume(1).getRoundedSecondsToWait()));
        response.addHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + 60000));
        
        filterChain.doFilter(request, response);
    }

    /**
     * Obtener identificador del cliente
     */
    private String getClientIdentifier(HttpServletRequest request) {
        // Intentar obtener del JWT
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7); // Usar token como ID
        }
        
        // Fallback a IP
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // No aplicar rate limit a health checks
        String path = request.getRequestURI();
        return path.startsWith("/actuator/health") || 
               path.startsWith("/swagger-ui") ||
               path.startsWith("/api-docs");
    }
}
```

**Agregar dependencia en pom.xml:**
```xml
<!-- Rate Limiting -->
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>
```

**Registrar filtro (puede ir en WebSecurityConfig.java):**
```java
@Configuration
public class WebSecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.addFilterBefore(rateLimitFilter(), UsernamePasswordAuthenticationFilter.class);
        // ... resto de configuración
    }
    
    @Bean
    public RateLimitFilter rateLimitFilter() {
        return new RateLimitFilter();
    }
}
```

---

## 📍 Fase 1: FRONTEND (SEMANA 1)

### Paso 2.1: Code Splitting por Ruta

**Archivo**: `frontend-web/src/main.tsx`

```typescript
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import './index.css';

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Lazy load de pages principales
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function MainApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventario/*" element={<InventoryPage />} />
          <Route path="/ventas/*" element={<SalesPage />} />
          <Route path="/reportes/*" element={<ReportsPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          
          {/* Redirigir raíz a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<div className="p-4">Página no encontrada</div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
```

---

### Paso 2.2: Actualizar vite.config.ts

**Archivo**: `frontend-web/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    // 🔑 CODE SPLITTING OPTIMIZADO
    rollupOptions: {
      output: {
        // Chunk size warning
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]';
          } else if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // Manual chunks: Agrupar código por funcionalidad
        manualChunks: {
          // React core (SIEMPRE se carga, ~250KB)
          'react-core': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          
          // Material UI (reutilización alta, ~300KB)
          'ui-framework': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          
          // Data fetching (usado globalmente, ~100KB)
          'data-layer': [
            '@tanstack/react-query',
            'axios',
          ],
          
          // Estado global (Zustand)
          'state-management': [
            'zustand',
          ],
          
          // Charts & Reportes (usado solo en reportes, ~150KB)
          'visualization': [
            'recharts',
            'chart.js',
          ],
          
          // Utilities (usado ocasionalmente, ~50KB)
          'utils': [
            'date-fns',
            'lodash',
          ],
          
          // Admin specific (lazy loaded, ~200KB)
          'admin-features': [
            'react-beautiful-dnd',
          ],
        },
      },
    },
    
    // Configuración de compresión
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.logs en prod
      },
    },
  },
  
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },
  
  server: {
    port: 5173,
    host: true,
  },
});
```

---

### Paso 2.3: Optimizar React Query Config

**Archivo**: `frontend-web/src/config/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración estratificada de React Query
 * Diferentes staleTime según tipo de dato
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto CONSERVADORA
      staleTime: 30 * 1000, // 30 seg - datos muy dinámicos por defecto
      gcTime: 5 * 60 * 1000, // 5 min en memoria
      
      // Reintentos solo para errores recuperables
      retry: (failureCount, error) => {
        // Red errors: reintentar hasta 2 veces
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          return failureCount < 2;
        }
        
        // Auth errors (401): no reintentar
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        
        // Server errors (5xx): reintentar 1 vez
        return failureCount < 1;
      },
      
      // Comportamiento del caché
      refetchOnWindowFocus: 'stale', // Solo si está stale
      refetchOnReconnect: 'stale',
      refetchOnMount: 'stale',
    },
    
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Keys organizadas por tipo de dato
 */
export const queryKeys = {
  // ===== ESTÁTICOS (30 minutos, cambian rara vez) =====
  categorias: {
    all: ['categorias'] as const,
    list: (filtros?: Record<string, any>) => 
      [...queryKeys.categorias.all, 'list', filtros] as const,
    detail: (id: number) => 
      [...queryKeys.categorias.all, 'detail', id] as const,
  },
  
  // ===== SEMI-ESTÁTICOS (15 minutos, actualizaciones ocasionales) =====
  productos: {
    all: ['productos'] as const,
    list: (filtros?: Record<string, any>) => 
      [...queryKeys.productos.all, 'list', filtros] as const,
    detail: (id: number) => 
      [...queryKeys.productos.all, 'detail', id] as const,
    variantes: (id: number) => 
      [...queryKeys.productos.all, 'variantes', id] as const,
  },
  
  ingredientes: {
    all: ['ingredientes'] as const,
    list: () => [...queryKeys.ingredientes.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.ingredientes.all, 'detail', id] as const,
  },
  
  proveedores: {
    all: ['proveedores'] as const,
    list: () => [...queryKeys.proveedores.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.proveedores.all, 'detail', id] as const,
  },
  
  // ===== DINÁMICOS (2-5 minutos, cambios frecuentes) =====
  ventas: {
    all: ['ventas'] as const,
    list: (filtros?: Record<string, any>) => 
      [...queryKeys.ventas.all, 'list', filtros] as const,
    detail: (id: number) => 
      [...queryKeys.ventas.all, 'detail', id] as const,
  },
  
  gastos: {
    all: ['gastos'] as const,
    list: (filtros?: Record<string, any>) => 
      [...queryKeys.gastos.all, 'list', filtros] as const,
    detail: (id: number) => 
      [...queryKeys.gastos.all, 'detail', id] as const,
  },
  
  // ===== MUY DINÁMICOS (30-60 segundos, tiempo real) =====
  cajaActiva: {
    all: ['caja'] as const,
    current: () => [...queryKeys.cajaActiva.all, 'current'] as const,
    detalles: () => [...queryKeys.cajaActiva.all, 'detalles'] as const,
  },
  
  turnoActivo: {
    all: ['turno'] as const,
    current: () => [...queryKeys.turnoActivo.all, 'current'] as const,
  },
  
  menu: {
    all: ['menu'] as const,
    popularidad: (params?: Record<string, any>) => 
      [...queryKeys.menu.all, 'popularidad', params] as const,
  },
};

export default queryClient;
```

**Ahora crear hooks específicos con staleTime correcto:**

**Archivo**: `frontend-web/src/hooks/useQueryHooks.ts`

```typescript
import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import { apiService } from '../services/api.service';

// ===== ESTÁTICOS (30 min) =====

export function useCategorias(filtros?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.categorias.list(filtros),
    queryFn: () => apiService.get('/api/inventario/categorias-productos', filtros),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000,    // 1 hora en memoria
  } as UseQueryOptions);
}

// ===== SEMI-ESTÁTICOS (15 min) =====

export function useProductos(filtros?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.productos.list(filtros),
    queryFn: () => apiService.get('/api/inventario/productos', filtros),
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,    // 30 minutos en memoria
  } as UseQueryOptions);
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: queryKeys.productos.detail(id),
    queryFn: () => apiService.get(`/api/inventario/productos/${id}`),
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000,
  } as UseQueryOptions);
}

// ===== DINÁMICOS (5 min con refetch automático) =====

export function useVentas(filtros?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.ventas.list(filtros),
    queryFn: () => apiService.get('/api/ventas', filtros),
    staleTime: 5 * 60 * 1000,  // 5 minutos
    gcTime: 15 * 60 * 1000,    // 15 minutos en memoria
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 min
  } as UseQueryOptions);
}

// ===== MUY DINÁMICOS (30 seg con refetch cada 1 min) =====

export function useCajaActiva() {
  return useQuery({
    queryKey: queryKeys.cajaActiva.current(),
    queryFn: () => apiService.get('/api/caja/actual'),
    staleTime: 30 * 1000,       // 30 segundos
    gcTime: 2 * 60 * 1000,      // 2 minutos en memoria
    refetchInterval: 1 * 60 * 1000, // Refetch cada 1 minuto
  } as UseQueryOptions);
}

export function useMenuPopularidad(columnas = 3, dias = 7) {
  return useQuery({
    queryKey: queryKeys.menu.popularidad({ columnas, dias }),
    queryFn: () => apiService.get('/api/v1/menu', { columnas, dias }),
    staleTime: 2 * 60 * 1000,   // 2 minutos (dinámico)
    gcTime: 10 * 60 * 1000,     // 10 minutos en memoria
    refetchInterval: 3 * 60 * 1000, // Refetch cada 3 min
  } as UseQueryOptions);
}
```

---

### Paso 2.4: Implementar Service Worker

**Archivo**: `frontend-web/src/service-worker.ts`

```typescript
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'pdv-app-v1';
const API_CACHE = 'pdv-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Instalar SW y cachear assets estáticos
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Limpiar cachés antiguos
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network First para API, Cache First para assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla, intentar desde caché
          return caches.match(request) ||
            new Response(
              JSON.stringify({ error: 'Offline - cached data not available' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
        })
    );
  }
  
  // Assets (JS, CSS, imágenes): Cache First
  else if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
  }
  
  // Otros requests: Network First
  else {
    event.respondWith(
      fetch(request).catch(() => caches.match(request) ||
        new Response('Offline', { status: 503 })
      )
    );
  }
});

export {};
```

**Registrar en main.tsx:**
```typescript
// Al final de main.tsx
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('✅ Service Worker registrado');
        
        // Verificar actualizaciones cada 6 horas
        setInterval(() => {
          reg.update();
        }, 6 * 60 * 60 * 1000);
      })
      .catch((err) => console.error('❌ SW error:', err));
  });
}
```

---

### Paso 2.5: Crear Componente OptimizedImage

**Archivo**: `frontend-web/src/components/OptimizedImage.tsx`

```typescript
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  className?: string;
}

/**
 * Componente de imagen optimizado con:
 * - Lazy loading
 * - Srcset para diferentes DPI
 * - WebP con fallback
 * - Loading skeleton
 */
export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  loading = 'lazy',
  className = '',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generar variantes de imagen
  const baseName = src.replace(/\.(jpg|png)$/i, '');
  const extension = src.match(/\.(jpg|png)$/i)?.[1] || 'jpg';
  
  const srcSet1x = src;
  const srcSet2x = `${baseName}@2x.${extension}`;
  const webpSrc = `${baseName}.webp`;
  const webpSrcSet2x = `${baseName}@2x.webp`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{
        aspectRatio: `${width}/${height}`,
      }}
    >
      {/* Skeleton loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      )}

      {/* Imagen con WebP y fallback */}
      {!error ? (
        <picture>
          <source
            type="image/webp"
            srcSet={`${webpSrc} 1x, ${webpSrcSet2x} 2x`}
          />
          <source
            type={`image/${extension}`}
            srcSet={`${srcSet1x} 1x, ${srcSet2x} 2x`}
          />
          <img
            src={srcSet1x}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </picture>
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
          <span>❌ Error cargando imagen</span>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ CHECKLIST DE COMPLETACIÓN

### Backend (Fase 1)
- [ ] CacheConfig.java actualizado con pools diferenciados
- [ ] ProductoController y Service con paginación
- [ ] Índices BD creados y validados
- [ ] RateLimitFilter implementado
- [ ] Tests unitarios para paginación
- [ ] Verificar con load test (50 usuarios simultáneos)

### Frontend (Fase 1)
- [ ] main.tsx con lazy loading
- [ ] vite.config.ts con code splitting
- [ ] queryClient.ts con staleTime estratificado
- [ ] useQueryHooks.ts con hooks personalizados
- [ ] Service Worker implementado
- [ ] OptimizedImage component
- [ ] Lighthouse score > 85

---

## 🧪 TESTING RÁPIDO

**Backend:**
```bash
# Verificar que caché está funcionando
curl http://localhost:8080/api/inventario/productos?page=0&size=50

# Ver logs de cache hits
docker logs backend | grep "cache"

# Load test simple
ab -n 1000 -c 50 http://localhost:8080/api/inventario/productos
```

**Frontend:**
```bash
# Build de prueba
npm run build

# Ver tamaño de chunks
npm run build -- --report

# Lighthouse
npx lighthouse http://localhost:5173
```

---

