# 📊 MONITOREO Y MÉTRICAS - Plan de Implementación

## 🎯 Objetivo
Medir el impacto real de cada optimización implementada

---

## 📍 BACKEND - Monitoreo

### 1. Métricas de Cache

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/controller/MonitoringController.java`

```java
package com.puntodeventa.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.CacheStats;

import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint para monitorear estadísticas de caché
 */
@RestController
@RequestMapping("/api/monitoring/cache")
@RequiredArgsConstructor
@Tag(name = "Monitoreo", description = "Métricas del sistema")
public class CacheMonitoringController {
    
    private final CacheManager cacheManager;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasCache() {
        Map<String, Object> stats = new HashMap<>();
        
        if (cacheManager instanceof CaffeineCacheManager caffeineManager) {
            Map<String, Map<String, Object>> cacheStats = new HashMap<>();
            
            for (String cacheName : caffeineManager.getCacheNames()) {
                Cache<Object, Object> cache = caffeineManager.getCache(cacheName)
                    .getNativeCache();
                
                CacheStats cacheStats_ = ((com.github.benmanes.caffeine.cache.Cache<Object, Object>) cache)
                    .stats();
                
                Map<String, Object> stats_ = new HashMap<>();
                stats_.put("hitCount", cacheStats_.hitCount());
                stats_.put("missCount", cacheStats_.missCount());
                stats_.put("hitRate", cacheStats_.hitRate());
                stats_.put("evictionCount", cacheStats_.evictionCount());
                stats_.put("loadCount", cacheStats_.loadCount());
                stats_.put("averageLoadPenalty", cacheStats_.averageLoadPenalty());
                
                cacheStats.put(cacheName, stats_);
            }
            
            stats.put("caches", cacheStats);
        }
        
        return ResponseEntity.ok(stats);
    }
}
```

**Uso:**
```bash
curl http://localhost:8080/api/monitoring/cache/stats | jq

# Esperado:
{
  "caches": {
    "categorias-productos": {
      "hitCount": 450,
      "missCount": 5,
      "hitRate": 0.989,  # 98.9% hits
      "evictionCount": 0,
      "loadCount": 5,
      "averageLoadPenalty": 12.5
    }
  }
}
```

---

### 2. Métricas de Queries

**Agregar a application-dev.properties:**
```properties
# Habilitar estadísticas de Hibernate
spring.jpa.properties.hibernate.generate_statistics=true
spring.jpa.properties.hibernate.use_sql_comments=true

