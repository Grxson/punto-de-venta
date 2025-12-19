package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.service.CompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller para gestión de compras.
 * Endpoints segregados por sucursal del usuario actual.
 */
@Slf4j
@RestController
@RequestMapping("/api/compras")
@Tag(name = "Compras", description = "Gestión de compras de materia prima a proveedores")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'USUARIO')")
public class CompraController {

    private final CompraService compraService;

    /**
     * Listar compras de la sucursal actual (con paginación).
     */
    @GetMapping
    @Operation(summary = "Listar compras", description = "Obtiene las compras de la sucursal actual del usuario, paginadas")
    public ResponseEntity<Page<CompraListadoDTO>> listarCompras(
            @Parameter(description = "Página (0-indexed)") @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CompraListadoDTO> compras = compraService.obtenerCompras(pageable);

        log.info("📦 Listadas {} compras (página {}/{})",
                compras.getNumberOfElements(),
                page,
                compras.getTotalPages());

        return ResponseEntity.ok(compras);
    }

    /**
     * Obtener compra por ID (con detalles completos).
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener compra", description = "Obtiene los detalles completos de una compra incluyendo todos sus items")
    public ResponseEntity<CompraDTO> obtenerCompra(
            @Parameter(description = "ID de la compra") @PathVariable Long id) {

        CompraDTO compra = compraService.obtenerCompra(id);
        log.info("📦 Compra obtenida: ID {}", id);

        return ResponseEntity.ok(compra);
    }

    /**
     * Filtrar compras por rango de fechas y estado.
     */
    @GetMapping("/filtro")
    @Operation(summary = "Filtrar compras", description = "Obtiene compras según rango de fechas y estado")
    public ResponseEntity<List<CompraDTO>> filtrarCompras(
            @Parameter(description = "Fecha inicial (ISO-8601)") @RequestParam LocalDateTime inicio,

            @Parameter(description = "Fecha final (ISO-8601)") @RequestParam LocalDateTime fin,

            @Parameter(description = "Estado: pendiente, recibida, cancelada, rechazada") @RequestParam(defaultValue = "pendiente") String estado) {

        List<CompraDTO> compras = compraService.obtenerPorFechasYEstado(inicio, fin, estado);
        log.info("📦 Filtradas {} compras entre {} y {}", compras.size(), inicio, fin);

        return ResponseEntity.ok(compras);
    }

    /**
     * Obtener compras de un proveedor específico.
     */
    @GetMapping("/proveedor/{proveedorId}")
    @Operation(summary = "Compras por proveedor", description = "Obtiene todas las compras realizadas a un proveedor específico")
    public ResponseEntity<Page<CompraListadoDTO>> comprasPorProveedor(
            @Parameter(description = "ID del proveedor") @PathVariable Long proveedorId,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CompraListadoDTO> compras = compraService.obtenerPorProveedor(proveedorId, pageable);
        log.info("📦 Compras del proveedor {}: {}", proveedorId, compras.getTotalElements());

        return ResponseEntity.ok(compras);
    }

    /**
     * Crear nueva compra.
     */
    @PostMapping
    @Operation(summary = "Crear compra", description = "Registra una nueva compra de materia prima. Genera automáticamente el gasto.")
    public ResponseEntity<CompraDTO> crearCompra(@Valid @RequestBody CrearCompraRequest request) {
        log.info("📦 Creando compra: proveedor {}, {} items",
                request.proveedorId(),
                request.items().size());

        CompraDTO compra = compraService.crearCompra(request);
        log.info("✅ Compra creada con ID: {}", compra.id());

        return ResponseEntity.status(HttpStatus.CREATED).body(compra);
    }

    /**
     * Actualizar compra pendiente.
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar compra", description = "Actualiza una compra en estado PENDIENTE")
    public ResponseEntity<CompraDTO> actualizarCompra(
            @Parameter(description = "ID de la compra") @PathVariable Long id,
            @Valid @RequestBody ActualizarCompraRequest request) {

        log.info("📦 Actualizando compra ID: {}", id);
        CompraDTO compra = compraService.actualizarCompra(id, request);
        log.info("✅ Compra actualizada");

        return ResponseEntity.ok(compra);
    }

    /**
     * Marcar compra como recibida.
     * ✅ Lógica: Actualiza stock, crea gasto, crea movimientos automáticamente.
     */
    @PostMapping("/{id}/recibir")
    @Operation(summary = "Marcar compra como recibida", description = "Confirma la recepción de una compra. Automáticamente: "
            +
            "1) Actualiza stock de ingredientes, " +
            "2) Crea gasto contable, " +
            "3) Crea movimientos de inventario")
    public ResponseEntity<CompraDTO> recibirCompra(
            @Parameter(description = "ID de la compra") @PathVariable Long id,
            @Valid @RequestBody RecibirCompraRequest request) {

        log.info("📦 Recibiendo compra ID: {}", id);
        CompraDTO compra = compraService.recibirCompra(id, request);
        log.info("✅ Compra recibida. Stock actualizado. Gasto creado.");

        return ResponseEntity.ok(compra);
    }

    /**
     * Cancelar compra pendiente.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar compra", description = "Cancela una compra en estado PENDIENTE")
    public ResponseEntity<Void> cancelarCompra(
            @Parameter(description = "ID de la compra") @PathVariable Long id) {

        log.info("📦 Cancelando compra ID: {}", id);
        compraService.cancelarCompra(id);
        log.info("✅ Compra cancelada");

        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener últimos proveedores (preferencias de usuario).
     * Útil para agilizar entrada masiva.
     */
    @GetMapping("/preferencias/ultimos-proveedores")
    @Operation(summary = "Últimos proveedores", description = "Obtiene los últimos proveedores con los que se ha comprado (para agilizar entrada)")
    public ResponseEntity<List<CompraDTO>> obtenerUltimosProveedores(
            @Parameter(description = "Límite de resultados") @RequestParam(defaultValue = "5") int limite) {

        List<CompraDTO> compras = compraService.obtenerUltimosProveedores(limite);
        log.info("📦 Obtenidos {} últimos proveedores de usuario", compras.size());

        return ResponseEntity.ok(compras);
    }
}
