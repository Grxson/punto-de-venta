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

@RestController
@RequestMapping("/api/finanzas/gastos")
@Tag(name = "Gastos", description = "Gestión de gastos operativos del negocio")
@RequiredArgsConstructor
public class GastoController {
    
    private final GastoService gastoService;
    
    @GetMapping
    @Operation(summary = "Listar todos los gastos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<List<GastoDTO>> obtenerTodos() {
        return ResponseEntity.ok(gastoService.obtenerTodos());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener gasto por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<GastoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(gastoService.obtenerPorId(id));
    }
    
    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Obtener gastos por sucursal")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<GastoDTO>> obtenerPorSucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(gastoService.obtenerPorSucursal(sucursalId));
    }
    
    @GetMapping("/categoria/{categoriaGastoId}")
    @Operation(summary = "Obtener gastos por categoría")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<List<GastoDTO>> obtenerPorCategoria(@PathVariable Long categoriaGastoId) {
        return ResponseEntity.ok(gastoService.obtenerPorCategoria(categoriaGastoId));
    }
    
    @GetMapping("/rango")
    @Operation(summary = "Obtener gastos por rango de fechas")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<List<GastoDTO>> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(gastoService.obtenerPorRangoFechas(desde, hasta));
    }
    
    @PostMapping
    @Operation(summary = "Registrar nuevo gasto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO')")
    public ResponseEntity<GastoDTO> crear(@RequestBody CrearGastoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastoService.crear(request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar gasto")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        gastoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

