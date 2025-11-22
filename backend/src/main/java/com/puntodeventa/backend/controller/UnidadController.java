package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.UnidadDTO;
import com.puntodeventa.backend.service.UnidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de unidades de medida.
 */
@RestController
@RequestMapping("/api/inventario/unidades")
@RequiredArgsConstructor
@Tag(name = "Inventario - Unidades", description = "Endpoints para gestión de unidades de medida")
public class UnidadController {
    
    private final UnidadService unidadService;
    
    @GetMapping
    @Operation(summary = "Obtener todas las unidades")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<UnidadDTO>> obtenerTodas() {
        return ResponseEntity.ok(unidadService.obtenerTodas());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener unidad por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<UnidadDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(unidadService.obtenerPorId(id));
    }
    
    @PostMapping
    @Operation(summary = "Crear nueva unidad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnidadDTO> crear(@Valid @RequestBody UnidadDTO dto) {
        UnidadDTO creada = unidadService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar unidad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnidadDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UnidadDTO dto) {
        return ResponseEntity.ok(unidadService.actualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar unidad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        unidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
