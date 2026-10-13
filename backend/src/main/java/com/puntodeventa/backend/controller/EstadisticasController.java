package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoRendimientoDTO;
import com.puntodeventa.backend.dto.ResumenVentasDiaDTO;
import com.puntodeventa.backend.service.EstadisticasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST de estadísticas de ventas y productos.
 *
 * Ofrece resúmenes por día y por rango de fechas, con distintos criterios de
 * gastos según el caso de uso (operacionales para el panel diario, todos para
 * reportes).
 */
@RestController
@RequestMapping("/api/estadisticas")
@Tag(name = "Estadísticas", description = "Endpoints para métricas y análisis de desempeño de ventas y productos")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    /**
     * Crea el controlador con el servicio de estadísticas.
     *
     * @param estadisticasService servicio de estadísticas
     */
    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    /**
     * Obtiene el resumen de ventas de un día.
     *
     * @param fecha fecha a consultar; si es nula se usa la fecha del servidor
     * @return resumen del día con gastos operacionales
     */
    @GetMapping("/ventas/dia")
    @Operation(summary = "Resumen de ventas del día", description = "Parámetro 'fecha' es opcional. Si no se envía, usa la fecha del servidor (puede tener offset si zona horaria es diferente). ✅ SOLO GASTOS OPERACIONALES")
    public ResponseEntity<ResumenVentasDiaDTO> resumenDia(
            @RequestParam(name = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        // ⚠️ Si el cliente NO envía fecha, usar fecha del servidor (pero con aviso en
        // logs)
        LocalDate f = fecha != null ? fecha : LocalDate.now();
        if (fecha == null) {
            org.slf4j.LoggerFactory.getLogger(this.getClass())
                    .warn("⚠️ ENDPOINT /api/estadisticas/ventas/dia LLAMADO SIN PARÁMETRO 'fecha'. " +
                            "Usando LocalDate.now() del servidor. ESTO PUEDE CAUSAR OFFSET DE FECHA.");
        }
        // ✅ DailyStatsPanel: Solo gastos operacionales
        return ResponseEntity.ok(estadisticasService.resumenDiaConGastosOperacionales(f));
    }

    /**
     * Obtiene el resumen de ventas de un rango de fechas para reportes.
     *
     * @param desde inicio del rango
     * @param hasta fin del rango
     * @return resumen del rango con todos los gastos
     */
    @GetMapping("/ventas/rango")
    @Operation(summary = "Resumen de ventas en rango - Para reportes (Corte por Producto, etc.)", description = "✅ INCLUYE TODOS LOS GASTOS: operacionales + administrativos + nómina + etc.")
    public ResponseEntity<ResumenVentasDiaDTO> resumenRango(
            @RequestParam("desde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam("hasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        // Log detallado para debugging de filtros de fecha
        org.slf4j.LoggerFactory.getLogger(this.getClass()).info(
                "📊 [EstadisticasController.resumenRango] desde={}, hasta={}", desde, hasta);

        // Extraer la fecha representativa desde el parámetro "desde"
        LocalDate fechaRepresentativa = desde.toLocalDate();
        // ✅ Para reportes, incluir TODOS los gastos (operacionales + administrativos +
        // nómina + etc.)
        return ResponseEntity.ok(estadisticasService.resumenRangoConTodosGastos(desde, hasta, fechaRepresentativa));
    }

    /**
     * Obtiene los productos de mejor rendimiento en un día.
     *
     * @param fecha fecha a consultar; si es nula se usa la fecha del servidor
     * @param limite número máximo de productos a devolver
     * @return lista de productos ordenados por ingreso
     */
    @GetMapping("/productos/dia")
    @Operation(summary = "Rendimiento de productos en un día", description = "Top N productos ordenados por ingreso")
    public ResponseEntity<List<ProductoRendimientoDTO>> rendimientoProductosDia(
            @RequestParam(name = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(name = "limite", defaultValue = "10") int limite) {
        LocalDate f = fecha != null ? fecha : LocalDate.now();
        return ResponseEntity.ok(estadisticasService.rendimientoProductosDia(f, limite));
    }

    /**
     * Obtiene los productos de mejor rendimiento en un rango de fechas.
     *
     * @param desde inicio del rango
     * @param hasta fin del rango
     * @param limite número máximo de productos a devolver
     * @return lista de productos ordenados por ingreso
     */
    @GetMapping("/productos/rango")
    @Operation(summary = "Rendimiento de productos en rango", description = "Top N productos ordenados por ingreso")
    public ResponseEntity<List<ProductoRendimientoDTO>> rendimientoProductosRango(
            @RequestParam("desde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam("hasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(name = "limite", defaultValue = "10") int limite) {
        return ResponseEntity.ok(estadisticasService.rendimientoProductosRango(desde, hasta, limite));
    }
}
