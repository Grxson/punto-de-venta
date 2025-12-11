package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * OPTIMIZACIÓN PASO 1.2: ProductoController con Paginación
 * 
 * Cambios implementados:
 * - Endpoint /listar ahora soporta paginación con page/size
 * - Validación: size máximo 200 para evitar respuestas gigantes
 * - Default: 50 productos por página
 * - Impacto esperado: 70% de reducción en tamaño de respuesta
 */
@RestController
@RequestMapping("/api/inventario/productos")
@Tag(name = "Inventario - Productos", description = "Endpoints para gestión de productos del menú")
public class ProductoController {

    private final ProductoService productoService;

    // Constantes de paginación
    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 200;
    private static final int MIN_PAGE_SIZE = 1;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    /**
     * MEJORADO: Listar productos con paginación
     * 
     * Parámetros:
     * - page: Número de página (0-indexed, default 0)
     * - size: Elementos por página (default 50, máximo 200)
     * - activo: Filtro por estado
     * - enMenu: Filtro por disponibilidad en menú
     * - categoriaId: Filtro por categoría
     * - q: Búsqueda por nombre
     * 
     * Respuesta: Page<ProductoDTO> con metadatos de paginación
     */
    @GetMapping("/listar")
    @Operation(
        summary = "Listar productos con paginación",
        description = "Retorna una página de productos con filtros opcionales. Default: 50 por página, máximo 200"
    )
    public ResponseEntity<Page<ProductoDTO>> listarPaginado(
            @Parameter(description = "Número de página (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            
            @Parameter(description = "Elementos por página (máximo 200)", example = "50")
            @RequestParam(defaultValue = "50") int size,
            
            @Parameter(description = "Filtro por estado (true/false)", example = "true")
            @RequestParam Optional<Boolean> activo,
            
            @Parameter(description = "Filtro por disponibilidad en menú (true/false)")
            @RequestParam(name = "enMenu") Optional<Boolean> enMenu,
            
            @Parameter(description = "Filtro por categoría ID")
            @RequestParam Optional<Long> categoriaId,
            
            @Parameter(description = "Búsqueda por nombre del producto")
            @RequestParam(name = "q") Optional<String> query) {
        
        // Validar y sanitizar parámetros de paginación
        if (size < MIN_PAGE_SIZE) {
            size = MIN_PAGE_SIZE;
        }
        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }
        if (page < 0) {
            page = 0;
        }

        // Crear Pageable con sort por nombre
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "nombre"));

        // Obtener página de productos
        Page<ProductoDTO> resultado = productoService.listarPaginado(
            pageable, activo, enMenu, categoriaId, query
        );

        return ResponseEntity.ok(resultado);
    }

    /**
     * MANTIENE COMPATIBILIDAD: Listar todos sin paginación (deprecado)
     * Para clientes legacy que no usan paginación
     * Retorna máximo 5000 productos
     */
    @GetMapping
    @Deprecated(since = "2.0", forRemoval = true)
    @Operation(
        summary = "Listar productos (deprecado)",
        description = "Usar /listar con paginación en su lugar. Retorna máximo 5000 productos"
    )
    public ResponseEntity<List<ProductoDTO>> listar(
            @RequestParam Optional<Boolean> activo,
            @RequestParam(name = "enMenu") Optional<Boolean> enMenu,
            @RequestParam Optional<Long> categoriaId,
            @RequestParam(name = "q") Optional<String> query) {
        
        // Usar paginación internal con límite de 5000
        Pageable pageable = PageRequest.of(0, 5000);
        Page<ProductoDTO> page = productoService.listarPaginado(pageable, activo, enMenu, categoriaId, query);
        return ResponseEntity.ok(page.getContent());
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
    @Operation(summary = "Eliminar producto permanentemente", 
               description = "Hard delete: elimina el producto de la base de datos. Solo si no tiene variantes, ventas o recetas. Requiere permiso ADMIN")
    public ResponseEntity<Void> eliminarDefinitivamente(@PathVariable Long id) {
        productoService.eliminarDefinitivamente(id);
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
