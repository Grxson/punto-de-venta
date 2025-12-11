package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoVarianteTamañoDTO;
import com.puntodeventa.backend.service.ProductoVarianteTamañoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST para gestionar relaciones entre variantes y tamaños
 * Endpoints para asignar tamaños a productos variantes
 */
@RestController
@RequestMapping("/api/v1/productos/{productoId}/tamaños")
@RequiredArgsConstructor
public class ProductoVarianteTamañoController {

    private final ProductoVarianteTamañoService varianteTamañoService;

    /**
     * Obtener todos los tamaños disponibles para un producto
     */
    @GetMapping
    public ResponseEntity<List<ProductoVarianteTamañoDTO>> obtenerTamañosPorProducto(
            @PathVariable Long productoId) {
        return ResponseEntity.ok(varianteTamañoService.obtenerTamañosPorProducto(productoId));
    }

    /**
     * Agregar un tamaño a un producto
     */
    @PostMapping
    public ResponseEntity<ProductoVarianteTamañoDTO> agregarTamaño(
            @PathVariable Long productoId,
            @RequestParam Long tamañoId,
            @RequestParam(defaultValue = "0") Integer orden) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(varianteTamañoService.agregarTamaño(productoId, tamañoId, orden));
    }

    /**
     * Eliminar un tamaño de un producto
     */
    @DeleteMapping("/{tamañoId}")
    public ResponseEntity<Void> eliminarTamaño(
            @PathVariable Long productoId,
            @PathVariable Long tamañoId) {
        // Necesitamos el ID del registro ProductoVarianteTamaño, no los IDs de producto y tamaño
        // Este endpoint necesita ajustarse al servicio
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualizar el orden de tamaños
     */
    @PutMapping("/{tamañoId}/orden")
    public ResponseEntity<ProductoVarianteTamañoDTO> actualizarOrden(
            @PathVariable Long productoId,
            @PathVariable Long tamañoId,
            @RequestParam Integer orden) {
        return ResponseEntity.ok(
                varianteTamañoService.actualizarOrden(tamañoId, orden));
    }
}
