import {
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
  onINP,
  type Metric,
} from 'web-vitals';

/**
 * OPTIMIZACIÓN PASO 2.8: Monitoreo de Core Web Vitals
 *
 * Umbrales de referencia de las métricas de rendimiento que se siguen:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - INP (Interaction to Next Paint): < 200ms (reemplaza a FID)
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

interface WebVitalMetrics {
  /** Nombre de la métrica (LCP, INP, CLS, FCP, TTFB). */
  name: string;
  /** Valor medido, ya redondeado a entero. */
  value: number;
  /** Veredicto frente a los umbrales de Google. */
  rating: 'good' | 'needs-improvement' | 'poor';
  /** Diferencia respecto a la medición anterior. */
  delta: number;
  /** Identificador único de la medición. */
  id: string;
  /** Tipo de navegación que originó la medición. */
  navigationType: string;
}

// Cola de métricas pendiente de enviar. Se agrupan para no generar una
// petición por cada métrica.
const metricsQueue: WebVitalMetrics[] = [];

/**
 * Clasifica una métrica como 'good', 'needs-improvement' o 'poor'
 * según los umbrales de Google para ese nombre concreto.
 *
 * @param name - Nombre de la métrica.
 * @param value - Valor medido.
 * @returns La clasificación resultante.
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
 * Envía un lote de métricas al backend.
 *
 * Nunca propaga errores: el monitoreo de rendimiento es secundario y no debe
 * romper ni ensuciar la consola de la aplicación.
 *
 * @param metrics - Métricas a enviar. Si la lista está vacía no se llama al backend.
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
 * Normaliza una métrica de la librería `web-vitals`, la encola y dispara el
 * envío cuando se han acumulado las cinco métricas del ciclo.
 *
 * @param metric - Métrica reportada por `web-vitals`.
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
  }

  // Enviar cuando completemos todas las métricas
  if (metricsQueue.length >= 5) {
    sendMetricsToBackend([...metricsQueue]);
    metricsQueue.length = 0;
  }
}

/**
 * Registra los listeners de Core Web Vitals.
 *
 * Llamar una sola vez al arrancar la app: cada llamada vuelve a suscribir los
 * callbacks y una misma métrica se contaría tantas veces como se invoque.
 */
export function useWebVitals() {
  // Registrar callbacks para cada métrica
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    onCLS(processMetric);
    onINP(processMetric);
    onFCP(processMetric);
    onLCP(processMetric);
    onTTFB(processMetric);

  }
}

/**
 * Registra una métrica de rendimiento medida por la propia aplicación
 * (por ejemplo, el tiempo de una acción de negocio).
 *
 * @param name - Nombre de la métrica.
 * @param value - Valor medido; se redondea a entero.
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
  }
}

/**
 * Fuerza el envío de las métricas que quedaran en la cola.
 * Útil llamar al descargar la página, para no perderlas.
 */
export function flushMetrics() {
  if (metricsQueue.length > 0) {
    sendMetricsToBackend([...metricsQueue]);
    metricsQueue.length = 0;
  }
}
