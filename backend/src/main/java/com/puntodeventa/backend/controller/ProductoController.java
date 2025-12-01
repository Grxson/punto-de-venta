package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventario/productos")
@Tag(name = "Inventario - Productos", description = "Endpoints para gestión de productos del menú")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    @Operation(summary = "Listar productos", description = "Permite filtrar por activo, en menú, categoría y búsqueda por nombre")
    public ResponseEntity<List<ProductoDTO>> listar(
            @RequestParam Optional<Boolean> activo,
            @RequestParam(name = "enMenu") Optional<Boolean> enMenu,
            @RequestParam Optional<Long> categoriaId,
            @RequestParam(name = "q") Optional<String> query) {
        return ResponseEntity.ok(productoService.listar(activo, enMenu, categoriaId, query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }

    @GetMapping("/{id}/variantes")
    @Operation(summary = "Obtener variantes de un producto")
    public ResponseEntity<List<ProductoDTO>> obtenerVariantes(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerVariantes(id));
    }

    @PostMapping("/{id}/variantes")
    @Operation(summary = "Agregar variante a un producto base")
    public ResponseEntity<ProductoDTO> crearVariante(@PathVariable Long id, @Validated @RequestBody ProductoDTO dto) {
        ProductoDTO variante = productoService.crearVariante(id, dto);
        return new ResponseEntity<>(variante, HttpStatus.CREATED);
    }

    @PostMapping
    @Operation(summary = "Crear producto")
    public ResponseEntity<ProductoDTO> crear(@Validated @RequestBody ProductoDTO dto) {
        ProductoDTO creado = productoService.crear(dto);
        return new ResponseEntity<>(creado, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Long id, @Validated @RequestBody ProductoDTO dto) {
        return ResponseEntity.ok(productoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar/Desactivar producto")
    public ResponseEntity<ProductoDTO> cambiarEstado(@PathVariable Long id, @RequestParam boolean activo) {
        return ResponseEntity.ok(productoService.cambiarEstado(id, activo));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto", description = "Borrado lógico: marca el producto como inactivo")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanente")
    @Operation(summary = "Eliminar producto definitivamente", description = "Elimina el producto permanentemente de la base de datos")
    public ResponseEntity<Void> eliminarPermanentemente(@PathVariable Long id) {
        productoService.eliminarPermanentemente(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        // Retornar BAD_REQUEST (400) para errores de validación de negocio
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
