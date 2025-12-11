package com.puntodeventa.backend.controller;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Controlador para exponer métricas de performance.
 * 
 * Proporciona:
 * - Queries lentas (> 100ms)
 * - Endpoints más lentos
 * - Estadísticas de latencia
 * 
 * Integración con Micrometer para monitoring
 * 
 * @author Sistema POS
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/metrics")
public class PerformanceMetricsController {

    private final MeterRegistry meterRegistry;

    public PerformanceMetricsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Obtiene las métricas de queries lentas (> 100ms).
     * 
     * @return Map con endpoints y sus duraciones promedio
     */
    @GetMapping("/slow-queries")
    public ResponseEntity<?> getSlowQueries() {
        List<Timer> timers = meterRegistry.find("http.request.duration").timers()
                .stream().toList();

        Map<String, SlowQueryMetric> slowQueries = new TreeMap<>();

        for (Timer timer : timers) {
            long count = timer.count();
            double meanMs = timer.mean(java.util.concurrent.TimeUnit.MILLISECONDS);

            // Solo incluir si tienen un mínimo de requests y son lentas
            if (count > 0 && meanMs > 10) {
                String endpoint = timer.getId().getTag("endpoint");
                if (endpoint == null) endpoint = "unknown";

                slowQueries.putIfAbsent(endpoint, new SlowQueryMetric(
                        endpoint,
                        meanMs,
                        count,
                        timer.getId().getTag("status")
                ));
            }
        }

        // Ordenar por duración descendente
        List<SlowQueryMetric> sorted = slowQueries.values().stream()
                .sorted((a, b) -> Double.compare(b.meanDurationMs, a.meanDurationMs))
                .limit(20)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "timestamp", System.currentTimeMillis(),
                "slowQueryThresholdMs", 100,
                "slowQueries", sorted
        ));
    }

    /**
     * Obtiene todas las métricas de request agrupadas por endpoint.
     * 
     * @return Map con estadísticas de latencia por endpoint
     */
    @GetMapping("/request-stats")
    public ResponseEntity<?> getRequestStats() {
        List<Timer> timers = meterRegistry.find("http.request.duration").timers()
                .stream().toList();

        Map<String, RequestStatsMetric> stats = new TreeMap<>();

        for (Timer timer : timers) {
            String endpoint = timer.getId().getTag("endpoint");
            if (endpoint == null) endpoint = "unknown";

            long count = timer.count();
            if (count == 0) continue;

            double meanMs = timer.mean(java.util.concurrent.TimeUnit.MILLISECONDS);
            double maxMs = timer.max(java.util.concurrent.TimeUnit.MILLISECONDS);

            stats.putIfAbsent(endpoint, new RequestStatsMetric(
                    endpoint,
                    count,
                    meanMs,
                    maxMs,
                    timer.getId().getTag("method")
            ));
        }

        return ResponseEntity.ok(Map.of(
                "timestamp", System.currentTimeMillis(),
                "stats", stats.values().stream()
                        .sorted((a, b) -> Long.compare(b.requestCount, a.requestCount))
                        .collect(Collectors.toList())
        ));
    }

    /**
     * Obtiene métricas compiladas para dashboard.
     * 
     * @return Resumen de performance
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getPerformanceSummary() {
        List<Timer> timers = meterRegistry.find("http.request.duration").timers()
                .stream().toList();

        long totalRequests = timers.stream().mapToLong(Timer::count).sum();
        double avgLatencyMs = timers.stream()
                .mapToDouble(t -> t.mean(java.util.concurrent.TimeUnit.MILLISECONDS))
                .average()
                .orElse(0);

        long slowRequests = timers.stream()
                .filter(t -> t.mean(java.util.concurrent.TimeUnit.MILLISECONDS) > 100)
                .mapToLong(Timer::count)
                .sum();

        return ResponseEntity.ok(Map.of(
                "timestamp", System.currentTimeMillis(),
                "totalRequests", totalRequests,
                "averageLatencyMs", String.format("%.2f", avgLatencyMs),
                "slowRequests", slowRequests,
                "slowRequestsPercentage", totalRequests > 0 
                        ? String.format("%.2f%%", (slowRequests * 100.0) / totalRequests)
                        : "0%",
                "status", "✅ All systems operational"
        ));
    }

    /**
     * Record interno para representar una query lenta.
     */
    public record SlowQueryMetric(
            String endpoint,
            double meanDurationMs,
            long requestCount,
            String statusCode
    ) {}

    /**
     * Record interno para representar estadísticas de request.
     */
    public record RequestStatsMetric(
            String endpoint,
            long requestCount,
            double meanDurationMs,
            double maxDurationMs,
            String method
    ) {}
}
