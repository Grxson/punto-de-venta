package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.GastoIndirectoDTO;
import com.puntodeventa.backend.service.GastoIndirectoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestión de Gastos Indirectos
 */
@Slf4j
@RestController
@RequestMapping("/api/gastos-indirectos")
@RequiredArgsConstructor
@Tag(name = "Gastos Indirectos", description = "Endpoints para gestión de gastos indirectos")
@PreAuthorize("isAuthenticated()")
public class GastoIndirectoController {
    
    private final GastoIndirectoService gastoIndirectoService;
    
    @GetMapping
    @Operation(summary = "Obtener todos los gastos indirectos de la sucursal actual")
    public ResponseEntity<List<GastoIndirectoDTO>> obtenerTodos() {
        log.info("Obteniendo todos los gastos indirectos");
        return ResponseEntity.ok(gastoIndirectoService.obtenerPorSucursal());
    }
    
    @GetMapping("/activos")
    @Operation(summary = "Obtener gastos indirectos activos")
    public ResponseEntity<List<GastoIndirectoDTO>> obtenerActivos() {
        log.info("Obteniendo gastos indirectos activos");
        return ResponseEntity.ok(gastoIndirectoService.obtenerActivos());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener un gasto indirecto por ID")
    public ResponseEntity<GastoIndirectoDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo gasto indirecto: {}", id);
        return ResponseEntity.ok(gastoIndirectoService.obtenerPorId(id));
    }
    
    @PostMapping
    @Operation(summary = "Crear un nuevo gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<GastoIndirectoDTO> crear(@RequestBody GastoIndirectoDTO dto) {
        log.info("Creando gasto indirecto: {}", dto.getNombre());
        return ResponseEntity.ok(gastoIndirectoService.crear(dto));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<GastoIndirectoDTO> actualizar(@PathVariable Long id, @RequestBody GastoIndirectoDTO dto) {
        log.info("Actualizando gasto indirecto: {}", id);
        return ResponseEntity.ok(gastoIndirectoService.actualizar(id, dto));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) un gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Desactivando gasto indirecto: {}", id);
        gastoIndirectoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
