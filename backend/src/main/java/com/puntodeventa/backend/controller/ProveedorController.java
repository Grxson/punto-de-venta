package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProveedorDTO;
import com.puntodeventa.backend.service.ProveedorService;
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
 * Controlador REST para la gestión de proveedores.
 */
@RestController
@RequestMapping("/api/inventario/proveedores")
@RequiredArgsConstructor
@Tag(name = "Inventario - Proveedores", description = "Endpoints para gestión de proveedores")
public class ProveedorController {
    
    private final ProveedorService proveedorService;
    
    @GetMapping
    @Operation(summary = "Obtener todos los proveedores")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> obtenerTodos() {
        return ResponseEntity.ok(proveedorService.obtenerTodos());
    }
    
    @GetMapping("/activos")
    @Operation(summary = "Obtener proveedores activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> obtenerActivos() {
        return ResponseEntity.ok(proveedorService.obtenerActivos());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.obtenerPorId(id));
    }
    
    @GetMapping("/buscar")
    @Operation(summary = "Buscar proveedores por nombre")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(proveedorService.buscarPorNombre(nombre));
    }
    
    @PostMapping
    @Operation(summary = "Crear nuevo proveedor")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> crear(@Valid @RequestBody ProveedorDTO dto) {
        ProveedorDTO creado = proveedorService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proveedor")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorDTO dto) {
        return ResponseEntity.ok(proveedorService.actualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor (soft delete)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
