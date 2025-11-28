package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CrearVentaRequest;
import com.puntodeventa.backend.dto.ActualizarVentaRequest;
import com.puntodeventa.backend.dto.VentaDTO;
import com.puntodeventa.backend.service.VentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST para la gestión de ventas.
 */
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Endpoints para registro y consulta de ventas")
public class VentaController {
    
    private final VentaService ventaService;
    
    @GetMapping
    @Operation(summary = "Obtener todas las ventas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<VentaDTO>> obtenerTodas() {
        return ResponseEntity.ok(ventaService.obtenerTodas());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener venta por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<VentaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }
    
    @GetMapping("/estado/{estado}")
    @Operation(summary = "Obtener ventas por estado", description = "Estados: abierta, cerrada, cancelada")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ventaService.obtenerPorEstado(estado));
    }
    
    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Obtener ventas por sucursal")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(ventaService.obtenerPorSucursal(sucursalId));
    }
    
    @GetMapping("/rango")
    @Operation(summary = "Obtener ventas por rango de fechas", 
               description = "Formato: yyyy-MM-dd'T'HH:mm:ss (ejemplo: 2025-01-01T00:00:00)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(ventaService.obtenerPorRangoFechas(desde, hasta));
    }
    
    @PostMapping
    @Operation(summary = "Crear nueva venta", 
               description = "Registra una venta completa con items y pagos. Descuenta inventario automáticamente.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<VentaDTO> crearVenta(@Valid @RequestBody CrearVentaRequest request) {
        VentaDTO ventaCreada = ventaService.crearVenta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaCreada);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar venta", 
               description = "Actualiza una venta existente, revirtiendo y recalculando movimientos de inventario. " +
                            "Solo permite editar ventas de las últimas 24 horas y que no estén canceladas. " +
                            "Cualquier empleado autenticado puede editar.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VentaDTO> actualizarVenta(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarVentaRequest request) {
        VentaDTO ventaActualizada = ventaService.actualizarVenta(id, request);
        return ResponseEntity.ok(ventaActualizada);
    }
    
    @PutMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar venta", 
               description = "Cancela una venta y revierte los movimientos de inventario asociados. " +
                            "Solo permite cancelar ventas de las últimas 24 horas. " +
                            "Requiere motivo obligatorio. Cualquier empleado autenticado puede cancelar.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VentaDTO> cancelarVenta(
            @PathVariable Long id,
            @RequestParam @NotBlank(message = "El motivo de cancelación es obligatorio") String motivo) {
        VentaDTO ventaCancelada = ventaService.cancelarVenta(id, motivo);
        return ResponseEntity.ok(ventaCancelada);
    }
}
