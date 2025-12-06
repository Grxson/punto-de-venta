package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoPopularidadDTO;
import com.puntodeventa.backend.dto.MenuGrillaDTO;
import com.puntodeventa.backend.service.MenuPopularidadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para menús dinámicos ordenados por popularidad de productos.
 * 
 * Los productos se distribuyen en una grilla (grid) de izquierda a derecha,
 * arriba hacia abajo, ordenados por popularidad (ventas, frecuencia, ingresos, etc.)
 */
@RestController
@RequestMapping("/api/v1/menu")
@Tag(name = "Menú Dinámico", description = "Menús ordenados por popularidad de productos")
public class MenuPopularidadController {

    private final MenuPopularidadService menuPopularidadService;

    public MenuPopularidadController(MenuPopularidadService menuPopularidadService) {
        this.menuPopularidadService = menuPopularidadService;
    }

    /**
     * Obtiene el menú completo ordenado dinámicamente por popularidad.
     * Los productos se distribuyen en una grilla.
     *
     * @param columnasGrid Número de columnas en la grilla (default: 3)
     * @param diasAnalizar Días a considerar para calcular popularidad (default: 7)
     * @return MenuGrillaDTO con productos ordenados y posiciones
     */
    @GetMapping("/ordenado")
    @Operation(
            summary = "Obtener menú ordenado por popularidad",
            description = "Retorna el menú con productos distribuidos en grilla, ordenados por popularidad"
    )
    public ResponseEntity<MenuGrillaDTO> obtenerMenuOrdenado(
            @Parameter(description = "Columnas en la grilla", example = "3")
            @RequestParam(defaultValue = "3") int columnasGrid,
            @Parameter(description = "Días para análisis de popularidad", example = "7")
            @RequestParam(defaultValue = "7") int diasAnalizar) {

        MenuGrillaDTO menu = menuPopularidadService.obtenerMenuOrdenado(columnasGrid, diasAnalizar, false);
        return ResponseEntity.ok(menu);
    }

    /**
     * Obtiene el menú distribuido por categoría.
     * Cada categoría tiene su propia grilla con productos ordenados por popularidad.
     *
     * @param columnasGrid Columnas por categoría (default: 3)
     * @param diasAnalizar Días para análisis (default: 7)
     * @return MenuGrillaDTO con estructura de categorías
     */
    @GetMapping("/por-categoria")
    @Operation(
            summary = "Obtener menú ordenado por categoría y popularidad",
            description = "Retorna el menú agrupado por categorías, cada una con su propia grilla de productos"
    )
    public ResponseEntity<MenuGrillaDTO> obtenerMenuPorCategoria(
            @Parameter(description = "Columnas por categoría", example = "3")
            @RequestParam(defaultValue = "3") int columnasGrid,
            @Parameter(description = "Días para análisis", example = "7")
            @RequestParam(defaultValue = "7") int diasAnalizar) {

        MenuGrillaDTO menu = menuPopularidadService.obtenerDistribucionPorCategoria(columnasGrid, diasAnalizar);
        return ResponseEntity.ok(menu);
    }

    /**
     * Obtiene los N productos más populares.
     *
     * @param limite Número máximo de productos a retornar (default: 10)
     * @param diasAnalizar Días para análisis (default: 7)
     * @return Lista de productos ordenados por popularidad
     */
    @GetMapping("/top")
    @Operation(
            summary = "Obtener top N productos por popularidad",
            description = "Retorna los productos más populares ordenados descendente"
    )
    public ResponseEntity<List<ProductoPopularidadDTO>> obtenerTopProductos(
            @Parameter(description = "Número de productos", example = "10")
            @RequestParam(defaultValue = "10") int limite,
            @Parameter(description = "Días para análisis", example = "7")
            @RequestParam(defaultValue = "7") int diasAnalizar) {

        List<ProductoPopularidadDTO> top = menuPopularidadService.obtenerTopProductos(limite, diasAnalizar);
        return ResponseEntity.ok(top);
    }

    /**
     * Obtiene la distribución en grilla del menú (layout positions).
     * Útil para interfaces que necesitan conocer posiciones x,y de cada producto.
     *
     * @param columnasGrid Columnas (default: 3)
     * @param diasAnalizar Días para análisis (default: 7)
     * @return MenuGrillaDTO con información de posiciones
     */
    @GetMapping("/grilla")
    @Operation(
            summary = "Obtener distribución en grilla",
            description = "Retorna la estructura de grilla con posiciones (fila, columna) de cada producto"
    )
    public ResponseEntity<MenuGrillaDTO> obtenerDistribucionGrilla(
            @Parameter(description = "Columnas en grilla", example = "3")
            @RequestParam(defaultValue = "3") int columnasGrid,
            @Parameter(description = "Días para análisis", example = "7")
            @RequestParam(defaultValue = "7") int diasAnalizar) {

        MenuGrillaDTO grilla = menuPopularidadService.obtenerDistribucionGrilla(columnasGrid, diasAnalizar);
        return ResponseEntity.ok(grilla);
    }

    /**
     * Obtiene estadísticas de popularidad de todos los productos.
     * Información detallada para analytics y reportes.
     *
     * @param diasAnalizar Días para análisis (default: 7)
     * @return MenuGrillaDTO con todos los productos y sus scores
     */
    @GetMapping("/estadisticas")
    @Operation(
            summary = "Obtener estadísticas de popularidad",
            description = "Retorna datos detallados de popularidad para cada producto"
    )
    public ResponseEntity<MenuGrillaDTO> obtenerEstadisticas(
            @Parameter(description = "Días para análisis", example = "7")
            @RequestParam(defaultValue = "7") int diasAnalizar) {

        MenuGrillaDTO estadisticas = menuPopularidadService.obtenerMenuOrdenado(1, diasAnalizar, false);
        return ResponseEntity.ok(estadisticas);
    }
}
