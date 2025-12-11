package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoAtributoDTO;
import com.puntodeventa.backend.dto.ProductoAtributoOpcionDTO;
import com.puntodeventa.backend.service.ProductoAtributoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST para gestionar atributos y opciones de productos
 * Endpoints para ingredientes, sabores, etc.
 */
@RestController
@RequestMapping("/api/v1/productos/{productoId}/atributos")
@RequiredArgsConstructor
public class ProductoAtributoController {

    private final ProductoAtributoService atributoService;

    /**
     * Obtener todos los atributos de un producto
     */
    @GetMapping
    public ResponseEntity<List<ProductoAtributoDTO>> obtenerAtributosPorProducto(
            @PathVariable Long productoId) {
        return ResponseEntity.ok(atributoService.obtenerAtributosActivos(productoId));
    }

    /**
     * Obtener un atributo específico
     */
    @GetMapping("/{atributoId}")
    public ResponseEntity<ProductoAtributoDTO> obtenerAtributo(
            @PathVariable Long productoId,
            @PathVariable Long atributoId) {
        return ResponseEntity.ok(atributoService.obtenerAtributoPorId(atributoId));
    }

    /**
     * Crear un nuevo atributo para un producto
     */
    @PostMapping
    public ResponseEntity<ProductoAtributoDTO> crearAtributo(
            @PathVariable Long productoId,
            @RequestBody ProductoAtributoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atributoService.crearAtributo(productoId, dto));
    }

    /**
     * Actualizar un atributo
     */
    @PutMapping("/{atributoId}")
    public ResponseEntity<ProductoAtributoDTO> actualizarAtributo(
            @PathVariable Long productoId,
            @PathVariable Long atributoId,
            @RequestBody ProductoAtributoDTO dto) {
        return ResponseEntity.ok(atributoService.actualizarAtributo(atributoId, dto));
    }

    /**
     * Desactivar un atributo
     */
    @DeleteMapping("/{atributoId}")
    public ResponseEntity<Void> desactivarAtributo(
            @PathVariable Long productoId,
            @PathVariable Long atributoId) {
        atributoService.desactivarAtributo(atributoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener opciones de un atributo
     */
    @GetMapping("/{atributoId}/opciones")
    public ResponseEntity<List<ProductoAtributoOpcionDTO>> obtenerOpciones(
            @PathVariable Long productoId,
            @PathVariable Long atributoId) {
        return ResponseEntity.ok(atributoService.obtenerOpcionesActivas(atributoId));
    }

    /**
     * Crear una opción para un atributo
     */
    @PostMapping("/{atributoId}/opciones")
    public ResponseEntity<ProductoAtributoOpcionDTO> crearOpcion(
            @PathVariable Long productoId,
            @PathVariable Long atributoId,
            @RequestBody ProductoAtributoOpcionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atributoService.crearOpcion(atributoId, dto));
    }

    /**
     * Actualizar una opción
     */
    @PutMapping("/{atributoId}/opciones/{opcionId}")
    public ResponseEntity<ProductoAtributoOpcionDTO> actualizarOpcion(
            @PathVariable Long productoId,
            @PathVariable Long atributoId,
            @PathVariable Long opcionId,
            @RequestBody ProductoAtributoOpcionDTO dto) {
        return ResponseEntity.ok(atributoService.actualizarOpcion(opcionId, dto));
    }

    /**
     * Desactivar una opción
     */
    @DeleteMapping("/{atributoId}/opciones/{opcionId}")
    public ResponseEntity<Void> desactivarOpcion(
            @PathVariable Long productoId,
            @PathVariable Long atributoId,
            @PathVariable Long opcionId) {
        atributoService.desactivarOpcion(opcionId);
        return ResponseEntity.noContent().build();
    }
}
