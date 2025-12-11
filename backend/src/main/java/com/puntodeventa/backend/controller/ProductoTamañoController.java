package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoTamañoDTO;
import com.puntodeventa.backend.service.ProductoTamañoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST para gestionar tamaños de productos
 * Endpoints para crear, actualizar, obtener y desactivar tamaños
 */
@RestController
@RequestMapping("/api/v1/tamaños")
@RequiredArgsConstructor
public class ProductoTamañoController {

    private final ProductoTamañoService tamañoService;

    /**
     * Obtener todos los tamaños activos
     */
    @GetMapping
    public ResponseEntity<List<ProductoTamañoDTO>> obtenerTodos() {
        return ResponseEntity.ok(tamañoService.obtenerTodosActivos());
    }

    /**
     * Obtener un tamaño específico por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductoTamañoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tamañoService.obtenerPorId(id));
    }

    /**
     * Buscar tamaños por nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoTamañoDTO>> buscar(@RequestParam String nombre) {
        return ResponseEntity.ok(tamañoService.buscar(nombre));
    }

    /**
     * Crear un nuevo tamaño
     */
    @PostMapping
    public ResponseEntity<ProductoTamañoDTO> crear(@RequestBody ProductoTamañoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tamañoService.crear(dto));
    }

    /**
     * Actualizar un tamaño existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductoTamañoDTO> actualizar(
            @PathVariable Long id,
            @RequestBody ProductoTamañoDTO dto) {
        return ResponseEntity.ok(tamañoService.actualizar(id, dto));
    }

    /**
     * Desactivar un tamaño
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        tamañoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
