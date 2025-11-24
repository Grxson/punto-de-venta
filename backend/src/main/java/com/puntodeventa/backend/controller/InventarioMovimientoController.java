package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.InventarioMovimientoDTO;
import com.puntodeventa.backend.service.InventarioMovimientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para movimientos de inventario.
 * Documentado según la guía de inventario.
 */
@RestController
@RequestMapping("/api/inventario/movimientos")
public class InventarioMovimientoController {
    @Autowired
    private InventarioMovimientoService movimientoService;

    /**
     * Listar todos los movimientos de inventario.
     */
    @GetMapping
    public List<InventarioMovimientoDTO> listarMovimientos() {
        return movimientoService.listarTodos();
    }

    /**
     * Registrar un nuevo movimiento de inventario.
     */
    @PostMapping
    public ResponseEntity<InventarioMovimientoDTO> registrarMovimiento(@RequestBody InventarioMovimientoDTO dto) {
        InventarioMovimientoDTO creado = movimientoService.registrarMovimiento(dto);
        return ResponseEntity.ok(creado);
    }

    /**
     * Obtener un movimiento por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<InventarioMovimientoDTO> obtenerPorId(@PathVariable Long id) {
        InventarioMovimientoDTO dto = movimientoService.obtenerPorId(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    /**
     * Obtener movimientos por ingrediente.
     */
    @GetMapping("/ingrediente/{ingredienteId}")
    public List<InventarioMovimientoDTO> obtenerPorIngrediente(@PathVariable Long ingredienteId) {
        return movimientoService.obtenerPorIngrediente(ingredienteId);
    }

    /**
     * Obtener movimientos por ingrediente y tipo.
     */
    @GetMapping("/ingrediente/{ingredienteId}/tipo/{tipo}")
    public List<InventarioMovimientoDTO> obtenerPorIngredienteYTipo(
        @PathVariable Long ingredienteId,
        @PathVariable String tipo
    ) {
        return movimientoService.obtenerPorIngredienteYTipo(ingredienteId, tipo);
    }

    /**
     * Obtener movimientos por rango de fechas.
     */
    @GetMapping("/rango")
    public List<InventarioMovimientoDTO> obtenerPorRangoFechas(
        @RequestParam String desde,
        @RequestParam String hasta
    ) {
        java.time.LocalDateTime fechaDesde = java.time.LocalDateTime.parse(desde + "T00:00:00");
        java.time.LocalDateTime fechaHasta = java.time.LocalDateTime.parse(hasta + "T23:59:59");
        return movimientoService.obtenerPorRangoFechas(fechaDesde, fechaHasta);
    }
}
