package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.IngredienteDTO;
import com.puntodeventa.backend.dto.UnidadDTO;
import com.puntodeventa.backend.service.IngredienteService;
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
 * Controlador REST para la gestión de ingredientes del inventario.
 */
@RestController
@RequestMapping("/api/ingredientes")
@RequiredArgsConstructor
@Tag(name = "Inventario - Ingredientes", description = "Endpoints para gestión de ingredientes")
public class IngredienteController {
    
    private final IngredienteService ingredienteService;
    private final UnidadService unidadService;
    
    /**
     * Obtiene todos los ingredientes.
     *
     * @return lista completa de ingredientes
     */
    @GetMapping
    @Operation(summary = "Obtener todos los ingredientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerTodos() {
        return ResponseEntity.ok(ingredienteService.obtenerTodos());
    }
    
    /**
     * Obtiene solo los ingredientes activos.
     *
     * @return lista de ingredientes activos
     */
    @GetMapping("/activos")
    @Operation(summary = "Obtener ingredientes activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerActivos() {
        return ResponseEntity.ok(ingredienteService.obtenerActivos());
    }
    
    /**
     * Obtiene todas las unidades de medida disponibles.
     *
     * @return lista de unidades
     */
    @GetMapping("/unidades")
    @Operation(summary = "Obtener todas las unidades de medida disponibles")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<UnidadDTO>> obtenerUnidades() {
        return ResponseEntity.ok(unidadService.obtenerTodas());
    }
    
    /**
     * Obtiene un ingrediente por su identificador.
     *
     * @param id identificador del ingrediente
     * @return ingrediente encontrado
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener ingrediente por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<IngredienteDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ingredienteService.obtenerPorId(id));
    }
    
    /**
     * Obtiene los ingredientes de una categoría.
     *
     * @param categoria nombre de la categoría
     * @return ingredientes de la categoría
     */
    @GetMapping("/categoria/{categoria}")
    @Operation(summary = "Obtener ingredientes por categoría")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> obtenerPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(ingredienteService.obtenerPorCategoria(categoria));
    }
    
    /**
     * Obtiene todas las categorías de ingredientes.
     *
     * @return lista de nombres de categorías
     */
    @GetMapping("/categorias")
    @Operation(summary = "Obtener todas las categorías de ingredientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<String>> obtenerCategorias() {
        return ResponseEntity.ok(ingredienteService.obtenerCategorias());
    }
    
    /**
     * Busca ingredientes por nombre.
     *
     * @param nombre texto a buscar en el nombre
     * @return ingredientes que coinciden
     */
    @GetMapping("/buscar")
    @Operation(summary = "Buscar ingredientes por nombre")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<IngredienteDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ingredienteService.buscarPorNombre(nombre));
    }
    
    /**
     * Crea un ingrediente nuevo.
     *
     * @param dto datos del ingrediente
     * @return ingrediente creado con estado 201
     */
    @PostMapping
    @Operation(summary = "Crear nuevo ingrediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<IngredienteDTO> crear(@Valid @RequestBody IngredienteDTO dto) {
        IngredienteDTO creado = ingredienteService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    /**
     * Actualiza un ingrediente existente.
     *
     * @param id identificador del ingrediente
     * @param dto datos a actualizar
     * @return ingrediente actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar ingrediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<IngredienteDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody IngredienteDTO dto) {
        return ResponseEntity.ok(ingredienteService.actualizar(id, dto));
    }
    
    /**
     * Elimina un ingrediente mediante borrado lógico.
     *
     * @param id identificador del ingrediente
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar ingrediente (soft delete)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ingredienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
