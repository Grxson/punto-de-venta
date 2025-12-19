package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ManoObraDTO;
import com.puntodeventa.backend.service.ManoObraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Mano de Obra
 */
@Slf4j
@RestController
@RequestMapping("/api/mano-obra")
@RequiredArgsConstructor
@Tag(name = "Mano de Obra", description = "Endpoints para gestión de mano de obra y sueldos")
@PreAuthorize("isAuthenticated()")
public class ManoObraController {

    private final ManoObraService manoObraService;

    @GetMapping
    @Operation(summary = "Obtener toda la mano de obra de la sucursal actual")
    public ResponseEntity<List<ManoObraDTO>> obtenerTodos() {
        log.info("Obteniendo toda la mano de obra");
        return ResponseEntity.ok(manoObraService.obtenerPorSucursal());
    }

    @GetMapping("/activos")
    @Operation(summary = "Obtener mano de obra activa")
    public ResponseEntity<List<ManoObraDTO>> obtenerActivos() {
        log.info("Obteniendo mano de obra activa");
        return ResponseEntity.ok(manoObraService.obtenerActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un registro de mano de obra por ID")
    public ResponseEntity<ManoObraDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo mano de obra: {}", id);
        return ResponseEntity.ok(manoObraService.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo registro de mano de obra")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ManoObraDTO> crear(@RequestBody ManoObraDTO dto) {
        log.info("Creando mano de obra: {}", dto.getPuesto());
        try {
            ManoObraDTO resultado = manoObraService.crear(dto);
            log.info("Mano de obra creada exitosamente: {}", resultado.getId());
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            log.warn("Validación fallida: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al crear mano de obra", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un registro de mano de obra")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ManoObraDTO> actualizar(@PathVariable Long id, @RequestBody ManoObraDTO dto) {
        log.info("Actualizando mano de obra: {}", id);
        return ResponseEntity.ok(manoObraService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) un registro de mano de obra")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Desactivando mano de obra: {}", id);
        manoObraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
