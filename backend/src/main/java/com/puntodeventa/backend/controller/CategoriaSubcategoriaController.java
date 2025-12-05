package com.puntodeventa.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.puntodeventa.backend.dto.CategoriaSubcategoriaDTO;
import com.puntodeventa.backend.service.CategoriaSubcategoriaService;

import java.util.List;

/**
 * REST Controller para gestión de subcategorías de productos.
 */
@RestController
@RequestMapping("/api/categorias/{categoriaId}/subcategorias")
@RequiredArgsConstructor
@Tag(name = "Subcategorías de Productos", description = "Gestión de subcategorías dentro de una categoría")
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
    @Operation(summary = "Obtener subcategorías de una categoría")
    public ResponseEntity<List<CategoriaSubcategoriaDTO>> obtenerSubcategorias(
            @PathVariable Long categoriaId) {
        
        List<CategoriaSubcategoriaDTO> subcategorias = 
            categoriaSubcategoriaService.obtenerSubcategoriasPorCategoria(categoriaId);
        
        return ResponseEntity.ok(subcategorias);
    }
}
