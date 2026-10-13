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
 * Controlador REST de gastos indirectos.
 *
 * Gestiona los gastos indirectos de la sucursal actual: consulta, alta,
 * actualización y baja lógica.
 */
@Slf4j
@RestController
@RequestMapping("/api/gastos-indirectos")
@RequiredArgsConstructor
@Tag(name = "Gastos Indirectos", description = "Endpoints para gestión de gastos indirectos")
@PreAuthorize("isAuthenticated()")
public class GastoIndirectoController {

    private final GastoIndirectoService gastoIndirectoService;

    /**
     * Obtiene todos los gastos indirectos de la sucursal actual.
     *
     * @return lista de gastos indirectos
     */
    @GetMapping
    @Operation(summary = "Obtener todos los gastos indirectos de la sucursal actual")
    public ResponseEntity<List<GastoIndirectoDTO>> obtenerTodos() {
        log.info("Obteniendo todos los gastos indirectos");
        return ResponseEntity.ok(gastoIndirectoService.obtenerPorSucursal());
    }

    /**
     * Obtiene los gastos indirectos activos.
     *
     * @return lista de gastos indirectos activos
     */
    @GetMapping("/activos")
    @Operation(summary = "Obtener gastos indirectos activos")
    public ResponseEntity<List<GastoIndirectoDTO>> obtenerActivos() {
        log.info("Obteniendo gastos indirectos activos");
        return ResponseEntity.ok(gastoIndirectoService.obtenerActivos());
    }

    /**
     * Obtiene un gasto indirecto por su identificador.
     *
     * @param id identificador del gasto indirecto
     * @return gasto indirecto encontrado
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener un gasto indirecto por ID")
    public ResponseEntity<GastoIndirectoDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo gasto indirecto: {}", id);
        return ResponseEntity.ok(gastoIndirectoService.obtenerPorId(id));
    }

    /**
     * Crea un gasto indirecto nuevo.
     *
     * @param dto datos del gasto indirecto
     * @return gasto indirecto creado
     */
    @PostMapping
    @Operation(summary = "Crear un nuevo gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<GastoIndirectoDTO> crear(@RequestBody GastoIndirectoDTO dto) {
        log.info("Creando gasto indirecto: {}", dto.getNombre());
        try {
            GastoIndirectoDTO resultado = gastoIndirectoService.crear(dto);
            log.info("Gasto indirecto creado exitosamente: {}", resultado.getId());
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            log.warn("Validación fallida: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al crear gasto indirecto", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Actualiza un gasto indirecto existente.
     *
     * @param id identificador del gasto indirecto
     * @param dto datos a actualizar
     * @return gasto indirecto actualizado
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<GastoIndirectoDTO> actualizar(@PathVariable Long id, @RequestBody GastoIndirectoDTO dto) {
        log.info("Actualizando gasto indirecto: {}", id);
        return ResponseEntity.ok(gastoIndirectoService.actualizar(id, dto));
    }

    /**
     * Desactiva un gasto indirecto.
     *
     * @param id identificador del gasto indirecto
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar (desactivar) un gasto indirecto")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Desactivando gasto indirecto: {}", id);
        gastoIndirectoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
