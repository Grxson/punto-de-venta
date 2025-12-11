import {
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
  onINP,
  type Metric,
} from 'web-vitals';

/**
 * OPTIMIZACIÓN PASO 2.8: Web Vitals Monitoring
 * 
 * Monitorear Core Web Vitals:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - INP (Interaction to Next Paint): < 200ms (reemplaza FID)
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

interface WebVitalMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Almacenar métricas para enviar al backend
const metricsQueue: WebVitalMetrics[] = [];

/**
 * Clasificar métrica como good/needs-improvement/poor
 */
function getRating(name: string, value: number): WebVitalMetrics['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 600 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

/**
 * Enviar métricas al backend
 */
async function sendMetricsToBackend(metrics: WebVitalMetrics[]) {
  if (metrics.length === 0) return;

  try {
    // Intentar enviar métricas al backend
    const response = await fetch('/api/v1/metrics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        metrics,
      }),
      // No bloquear la aplicación si falla
      keepalive: true,
    });

    if (!response.ok) {
      console.warn('Error enviando web vitals:', response.status);
    }
  } catch (error) {
    console.warn('No se pudieron enviar web vitals:', error);
  }
}

/**
 * Procesar métrica
 */
function processMetric(metric: Metric) {
  const vitals: WebVitalMetrics = {
    name: metric.name,
    value: Math.round(metric.value),
    rating: getRating(metric.name, metric.value),
    delta: metric.delta ? Math.round(metric.delta) : 0,
    id: metric.id,
    navigationType: metric.navigationType || 'navigation',
  };

  metricsQueue.push(vitals);

  // Log en desarrollo
  if (import.meta.env.DEV) {
    console.log(`${metric.name}:`, {
      value: vitals.value,
      rating: vitals.rating,
      delta: vitals.delta,
    });
  }

  // Enviar cuando completemos todas las métricas
  if (metricsQueue.length >= 5) {
    sendMetricsToBackend([...metricsQueue]);
    metricsQueue.length = 0;
  }
}

/**
 * Hook para inicializar monitoreo de Web Vitals
 */
export function useWebVitals() {
  // Usar useEffect para inicializar
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    // Registrar callbacks para cada métrica
    onCLS(processMetric);
    onINP(processMetric);
    onFCP(processMetric);
    onLCP(processMetric);
    onTTFB(processMetric);

    console.log('Web Vitals monitoring inicializado');
  }
}

/**
 * Utilidad para registrar métricas personalizadas
 */
export function reportWebVital(name: string, value: number) {
  const metric = {
    name,
    value: Math.round(value),
    rating: getRating(name, value),
    delta: 0,
    id: `${name}-${Date.now()}`,
    navigationType: 'custom',
  };

  metricsQueue.push(metric);

  if (import.meta.env.DEV) {
    console.log(`Custom metric ${name}:`, {
      value: metric.value,
      rating: metric.rating,
    });
  }
}

/**
 * Forzar envío de métricas pendientes
 * Útil llamar al descargar la página
 */
export function flushMetrics() {
  if (metricsQueue.length > 0) {
    sendMetricsToBackend([...metricsQueue]);
    metricsQueue.length = 0;
  }
}
