package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoAtributoOpcionDTO;
import com.puntodeventa.backend.service.ProductoAtributoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST para gestionar opciones de atributos de productos
 * Operaciones CRUD para ingredientes, sabores, etc.
 */
@RestController
@RequestMapping("/api/v1/atributos/{atributoId}/opciones")
@RequiredArgsConstructor
public class ProductoAtributoOpcionController {

    private final ProductoAtributoService atributoService;

    /**
     * Obtener todas las opciones de un atributo
     */
    @GetMapping
    public ResponseEntity<List<ProductoAtributoOpcionDTO>> obtenerOpciones(
            @PathVariable Long atributoId) {
        return ResponseEntity.ok(atributoService.obtenerOpcionesActivas(atributoId));
    }

    /**
     * Obtener una opción específica
     */
    @GetMapping("/{opcionId}")
    public ResponseEntity<ProductoAtributoOpcionDTO> obtenerOpcion(
            @PathVariable Long atributoId,
            @PathVariable Long opcionId) {
        return ResponseEntity.ok(atributoService.obtenerOpcionPorId(opcionId));
    }

    /**
     * Crear una nueva opción para el atributo
     */
    @PostMapping
    public ResponseEntity<ProductoAtributoOpcionDTO> crear(
            @PathVariable Long atributoId,
            @RequestBody ProductoAtributoOpcionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atributoService.crearOpcion(atributoId, dto));
    }

    /**
     * Actualizar una opción existente
     */
    @PutMapping("/{opcionId}")
    public ResponseEntity<ProductoAtributoOpcionDTO> actualizar(
            @PathVariable Long atributoId,
            @PathVariable Long opcionId,
            @RequestBody ProductoAtributoOpcionDTO dto) {
        return ResponseEntity.ok(atributoService.actualizarOpcion(opcionId, dto));
    }

    /**
     * Desactivar una opción
     */
    @DeleteMapping("/{opcionId}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long atributoId,
            @PathVariable Long opcionId) {
        atributoService.desactivarOpcion(opcionId);
        return ResponseEntity.noContent().build();
    }
}
