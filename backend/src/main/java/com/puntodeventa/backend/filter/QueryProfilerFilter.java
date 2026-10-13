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
 * Filtro de medición de tiempos de respuesta de las solicitudes.
 *
 * Mide:
 * - Duración total de cada solicitud
 * - Solicitudes lentas (más de 100 ms)
 * - Agrupa las métricas por endpoint normalizado
 *
 * Publica las métricas en Micrometer para Prometheus y Grafana.
 */
@Slf4j
@Component
public class QueryProfilerFilter extends OncePerRequestFilter {

    private static final long SLOW_QUERY_THRESHOLD_MS = 100;
    private static final String TIMER_NAME = "http.request.duration";
    private static final String SLOW_REQUEST_NAME = "http.request.slow";

    private final MeterRegistry meterRegistry;
    private static final AtomicLong slowQueryCount = new AtomicLong(0);

    /**
     * Crea el filtro con el registro de métricas donde se publicarán las mediciones.
     *
     * @param meterRegistry registro de Micrometer configurado en la aplicación
     */
    public QueryProfilerFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Cronometra la solicitud y publica la duración y, si supera el umbral, el aviso de lentitud.
     *
     * @param request solicitud HTTP en curso
     * @param response respuesta HTTP en curso
     * @param filterChain cadena de filtros a continuar
     * @throws ServletException si falla el filtrado delegado
     * @throws IOException si falla la lectura o escritura de la solicitud o la respuesta
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        String method = request.getMethod();
        String path = request.getRequestURI();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            Timer.builder(TIMER_NAME)
                    .tag("method", method)
                    .tag("endpoint", normalizePath(path))
                    .tag("status", String.valueOf(response.getStatus()))
                    .register(meterRegistry)
                    .record(() -> {
                        // La métrica ya fue medida, esto es solo para registro
                    });

            meterRegistry.timer(TIMER_NAME, "method", method, "endpoint", normalizePath(path))
                    .record(duration, java.util.concurrent.TimeUnit.MILLISECONDS);

            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                slowQueryCount.incrementAndGet();
                meterRegistry.counter(SLOW_REQUEST_NAME, "endpoint", normalizePath(path)).increment();

                log.warn("🐌 SOLICITUD LENTA: {} {} tardó {}ms (umbral: {}ms)",
                        method, path, duration, SLOW_QUERY_THRESHOLD_MS);
            } else if (duration > 50) {
                log.debug("⚡ Solicitud: {} {} tardó {}ms", method, path, duration);
            }
        }
    }

    /**
     * Normaliza las rutas para agruparlas por patrón y no por identificadores concretos.
     * Ejemplo: /api/productos/123 → /api/productos/{id}
     *
     * @param path ruta de la solicitud
     * @return ruta con los identificadores numéricos sustituidos y sin parámetros de consulta
     */
    private String normalizePath(String path) {
        if (path == null) return "unknown";

        return path.replaceAll("/\\d+", "/{id}")
                   .replaceAll("\\?.*", "");
    }

    /**
     * Obtiene el contador de solicitudes lentas.
     *
     * @return número de solicitudes que superaron el umbral desde el arranque
     */
    public static long getSlowQueryCount() {
        return slowQueryCount.get();
    }

    /**
     * Restablece el contador de solicitudes lentas.
     */
    public static void resetSlowQueryCount() {
        slowQueryCount.set(0);
    }
}
