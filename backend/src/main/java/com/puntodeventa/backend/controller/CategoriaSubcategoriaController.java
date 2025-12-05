package com.puntodeventa.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.puntodeventa.backend.dto.CategoriaSubcategoriaDTO;
import com.puntodeventa.backend.service.CategoriaSubcategoriaService;

import java.util.List;

/**
 * REST Controller para gestión de subcategorías de productos.
 * Proporciona endpoints CRUD completos para subcategorías.
 */
@RestController
@RequestMapping("/api/categorias/{categoriaId}/subcategorias")
@RequiredArgsConstructor
@Validated
@Tag(name = "Inventario - Subcategorías", description = "Endpoints para gestión de subcategorías de productos")
public class CategoriaSubcategoriaController {
    
    private final CategoriaSubcategoriaService categoriaSubcategoriaService;
    
    /**
     * Obtener todas las subcategorías activas de una categoría.
     * 
     * @param categoriaId ID de la categoría
     * @return Lista de subcategorías ordenadas
     * 
     * Ejemplo: GET /api/categorias/1/subcategorias
     */
    @GetMapping
    @Operation(summary = "Listar subcategorías", description = "Obtiene todas las subcategorías activas de una categoría, ordenadas por orden")
    public ResponseEntity<List<CategoriaSubcategoriaDTO>> listar(
            @PathVariable Long categoriaId) {
        
        List<CategoriaSubcategoriaDTO> subcategorias = 
            categoriaSubcategoriaService.obtenerSubcategoriasPorCategoria(categoriaId);
        
        return ResponseEntity.ok(subcategorias);
    }
    
    /**
     * Obtener una subcategoría por ID.
     */
    @GetMapping("/{subcategoriaId}")
    @Operation(summary = "Obtener subcategoría por ID")
    public ResponseEntity<CategoriaSubcategoriaDTO> obtener(
            @PathVariable Long categoriaId,
            @PathVariable Long subcategoriaId
    ) {
        return ResponseEntity.ok(categoriaSubcategoriaService.obtenerPorId(subcategoriaId));
    }
    
    /**
     * Crear una nueva subcategoría.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Crear subcategoría", description = "Crea una nueva subcategoría en la categoría especificada")
    public ResponseEntity<CategoriaSubcategoriaDTO> crear(
            @PathVariable Long categoriaId,
            @Validated @RequestBody CategoriaSubcategoriaDTO dto
    ) {
        // Asegurar que el categoriaId del path coincida con el del DTO
        CategoriaSubcategoriaDTO dtoConCategoriaId = new CategoriaSubcategoriaDTO(
            dto.id(),
            categoriaId,
            dto.nombre(),
            dto.descripcion(),
            dto.orden(),
            dto.activa()
        );
        
        CategoriaSubcategoriaDTO creada = categoriaSubcategoriaService.crear(dtoConCategoriaId);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }
    
    /**
     * Actualizar una subcategoría existente.
     */
    @PutMapping("/{subcategoriaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Actualizar subcategoría")
    public ResponseEntity<CategoriaSubcategoriaDTO> actualizar(
            @PathVariable Long categoriaId,
            @PathVariable Long subcategoriaId,
            @Validated @RequestBody CategoriaSubcategoriaDTO dto
    ) {
        // Asegurar que el categoriaId del path coincida con el del DTO
        CategoriaSubcategoriaDTO dtoConCategoriaId = new CategoriaSubcategoriaDTO(
            subcategoriaId,
            categoriaId,
            dto.nombre(),
            dto.descripcion(),
            dto.orden(),
            dto.activa()
        );
        
        return ResponseEntity.ok(categoriaSubcategoriaService.actualizar(subcategoriaId, dtoConCategoriaId));
    }
    
    /**
     * Eliminar una subcategoría (borrado lógico).
     */
    @DeleteMapping("/{subcategoriaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Eliminar subcategoría", description = "Marca la subcategoría como inactiva (borrado lógico)")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long categoriaId,
            @PathVariable Long subcategoriaId
    ) {
        categoriaSubcategoriaService.eliminar(subcategoriaId);
        return ResponseEntity.noContent().build();
    }
}
