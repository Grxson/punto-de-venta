package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.IngredienteDTO;
import com.puntodeventa.backend.service.IngredienteService;
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
 * Controlador REST para la gestión de ingredientes del inventario.
 */
@RestController
@RequestMapping("/api/inventario/ingredientes")
@RequiredArgsConstructor
@Tag(name = "Inventario - Ingredientes", description = "Endpoints para gestión de ingredientes")
public class IngredienteController {
    
    private final IngredienteService ingredienteService;
    
    @GetMapping
    @Operation(summary = "Obtener todos los ingredientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerTodos() {
        return ResponseEntity.ok(ingredienteService.obtenerTodos());
    }
    
    @GetMapping("/activos")
    @Operation(summary = "Obtener ingredientes activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerActivos() {
        return ResponseEntity.ok(ingredienteService.obtenerActivos());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener ingrediente por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<IngredienteDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ingredienteService.obtenerPorId(id));
    }
    
    @GetMapping("/categoria/{categoria}")
    @Operation(summary = "Obtener ingredientes por categoría")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(ingredienteService.obtenerPorCategoria(categoria));
    }
    
    @GetMapping("/categorias")
    @Operation(summary = "Obtener todas las categorías de ingredientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<String>> obtenerCategorias() {
        return ResponseEntity.ok(ingredienteService.obtenerCategorias());
    }
    
    @GetMapping("/buscar")
    @Operation(summary = "Buscar ingredientes por nombre")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ingredienteService.buscarPorNombre(nombre));
    }
    
    @PostMapping
    @Operation(summary = "Crear nuevo ingrediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<IngredienteDTO> crear(@Valid @RequestBody IngredienteDTO dto) {
        IngredienteDTO creado = ingredienteService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ingrediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<IngredienteDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody IngredienteDTO dto) {
        return ResponseEntity.ok(ingredienteService.actualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ingrediente (soft delete)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ingredienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
