package com.puntodeventa.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.preAuthorize;
import org.springframework.web.bind.annotation.*;

import com.puntodeventa.backend.dto.InventarioMovimientoReporteDTO;
import com.puntodeventa.backend.service.InventarioMovimientoReporteService;
import com.puntodeventa.backend.security.SecurityUtil;

import java.time.LocalDateTime;

/**
 * Controlador REST para reportes de inventario.
 * Endpoints optimizados para respuestas rápidas.
 */
@Slf4j
@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Endpoints para generación de reportes")
public class ReporteController {

    private final InventarioMovimientoReporteService reporteService;
    private final SecurityUtil securityUtil;

    /**
     * Obtiene reporte de movimiento de inventario por producto.
     * 
     * ✅ Optimizado:
     * - Query única con proyección
     * - Detección dinámica de días activos
     * - Caché por sucursal y rango de fechas
     * - Estructura que elimina columnas vacías
     *
     * @param fechaInicio Inicio del rango (yyyy-MM-dd'T'HH:mm:ss)
     * @param fechaFin Fin del rango (yyyy-MM-dd'T'HH:mm:ss)
     * @return Reporte con días activos y datos por producto
     */
    @GetMapping("/inventario-movimiento")
    @Operation(
        summary = "Reporte de movimiento de inventario por producto",
        description = "Devuelve movimientos diarios (venta, compra, merma) solo para días con operación"
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<InventarioMovimientoReporteDTO> obtenerInventarioMovimiento(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "Fecha inicio (ej: 2025-12-05T00:00:00)")
            LocalDateTime fechaInicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            @Parameter(description = "Fecha fin (ej: 2025-12-07T23:59:59)")
            LocalDateTime fechaFin) {

        Long sucursalId = securityUtil.obtenerSucursalActual();
        
        log.info("Consultando reporte inventario para sucursal {} entre {} y {}", 
            sucursalId, fechaInicio.toLocalDate(), fechaFin.toLocalDate());

        var reporte = reporteService.obtenerReporte(sucursalId, fechaInicio, fechaFin);

        return ResponseEntity.ok(reporte);
    }
}