# Logging de estadísticas
logging.level.org.hibernate.stat=DEBUG
```

**Crear endpoint para logs:**
```java
@GetMapping("/queries")
public ResponseEntity<Map<String, Object>> obtenerEstadisticasQueries() {
    SessionFactory sessionFactory = hibernateEmf.getSessionFactory();
    Statistics stats = sessionFactory.getStatistics();
    
    Map<String, Object> queryStats = new HashMap<>();
    queryStats.put("totalQueries", stats.getQueryExecutionCount());
    queryStats.put("successfulQueries", stats.getSuccessfulTransactionCount());
    queryStats.put("avgQueryTime", stats.getQueryExecutionAvgTime());
    queryStats.put("maxQueryTime", stats.getQueryExecutionMaxTime());
    
    // Por entity
    Map<String, Long> entityStats = new HashMap<>();
    for (String entity : stats.getEntityNames()) {
        entityStats.put(entity, stats.getEntityFetchCount(entity));
    }
    queryStats.put("entityFetches", entityStats);
    
    return ResponseEntity.ok(queryStats);
}
```

---

### 3. Dashboard HTML

**Archivo**: `backend/src/main/resources/static/monitoring-cache.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoreo de Cache - Punto de Venta</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-card h3 {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .metric-value {
            font-size: 28px;
            font-weight: bold;
            color: #2196F3;
        }
        
        .metric-label {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            height: 300px;
        }
        
        .refresh-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .refresh-btn:hover {
            background: #45a049;
        }
        
        .auto-refresh-label {
            margin-left: 20px;
            font-size: 14px;
        }
        
        .controls {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status.ok {
            background: #4CAF50;
            color: white;
        }
        
        .status.warning {
            background: #FF9800;
            color: white;
        }
        
        .status.critical {
            background: #F44336;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Monitoreo de Cache - Punto de Venta</h1>
        
        <div class="controls">
            <button class="refresh-btn" onclick="refreshData()">🔄 Actualizar Ahora</button>
            <label class="auto-refresh-label">
                <input type="checkbox" id="autoRefresh" checked> Auto-actualizar cada 5s
            </label>
        </div>
        
        <div class="metrics-grid" id="metricsContainer">
            <!-- Será llenado por JavaScript -->
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <canvas id="hitRateChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="cacheVolumeChart"></canvas>
            </div>
        </div>
    </div>
    
    <script>
        let hitRateChart, cacheVolumeChart;
        let hitRateData = [];
        let timestamps = [];
        
        async function fetchCacheStats() {
            try {
                const response = await fetch('/api/monitoring/cache/stats');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching cache stats:', error);
                return null;
            }
        }
        
        function calculateStatus(hitRate) {
            if (hitRate > 0.90) return 'ok';
            if (hitRate > 0.70) return 'warning';
            return 'critical';
        }
        
        async function refreshData() {
            const stats = await fetchCacheStats();
            if (!stats) return;
            
            // Actualizar métricas
            const metricsHtml = Object.entries(stats.caches || {})
                .map(([name, cacheStats]) => `
                    <div class="metric-card">
                        <h3>${name}</h3>
                        <div style="margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Hit Rate</span>
                                <span class="status ${calculateStatus(cacheStats.hitRate)}">
                                    ${(cacheStats.hitRate * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div style="font-size: 12px; color: #999; line-height: 1.6;">
                            <div>Hits: ${cacheStats.hitCount.toLocaleString()}</div>
                            <div>Misses: ${cacheStats.missCount.toLocaleString()}</div>
                            <div>Evictions: ${cacheStats.evictionCount.toLocaleString()}</div>
                            <div>Avg Load: ${cacheStats.averageLoadPenalty?.toFixed(2) || '0'}ms</div>
                        </div>
                    </div>
                `)
                .join('');
            
            document.getElementById('metricsContainer').innerHTML = metricsHtml;
            
            // Actualizar gráficos
            const hitRates = Object.values(stats.caches || {})
                .map(c => (c.hitRate * 100).toFixed(1));
            
            updateCharts(stats.caches);
        }
        
        function updateCharts(caches) {
            const names = Object.keys(caches || {});
            const hitRates = Object.values(caches || {}).map(c => (c.hitRate * 100).toFixed(1));
            
            // Hit Rate Chart
            if (!hitRateChart) {
                const ctx = document.getElementById('hitRateChart').getContext('2d');
                hitRateChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: names,
                        datasets: [{
                            label: 'Hit Rate %',
                            data: hitRates,
                            backgroundColor: hitRates.map(r => r > 90 ? '#4CAF50' : r > 70 ? '#FF9800' : '#F44336'),
                            borderRadius: 4,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'x',
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true, max: 100 }
                        }
                    }
                });
            } else {
                hitRateChart.data.labels = names;
                hitRateChart.data.datasets[0].data = hitRates;
                hitRateChart.update();
            }
        }
        
        // Auto-refresh
        setInterval(() => {
            if (document.getElementById('autoRefresh').checked) {
                refreshData();
            }
        }, 5000);
        
        // Initial load
        refreshData();
    </script>
</body>
</html>
```

**Acceder en**: `http://localhost:8080/monitoring-cache`

---

## 📍 FRONTEND - Monitoreo

### 1. Web Vitals Tracking

**Archivo**: `frontend-web/src/utils/vitals.ts`

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Colectar Web Vitals y enviarlos a analytics
 */
export function trackWebVitals() {
  // Cumulative Layout Shift
  getCLS((metric: any) => {
    console.log(`📊 CLS: ${metric.value.toFixed(3)}`, getVitalStatus(metric.value, [0.1, 0.25]));
    sendToAnalytics('CLS', metric.value);
  });

  // First Input Delay
  getFID((metric: any) => {
    console.log(`📊 FID: ${metric.value.toFixed(1)}ms`, getVitalStatus(metric.value, [100, 300]));
    sendToAnalytics('FID', metric.value);
  });

  // First Contentful Paint
  getFCP((metric: any) => {
    console.log(`📊 FCP: ${metric.value.toFixed(1)}ms`, getVitalStatus(metric.value, [1800, 3000]));
    sendToAnalytics('FCP', metric.value);
  });

  // Largest Contentful Paint
  getLCP((metric: any) => {
    console.log(`📊 LCP: ${metric.value.toFixed(1)}ms`, getVitalStatus(metric.value, [2500, 4000]));
    sendToAnalytics('LCP', metric.value);
  });

  // Time to First Byte
  getTTFB((metric: any) => {
    console.log(`📊 TTFB: ${metric.value.toFixed(1)}ms`, getVitalStatus(metric.value, [600, 1200]));
    sendToAnalytics('TTFB', metric.value);
  });
}

