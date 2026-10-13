package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CrearVentaRequest;
import com.puntodeventa.backend.dto.ActualizarVentaRequest;
import com.puntodeventa.backend.dto.VentaDTO;
import com.puntodeventa.backend.dto.DesglosePagoDTO;
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
@Tag(name = "Ventas", description = "Endpoints para registro y consulta de ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    /**
     * Obtiene las ventas con paginación y filtro de fechas.
     *
     * @param page página a devolver (0-indexed)
     * @param size tamaño de página, acotado al rango 1-500
     * @param desde fecha inicial opcional (yyyy-MM-dd)
     * @param hasta fecha final opcional (yyyy-MM-dd)
     * @return lista de ventas que cumplen los filtros
     */
    @GetMapping
    @Operation(summary = "Obtener ventas con paginación y filtro de fechas", description = "Por defecto retorna ventas de hoy. Parámetros: page (0-indexed), size (1-500), desde (opcional, formato: yyyy-MM-dd), hasta (opcional)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<VentaDTO>> obtenerTodas(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size,
            @RequestParam(name = "desde", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String desde,
            @RequestParam(name = "hasta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String hasta) {
        // Validar parámetros
        if (page < 0)
            page = 0;
        if (size < 1)
            size = 1;
        if (size > 500)
            size = 500;
        return ResponseEntity.ok(ventaService.obtenerTodas(page, size, desde, hasta));
    }

    /**
     * Obtiene una venta por su identificador.
     *
     * @param id identificador de la venta
     * @return venta encontrada
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener venta por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<VentaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    /**
     * Obtiene las ventas con un estado concreto.
     *
     * @param estado estado de la venta: abierta, cerrada o cancelada
     * @return ventas con ese estado
     */
    @GetMapping("/estado/{estado}")
    @Operation(summary = "Obtener ventas por estado", description = "Estados: abierta, cerrada, cancelada")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ventaService.obtenerPorEstado(estado));
    }

    /**
     * Obtiene las ventas de una sucursal.
     *
     * @param sucursalId identificador de la sucursal
     * @return ventas de la sucursal
     */
    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Obtener ventas por sucursal")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(ventaService.obtenerPorSucursal(sucursalId));
    }

    /**
     * Obtiene las ventas dentro de un rango de fechas.
     *
     * @param desde inicio del rango
     * @param hasta fin del rango
     * @return ventas del rango
     */
    @GetMapping("/rango")
    @Operation(summary = "Obtener ventas por rango de fechas", description = "Formato: yyyy-MM-dd'T'HH:mm:ss (ejemplo: 2025-01-01T00:00:00)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<VentaDTO>> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(ventaService.obtenerPorRangoFechas(desde, hasta));
    }

    /**
     * Registra una venta nueva y descuenta el inventario.
     *
     * @param request datos de la venta con sus items y pagos
     * @return venta creada con estado 201
     */
    @PostMapping
    @Operation(summary = "Crear nueva venta", description = "Registra una venta completa con items y pagos. Descuenta inventario automáticamente.")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<VentaDTO> crearVenta(@Valid @RequestBody CrearVentaRequest request) {
        VentaDTO ventaCreada = ventaService.crearVenta(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaCreada);
    }

    /**
     * Actualiza una venta existente, revirtiendo y recalculando el inventario.
     *
     * @param id identificador de la venta
     * @param request datos a actualizar
     * @return venta actualizada
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar venta", description = "Actualiza una venta existente, revirtiendo y recalculando movimientos de inventario. "
            +
            "Solo permite editar ventas de las últimas 24 horas y que no estén canceladas. " +
            "Cualquier empleado autenticado puede editar.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VentaDTO> actualizarVenta(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarVentaRequest request) {
        VentaDTO ventaActualizada = ventaService.actualizarVenta(id, request);
        return ResponseEntity.ok(ventaActualizada);
    }

    /**
     * Cancela una venta y revierte el inventario asociado.
     *
     * @param id identificador de la venta
     * @param motivo motivo obligatorio de la cancelación
     * @return venta cancelada
     */
    @PutMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar venta", description = "Cancela una venta y revierte los movimientos de inventario asociados. "
            +
            "Solo permite cancelar ventas de las últimas 24 horas. " +
            "Requiere motivo obligatorio. Cualquier empleado autenticado puede cancelar.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VentaDTO> cancelarVenta(
            @PathVariable Long id,
            @RequestParam @NotBlank(message = "El motivo de cancelación es obligatorio") String motivo) {
        VentaDTO ventaCancelada = ventaService.cancelarVenta(id, motivo);
        return ResponseEntity.ok(ventaCancelada);
    }

    /**
     * Actualiza únicamente la fecha de una venta existente.
     *
     * @param id identificador de la venta
     * @param fecha nueva fecha de la venta
     * @return venta actualizada
     */
    @PutMapping("/{id}/fecha")
    @Operation(summary = "Actualizar fecha de venta", description = "Actualiza únicamente la fecha de una venta existente. "
            +
            "La venta no debe estar cancelada. " +
            "Restricción temporal: Los empleados regulares solo pueden editar ventas de las últimas 24 horas. " +
            "Los usuarios ADMIN pueden editar ventas de cualquier fecha. " +
            "Formato de fecha: yyyy-MM-dd'T'HH:mm:ss (ejemplo: 2025-01-01T14:30:00). " +
            "Cualquier usuario autenticado puede ejecutar esta operación.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VentaDTO> actualizarFechaVenta(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fecha) {
        VentaDTO ventaActualizada = ventaService.actualizarFechaVenta(id, fecha);
        return ResponseEntity.ok(ventaActualizada);
    }

    /**
     * Elimina permanentemente una venta (solo ADMIN).
     *
     * @param id identificador de la venta
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar venta definitivamente", description = "Elimina permanentemente una venta de la base de datos. "
            +
            "SOLO ADMIN puede realizar esta acción. " +
            "Esta operación es IRREVERSIBLE y eliminará la venta, sus items y pagos asociados.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarVenta(@PathVariable Long id) {
        ventaService.eliminarVenta(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtiene el desglose de ventas por método de pago en un rango de fechas.
     *
     * @param desde inicio del rango
     * @param hasta fin del rango
     * @return total recaudado por método de pago
     */
    @GetMapping("/resumen/metodos-pago")
    @Operation(summary = "Obtener desglose de ventas por método de pago", description = "Devuelve el total recaudado por cada método de pago (Efectivo, Tarjeta, etc.) "
            +
            "para un rango de fechas. Solo cuenta ventas con estado 'cerrada'. " +
            "Formato de fechas: yyyy-MM-dd'T'HH:mm:ss (ejemplo: 2025-01-01T00:00:00)")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<DesglosePagoDTO>> obtenerDesglosePorMetodoPago(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        List<DesglosePagoDTO> desglose = ventaService.obtenerDesglosePorMetodoPago(desde, hasta);
        return ResponseEntity.ok(desglose);
    }
}
