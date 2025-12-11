package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.VentaItemAtributoSeleccionadoDTO;
import com.puntodeventa.backend.service.VentaItemAtributoSeleccionadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * API REST para gestionar atributos seleccionados en items de venta
 * Endpoints para registrar ingredientes/opciones elegidas por el cliente
 */
@RestController
@RequestMapping("/api/v1/ventas-items/{ventaItemId}/atributos")
@RequiredArgsConstructor
public class VentaItemAtributoSeleccionadoController {

    private final VentaItemAtributoSeleccionadoService atributoService;

    /**
     * Obtener los atributos seleccionados para un item de venta
     */
    @GetMapping
    public ResponseEntity<List<VentaItemAtributoSeleccionadoDTO>> obtenerAtributosPorItem(
            @PathVariable Long ventaItemId) {
        return ResponseEntity.ok(atributoService.obtenerAtributosDelItem(ventaItemId));
    }

    /**
     * Agregar un atributo seleccionado a un item de venta
     */
    @PostMapping
    public ResponseEntity<VentaItemAtributoSeleccionadoDTO> agregarAtributo(
            @PathVariable Long ventaItemId,
            @RequestParam(required = false) Long atributoId,
            @RequestParam(required = false) Long opcionId,
            @RequestParam(defaultValue = "0") BigDecimal precioExtra) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atributoService.agregarAtributo(ventaItemId, atributoId, opcionId, precioExtra));
    }

    /**
     * Agregar un atributo personalizado (valor libre)
     */
    @PostMapping("/personalizado")
    public ResponseEntity<VentaItemAtributoSeleccionadoDTO> agregarAtributoPersonalizado(
            @PathVariable Long ventaItemId,
            @RequestParam String valor,
            @RequestParam(defaultValue = "0") BigDecimal precioExtra) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(atributoService.agregarAtributoPersonalizado(ventaItemId, valor, precioExtra));
    }

    /**
     * Eliminar un atributo seleccionado
     */
    @DeleteMapping("/{atributoSeleccionadoId}")
    public ResponseEntity<Void> eliminarAtributo(
            @PathVariable Long ventaItemId,
            @PathVariable Long atributoSeleccionadoId) {
        atributoService.eliminarAtributo(atributoSeleccionadoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Limpiar todos los atributos de un item
     */
    @DeleteMapping
    public ResponseEntity<Void> limpiarAtributos(
            @PathVariable Long ventaItemId) {
        atributoService.limpiarAtributosDelItem(ventaItemId);
        return ResponseEntity.noContent().build();
    }
}
