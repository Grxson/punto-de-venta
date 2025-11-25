package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.dto.ProductoCostoDTO;
import com.puntodeventa.backend.dto.ProductoCostoHistoricoPageDTO;
import com.puntodeventa.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
            @RequestParam(name = "q") Optional<String> query
    ) {
        return ResponseEntity.ok(productoService.listar(activo, enMenu, categoriaId, query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID", description = "Si es un producto base, incluye su lista de variantes")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        ProductoDTO producto = productoService.obtener(id);
        // Si es un producto base, cargar variantes
        if (producto.productoBaseId() == null) {
            List<ProductoDTO> variantes = productoService.obtenerVariantes(id);
            producto = new ProductoDTO(
                    producto.id(),
                    producto.nombre(),
                    producto.descripcion(),
                    producto.categoriaId(),
                    producto.categoriaNombre(),
                    producto.precio(),
                    producto.costoEstimado(),
                    producto.sku(),
                    producto.activo(),
                    producto.disponibleEnMenu(),
                    producto.productoBaseId(),
                    producto.nombreVariante(),
                    producto.ordenVariante(),
                    variantes
            );
        }
        return ResponseEntity.ok(producto);
    }
    
    @GetMapping("/{id}/variantes")
    @Operation(summary = "Obtener variantes de un producto base")
    public ResponseEntity<List<ProductoDTO>> obtenerVariantes(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerVariantes(id));
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

    /* ===================== COSTEO ===================== */

    @GetMapping("/{id}/costo")
    @Operation(summary = "Obtener costo y margen del producto", description = "Incluye costoEstimado, margen absoluto y porcentaje. Si no hay receta, costoEstimado = null.")
    public ResponseEntity<ProductoCostoDTO> obtenerCosto(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerCosto(id));
    }

    @PostMapping("/{id}/recalcular-costo")
    @Operation(summary = "Recalcular costo del producto desde su receta", description = "Recalcula costoEstimado en base a ingredientes y merma. Devuelve nuevo margen.")
    public ResponseEntity<ProductoCostoDTO> recalcularCosto(@PathVariable Long id) {
        return new ResponseEntity<>(productoService.recalcularCosto(id), HttpStatus.OK);
    }

    @PostMapping("/recalcular-costos")
    @Operation(summary = "Recalcular costos de todos los productos", description = "Procesa cada producto y actualiza su costoEstimado si tiene receta.")
    public ResponseEntity<List<ProductoCostoDTO>> recalcularCostosMasivo() {
        return ResponseEntity.ok(productoService.recalcularCostosMasivo());
    }

    @GetMapping("/{id}/costos/historico")
    @Operation(summary = "Histórico de costos del producto", description = "Devuelve snapshots históricos del costo y margen ordenados desc por fecha de cálculo.")
    public ResponseEntity<ProductoCostoHistoricoPageDTO> historialCostos(@PathVariable Long id,
                                                                        @RequestParam(defaultValue = "0") int pagina,
                                                                        @RequestParam(defaultValue = "50") int tamano) {
        return ResponseEntity.ok(productoService.historialCostos(id, pagina, tamano));
    }
}
