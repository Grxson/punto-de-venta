package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProveedorDTO;
import com.puntodeventa.backend.service.ProveedorService;
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
 * Controlador REST para la gestión de proveedores.
 */
@RestController
@RequestMapping("/api/inventario/proveedores")
@RequiredArgsConstructor
@Tag(name = "Inventario - Proveedores", description = "Endpoints para gestión de proveedores")
public class ProveedorController {
    
    private final ProveedorService proveedorService;
    
    /**
     * Obtiene todos los proveedores.
     *
     * @return lista completa de proveedores
     */
    @GetMapping
    @Operation(summary = "Obtener todos los proveedores")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> obtenerTodos() {
        return ResponseEntity.ok(proveedorService.obtenerTodos());
    }
    
    /**
     * Obtiene solo los proveedores activos.
     *
     * @return lista de proveedores activos
     */
    @GetMapping("/activos")
    @Operation(summary = "Obtener proveedores activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CAJERO', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> obtenerActivos() {
        return ResponseEntity.ok(proveedorService.obtenerActivos());
    }
    
    /**
     * Obtiene un proveedor por su identificador.
     *
     * @param id identificador del proveedor
     * @return proveedor encontrado
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener proveedor por ID")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.obtenerPorId(id));
    }
    
    /**
     * Busca proveedores por nombre.
     *
     * @param nombre texto a buscar en el nombre
     * @return proveedores que coinciden
     */
    @GetMapping("/buscar")
    @Operation(summary = "Buscar proveedores por nombre")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<ProveedorDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(proveedorService.buscarPorNombre(nombre));
    }
    
    /**
     * Crea un proveedor nuevo.
     *
     * @param dto datos del proveedor
     * @return proveedor creado con estado 201
     */
    @PostMapping
    @Operation(summary = "Crear nuevo proveedor")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> crear(@Valid @RequestBody ProveedorDTO dto) {
        ProveedorDTO creado = proveedorService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    /**
     * Actualiza un proveedor existente.
     *
     * @param id identificador del proveedor
     * @param dto datos a actualizar
     * @return proveedor actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proveedor")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ProveedorDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorDTO dto) {
        return ResponseEntity.ok(proveedorService.actualizar(id, dto));
    }
    
    /**
     * Elimina un proveedor mediante borrado lógico.
     *
     * @param id identificador del proveedor
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor (soft delete)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
