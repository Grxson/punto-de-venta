package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CategoriaGastoDTO;
import com.puntodeventa.backend.service.CategoriaGastoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finanzas/categorias-gasto")
@Tag(name = "Categorías de Gastos", description = "Gestión de categorías para clasificar gastos")
@RequiredArgsConstructor
public class CategoriaGastoController {
    
    private final CategoriaGastoService categoriaGastoService;
    
    @GetMapping
    @Operation(summary = "Listar todas las categorías de gastos")
    public ResponseEntity<List<CategoriaGastoDTO>> obtenerTodas() {
        return ResponseEntity.ok(categoriaGastoService.obtenerTodas());
    }
    
    @GetMapping("/activas")
    @Operation(summary = "Listar categorías activas")
    public ResponseEntity<List<CategoriaGastoDTO>> obtenerActivas() {
        return ResponseEntity.ok(categoriaGastoService.obtenerActivas());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    public ResponseEntity<CategoriaGastoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaGastoService.obtenerPorId(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Crear nueva categoría de gasto")
    public ResponseEntity<CategoriaGastoDTO> crear(@RequestBody CategoriaGastoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaGastoService.crear(dto));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Actualizar categoría de gasto")
    public ResponseEntity<CategoriaGastoDTO> actualizar(@PathVariable Long id, @RequestBody CategoriaGastoDTO dto) {
        return ResponseEntity.ok(categoriaGastoService.actualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Eliminar categoría de gasto (soft delete)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaGastoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

