package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CrearGastoRequest;
import com.puntodeventa.backend.dto.GastoDTO;
import com.puntodeventa.backend.service.GastoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST de gastos operativos del negocio.
 *
 * Expone el registro, consulta, edición y eliminación de gastos, con filtros
 * por sucursal, categoría y rango de fechas.
 */
@RestController
@RequestMapping("/api/finanzas/gastos")
@Tag(name = "Gastos", description = "Gestión de gastos operativos del negocio")
@RequiredArgsConstructor
public class GastoController {
    
    private final GastoService gastoService;
    
    /**
     * Obtiene todos los gastos.
     *
     * @return lista completa de gastos
     */
    @GetMapping
    @Operation(summary = "Listar todos los gastos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<List<GastoDTO>> obtenerTodos() {
        return ResponseEntity.ok(gastoService.obtenerTodos());
    }
    
    /**
     * Obtiene un gasto por su identificador.
     *
     * @param id identificador del gasto
     * @return gasto encontrado
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener gasto por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<GastoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gastoService.obtenerPorId(id));
    }
    
    /**
     * Obtiene los gastos de una sucursal.
     *
     * @param sucursalId identificador de la sucursal
     * @return gastos de la sucursal
     */
    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Obtener gastos por sucursal")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<GastoDTO>> obtenerPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(gastoService.obtenerPorSucursal(sucursalId));
    }
    
    /**
     * Obtiene los gastos de una categoría.
     *
     * @param categoriaGastoId identificador de la categoría de gasto
     * @return gastos de la categoría
     */
    @GetMapping("/categoria/{categoriaGastoId}")
    @Operation(summary = "Obtener gastos por categoría")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<GastoDTO>> obtenerPorCategoria(@PathVariable Long categoriaGastoId) {
        return ResponseEntity.ok(gastoService.obtenerPorCategoria(categoriaGastoId));
    }
    
    /**
     * Obtiene los gastos dentro de un rango de fechas.
     *
     * @param desde inicio del rango
     * @param hasta fin del rango
     * @return gastos del rango
     */
    @GetMapping("/rango")
    @Operation(summary = "Obtener gastos por rango de fechas")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<List<GastoDTO>> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(gastoService.obtenerPorRangoFechas(desde, hasta));
    }
    
    /**
     * Busca gastos de insumos o ingredientes por descripción.
     *
     * @param busqueda texto a buscar, opcional
     * @return gastos que coinciden con la búsqueda
     */
    @GetMapping("/buscar-insumos")
    @Operation(summary = "Buscar gastos de insumos/ingredientes por descripción")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<GastoDTO>> buscarInsumosParaIngredientes(
            @RequestParam(required = false) String busqueda) {
        return ResponseEntity.ok(gastoService.buscarGastosInsumos(busqueda));
    }
    
    /**
     * Registra un gasto nuevo.
     *
     * @param request datos del gasto
     * @return gasto creado con estado 201
     */
    @PostMapping
    @Operation(summary = "Registrar nuevo gasto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<GastoDTO> crear(@RequestBody CrearGastoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoService.crear(request));
    }
    
    /**
     * Actualiza un gasto existente.
     *
     * @param id identificador del gasto
     * @param request datos a actualizar
     * @return gasto actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar gasto existente")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<GastoDTO> actualizar(@PathVariable Long id, @RequestBody CrearGastoRequest request) {
        return ResponseEntity.ok(gastoService.actualizar(id, request));
    }

    /**
     * Elimina un gasto.
     *
     * @param id identificador del gasto
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar gasto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gastoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

