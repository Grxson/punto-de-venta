package com.puntodeventa.backend.filter;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Filtro para profiling de queries y request timing.
 * 
 * Mide:
 * - Duración total de cada request
 * - Queries lentas (> 100ms)
 * - Categoriza por endpoint
 * 
 * Integración con Micrometer para Prometheus/Grafana
 * 
 * @author Sistema POS
 * @version 1.0
 */
@Slf4j
@Component
public class QueryProfilerFilter extends OncePerRequestFilter {

    private static final long SLOW_QUERY_THRESHOLD_MS = 100;
    private static final String TIMER_NAME = "http.request.duration";
    private static final String SLOW_REQUEST_NAME = "http.request.slow";

    private final MeterRegistry meterRegistry;
    private static final AtomicLong slowQueryCount = new AtomicLong(0);

    public QueryProfilerFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String path = request.getRequestURI();

        try {
            // Ejecutar request
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            // Registrar en Micrometer
            Timer.builder(TIMER_NAME)
                    .tag("method", method)
                    .tag("endpoint", normalizePath(path))
                    .tag("status", String.valueOf(response.getStatus()))
                    .register(meterRegistry)
                    .record(() -> {
                        // La métrica ya fue medida, esto es solo para registro
                    });

            // Registrar en micrometer con duración
            meterRegistry.timer(TIMER_NAME, "method", method, "endpoint", normalizePath(path))
                    .record(duration, java.util.concurrent.TimeUnit.MILLISECONDS);

            // Alertar si es lenta
            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                slowQueryCount.incrementAndGet();
                meterRegistry.counter(SLOW_REQUEST_NAME, "endpoint", normalizePath(path)).increment();
                
                log.warn("🐌 SLOW REQUEST: {} {} took {}ms (threshold: {}ms)",
                        method, path, duration, SLOW_QUERY_THRESHOLD_MS);
            } else if (duration > 50) {
                log.debug("⚡ Request: {} {} took {}ms", method, path, duration);
            }
        }
    }

    /**
     * Normaliza rutas para agrupar por patrón (no por IDs específicos).
     * Ejemplo: /api/productos/123 → /api/productos/{id}
     */
    private String normalizePath(String path) {
        if (path == null) return "unknown";
        
        // Remover IDs numéricos
        return path.replaceAll("/\\d+", "/{id}")
                   .replaceAll("\\?.*", ""); // Remover query params
    }

    /**
     * Obtiene el contador de queries lentas.
     */
    public static long getSlowQueryCount() {
        return slowQueryCount.get();
    }

    /**
     * Resetea el contador de queries lentas.
     */
    public static void resetSlowQueryCount() {
        slowQueryCount.set(0);
    }
}
