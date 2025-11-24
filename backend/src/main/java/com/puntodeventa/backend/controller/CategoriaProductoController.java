package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CategoriaProductoDTO;
import com.puntodeventa.backend.service.CategoriaProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventario/categorias-productos")
@Tag(name = "Inventario - Categorías de Productos", description = "Endpoints para gestión de categorías de productos del menú")
public class CategoriaProductoController {

    private final CategoriaProductoService categoriaService;

    public CategoriaProductoController(CategoriaProductoService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Permite filtrar por activa y búsqueda por nombre (q)")
    public ResponseEntity<List<CategoriaProductoDTO>> listar(
            @RequestParam Optional<Boolean> activa,
            @RequestParam(name = "q") Optional<String> query
    ) {
        return ResponseEntity.ok(categoriaService.listar(activa, query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener categoría por ID")
    public ResponseEntity<CategoriaProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obtener(id));
    }

    @PostMapping
    @Operation(summary = "Crear categoría")
    public ResponseEntity<CategoriaProductoDTO> crear(@Validated @RequestBody CategoriaProductoDTO dto) {
        CategoriaProductoDTO creada = categoriaService.crear(dto);
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar categoría")
    public ResponseEntity<CategoriaProductoDTO> actualizar(@PathVariable Long id, @Validated @RequestBody CategoriaProductoDTO dto) {
        return ResponseEntity.ok(categoriaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar categoría", description = "Borrado lógico: marca la categoría como inactiva")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
