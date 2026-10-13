package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CategoriaProductoDTO;
import com.puntodeventa.backend.service.CategoriaProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador REST de categorías de productos del menú.
 *
 * Expone el CRUD de categorías; la eliminación es permanente.
 */
@Slf4j
@RestController
@RequestMapping("/api/inventario/categorias-productos")
@Tag(name = "Inventario - Categorías de Productos", description = "Endpoints para gestión de categorías de productos del menú")
public class CategoriaProductoController {

    private final CategoriaProductoService categoriaService;

    /**
     * Crea el controlador con el servicio de categorías de productos.
     *
     * @param categoriaService servicio de categorías de productos
     */
    public CategoriaProductoController(CategoriaProductoService categoriaService) {
        this.categoriaService = categoriaService;
    }

    /**
     * Lista las categorías de productos con filtros opcionales.
     *
     * @param activa filtra por estado activo cuando está presente
     * @param query búsqueda por nombre, opcional
     * @return lista de categorías que cumplen los filtros
     */
    @GetMapping
    @Operation(summary = "Listar categorías", description = "Permite filtrar por activa y búsqueda por nombre (q)")
    public ResponseEntity<List<CategoriaProductoDTO>> listar(
            @RequestParam Optional<Boolean> activa,
            @RequestParam(name = "q") Optional<String> query) {
        return ResponseEntity.ok(categoriaService.listar(activa, query));
    }

    /**
     * Obtiene una categoría de producto por su identificador.
     *
     * @param id identificador de la categoría
     * @return categoría encontrada
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    public ResponseEntity<CategoriaProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obtener(id));
    }

    /**
     * Crea una categoría de producto nueva.
     *
     * @param dto datos de la categoría
     * @return categoría creada con estado 201
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Crear categoría")
    public ResponseEntity<CategoriaProductoDTO> crear(@Validated @RequestBody CategoriaProductoDTO dto) {
        CategoriaProductoDTO creada = categoriaService.crear(dto);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    /**
     * Actualiza una categoría de producto existente.
     *
     * @param id identificador de la categoría
     * @param dto datos a actualizar
     * @return categoría actualizada
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Actualizar categoría")
    public ResponseEntity<CategoriaProductoDTO> actualizar(@PathVariable Long id,
            @Validated @RequestBody CategoriaProductoDTO dto) {
        return ResponseEntity.ok(categoriaService.actualizar(id, dto));
    }

    /**
     * Elimina permanentemente una categoría de producto.
     *
     * @param id identificador de la categoría
     * @return sin contenido
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    @Operation(summary = "Eliminar categoría", description = "Elimina permanentemente la categoría de la base de datos")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.debug("DELETE: /api/inventario/categorias-productos/{}", id);
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
