package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.RecetaDTO;
import com.puntodeventa.backend.service.RecetaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de recetas (BOM).
 */
@RestController
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
@Tag(name = "Inventario - Recetas", description = "Endpoints para gestión de recetas (BOM)")
public class RecetaController {
    
    private final RecetaService recetaService;
    
    /**
     * Obtiene todas las recetas.
     *
     * @return lista completa de recetas
     */
    @GetMapping
    @Operation(summary = "Obtener todas las recetas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'COCINA')")
    public ResponseEntity<List<RecetaDTO>> obtenerTodas() {
        return ResponseEntity.ok(recetaService.obtenerTodas());
    }
    
    /**
     * Obtiene las recetas de un producto.
     *
     * @param productoId identificador del producto
     * @return recetas del producto
     */
    @GetMapping("/producto/{productoId}")
    @Operation(summary = "Obtener recetas de un producto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'COCINA')")
    public ResponseEntity<List<RecetaDTO>> obtenerPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(recetaService.obtenerPorProducto(productoId));
    }
    
    /**
     * Obtiene las recetas que usan un ingrediente.
     *
     * @param ingredienteId identificador del ingrediente
     * @return recetas que lo utilizan
     */
    @GetMapping("/ingrediente/{ingredienteId}")
    @Operation(summary = "Obtener recetas que usan un ingrediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<RecetaDTO>> obtenerPorIngrediente(@PathVariable Long ingredienteId) {
        return ResponseEntity.ok(recetaService.obtenerPorIngrediente(ingredienteId));
    }
    
    /**
     * Calcula el costo estándar de un producto según su receta.
     *
     * @param productoId identificador del producto
     * @return costo de la receta
     */
    @GetMapping("/producto/{productoId}/costo")
    @Operation(summary = "Calcular costo estándar de un producto según su receta")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Map<String, BigDecimal>> calcularCostoReceta(@PathVariable Long productoId) {
        BigDecimal costo = recetaService.calcularCostoReceta(productoId);
        return ResponseEntity.ok(Map.of("costoReceta", costo));
    }
    
    /**
     * Crea una receta nueva.
     *
     * @param dto datos de la receta
     * @return receta creada con estado 201
     */
    @PostMapping
    @Operation(summary = "Crear nueva receta")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<RecetaDTO> crear(@Valid @RequestBody RecetaDTO dto) {
        RecetaDTO creada = recetaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }
    
    /**
     * Actualiza la receta de un par producto-ingrediente.
     *
     * @param productoId identificador del producto
     * @param ingredienteId identificador del ingrediente
     * @param dto datos a actualizar
     * @return receta actualizada
     */
    @PutMapping("/producto/{productoId}/ingrediente/{ingredienteId}")
    @Operation(summary = "Actualizar receta")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<RecetaDTO> actualizar(
            @PathVariable Long productoId,
            @PathVariable Long ingredienteId,
            @Valid @RequestBody RecetaDTO dto) {
        return ResponseEntity.ok(recetaService.actualizar(productoId, ingredienteId, dto));
    }
    
    /**
     * Elimina una receta concreta.
     *
     * @param productoId identificador del producto
     * @param ingredienteId identificador del ingrediente
     * @return sin contenido
     */
    @DeleteMapping("/producto/{productoId}/ingrediente/{ingredienteId}")
    @Operation(summary = "Eliminar receta específica")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long productoId,
            @PathVariable Long ingredienteId) {
        recetaService.eliminar(productoId, ingredienteId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Elimina todas las recetas de un producto.
     *
     * @param productoId identificador del producto
     * @return sin contenido
     */
    @DeleteMapping("/producto/{productoId}")
    @Operation(summary = "Eliminar todas las recetas de un producto")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarRecetasDeProducto(@PathVariable Long productoId) {
        recetaService.eliminarRecetasDeProducto(productoId);
        return ResponseEntity.noContent().build();
    }
}
