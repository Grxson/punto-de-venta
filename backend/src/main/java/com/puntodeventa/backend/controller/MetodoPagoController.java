package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.MetodoPagoDTO;
import com.puntodeventa.backend.service.MetodoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de métodos de pago.
 */
@RestController
@RequestMapping("/api/ventas/metodos-pago")
@RequiredArgsConstructor
@Tag(name = "Ventas - Métodos de Pago", description = "Endpoints para gestión de métodos de pago")
public class MetodoPagoController {
    
    private final MetodoPagoService metodoPagoService;
    
    /**
     * Obtiene todos los métodos de pago.
     *
     * @return lista completa de métodos de pago
     */
    @GetMapping
    @Operation(summary = "Obtener todos los métodos de pago")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<MetodoPagoDTO>> obtenerTodos() {
        return ResponseEntity.ok(metodoPagoService.obtenerTodos());
    }
    
    /**
     * Obtiene solo los métodos de pago activos.
     *
     * @return lista de métodos de pago activos
     */
    @GetMapping("/activos")
    @Operation(summary = "Obtener métodos de pago activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<List<MetodoPagoDTO>> obtenerActivos() {
        return ResponseEntity.ok(metodoPagoService.obtenerActivos());
    }
    
    /**
     * Obtiene un método de pago por su identificador.
     *
     * @param id identificador del método de pago
     * @return método de pago encontrado
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener método de pago por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'CAJERO')")
    public ResponseEntity<MetodoPagoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(metodoPagoService.obtenerPorId(id));
    }
    
    /**
     * Crea un método de pago nuevo.
     *
     * @param dto datos del método de pago
     * @return método de pago creado con estado 201
     */
    @PostMapping
    @Operation(summary = "Crear nuevo método de pago")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MetodoPagoDTO> crear(@Valid @RequestBody MetodoPagoDTO dto) {
        MetodoPagoDTO creado = metodoPagoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    /**
     * Actualiza un método de pago existente.
     *
     * @param id identificador del método de pago
     * @param dto datos a actualizar
     * @return método de pago actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar método de pago")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MetodoPagoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MetodoPagoDTO dto) {
        return ResponseEntity.ok(metodoPagoService.actualizar(id, dto));
    }
    
    /**
     * Elimina un método de pago.
     *
     * @param id identificador del método de pago
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar método de pago")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        metodoPagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
