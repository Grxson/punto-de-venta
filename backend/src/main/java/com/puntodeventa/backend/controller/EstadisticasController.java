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

@RestController
@RequestMapping("/api/estadisticas")
@Tag(name = "Estadísticas", description = "Endpoints para métricas y análisis de desempeño de ventas y productos")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/ventas/dia")
    @Operation(summary = "Resumen de ventas del día", description = "Si no se proporciona fecha, usa fecha actual")
    public ResponseEntity<ResumenVentasDiaDTO> resumenDia(
            @RequestParam(name = "fecha", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fecha
    ) {
        LocalDate f = fecha != null ? fecha : LocalDate.now();
        return ResponseEntity.ok(estadisticasService.resumenDia(f));
    }

    @GetMapping("/ventas/rango")
    @Operation(summary = "Resumen de ventas en rango")
    public ResponseEntity<ResumenVentasDiaDTO> resumenRango(
            @RequestParam("desde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam("hasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta
    ) {
        return ResponseEntity.ok(estadisticasService.resumenRango(desde, hasta, null));
    }

    @GetMapping("/productos/dia")
    @Operation(summary = "Rendimiento de productos en un día", description = "Top N productos ordenados por ingreso")
    public ResponseEntity<List<ProductoRendimientoDTO>> rendimientoProductosDia(
            @RequestParam(name = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(name = "limite", defaultValue = "10") int limite
    ) {
        LocalDate f = fecha != null ? fecha : LocalDate.now();
        return ResponseEntity.ok(estadisticasService.rendimientoProductosDia(f, limite));
    }

    @GetMapping("/productos/rango")
    @Operation(summary = "Rendimiento de productos en rango", description = "Top N productos ordenados por ingreso")
    public ResponseEntity<List<ProductoRendimientoDTO>> rendimientoProductosRango(
            @RequestParam("desde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam("hasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(name = "limite", defaultValue = "10") int limite
    ) {
        return ResponseEntity.ok(estadisticasService.rendimientoProductosRango(desde, hasta, limite));
    }
}