function getVitalStatus(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return '✅ BUENO';
  if (value <= thresholds[1]) return '⚠️ NECESITA MEJORA';
  return '❌ MALO';
}

/**
 * Enviar métrica a backend/analytics
 */
function sendToAnalytics(name: string, value: number) {
  if (navigator.sendBeacon) {
    const body = new FormData();
    body.append('name', name);
    body.append('value', String(value));
    body.append('timestamp', new Date().toISOString());
    
    navigator.sendBeacon('/api/monitoring/vitals', body);
  }
}
```

**Usar en main.tsx:**
```typescript
import { trackWebVitals } from './utils/vitals';

if (import.meta.env.PROD) {
  trackWebVitals();
}
```

---

### 2. Performance Timeline

**Archivo**: `frontend-web/src/utils/performance.ts`

```typescript
/**
 * Medir rendimiento de operaciones clave
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  /**
   * Iniciar medición
   */
  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  /**
   * Finalizar medición y reportar
   */
  static end(label: string, threshold = 1000) {
    const start = this.marks.get(label);
    if (!start) {
      console.warn(`⚠️ No start mark for ${label}`);
      return;
    }

    const duration = performance.now() - start;
    const status = duration < threshold ? '✅' : '⚠️';

    console.log(`⏱️ ${status} ${label}: ${duration.toFixed(2)}ms`);

    if (duration > threshold) {
      sendToAnalytics(label, duration);
    }

    this.marks.delete(label);
    return duration;
  }

  /**
   * Medir una función async
   */
  static async measure<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// Uso
import { PerformanceMonitor as PM } from './utils/performance';

// En componentes
export function useFetchProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: () =>
      PM.measure('fetch-productos', () =>
        fetch('/api/inventario/productos').then(r => r.json())
      ),
  });
}
```

---

### 3. Dashboard Frontend

**Archivo**: `frontend-web/src/pages/MonitoringPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MonitoringPage() {
  const [metrics, setMetrics] = useState<any>([]);
  const [bundleInfo, setBundleInfo] = useState<any>(null);

  useEffect(() => {
    // Cargar Web Vitals del localStorage
    const vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
    setMetrics(vitals);

    // Cargar info del bundle
    if (window.__VITE_MANIFEST__) {
      setBundleInfo(window.__VITE_MANIFEST__);
    }
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">📊 Monitoreo de Rendimiento</h1>

      {/* Web Vitals */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Web Vitals</h2>
        <div className="grid grid-cols-5 gap-4">
          {metrics.map((metric: any) => (
            <div key={metric.name} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-bold text-gray-600">{metric.name}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {metric.value.toFixed(metric.name === 'CLS' ? 3 : 1)}
                {metric.name === 'CLS' ? '' : 'ms'}
              </p>
              <p className={`text-xs mt-2 ${
                metric.rating === 'good' ? 'text-green-600' :
                metric.rating === 'needs-improvement' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {metric.rating}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bundle Info */}
      {bundleInfo && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Bundle Size</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">
              Total bundle: ~{(Object.values(bundleInfo).reduce((sum: any, f: any) => sum + (f.file?.length || 0), 0) / 1024).toFixed(2)} KB
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## 📈 TABLERO DE CONTROL (Google Sheets Template)

Copiar este Google Sheet para tracking semanal:

```
SEMANA 1
┌─────────────────┬───────┬──────────┬────────────┐
│ Métrica         │ Antes │ Después  │ % Mejora   │
├─────────────────┼───────┼──────────┼────────────┤
│ Cache Hit Rate  │ 40%   │ 89%      │ +122% ✅   │
│ Query Time      │ 850ms │ 220ms    │ -74% ✅    │
│ Bundle Size     │ 850KB │ 300KB    │ -65% ✅    │
│ FCP             │ 3.5s  │ 1.2s     │ -66% ✅    │
│ Usuarios Sim    │ 40    │ 180      │ +350% ✅   │
└─────────────────┴───────┴──────────┴────────────┘
```

---

## 🔍 CHECKLIST DE MONITOREO

**Antes de Implementar:**
- [ ] Capturar baseline de todas las métricas
- [ ] Documentar valores actuales
- [ ] Setup de herramientas de monitoreo

**Durante Implementación:**
- [ ] Medir después de cada cambio
- [ ] Documentar resultados
- [ ] Ajustar si es necesario

**Después de Deploy:**
- [ ] Monitoreo continuo en producción
- [ ] Alertas para regresiones
- [ ] Reviews semanales

---

