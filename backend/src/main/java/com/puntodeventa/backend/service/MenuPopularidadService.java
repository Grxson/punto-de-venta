package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoPopularidadDTO;
import com.puntodeventa.backend.dto.MenuGrillaDTO;
import com.puntodeventa.backend.dto.aggregate.ProductoEstadisticasAggregate;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.VentaItemRepository;
import com.puntodeventa.backend.util.PopularityAlgorithm;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MenuPopularidadService {

    private final ProductoRepository productoRepository;
    private final VentaItemRepository ventaItemRepository;

    public MenuPopularidadService(
            ProductoRepository productoRepository,
            VentaItemRepository ventaItemRepository) {
        this.productoRepository = productoRepository;
        this.ventaItemRepository = ventaItemRepository;
    }

    /**
     * Obtiene el menú completo ordenado por popularidad.
     * Incluye distribución en grilla (grid layout).
     *
     * @param columnasGrid Número de columnas en la grilla (default: 3)
     * @param diasAnalizar Número de días para calcular popularidad (default: 7)
     * @param porCategoria Si se distribuye por categoría o todo junto
     * @return MenuGrillaDTO con productos ordenados y posiciones en grilla
     */
    @Cacheable(value = "menuPopularidad", unless = "#result == null")
    @Transactional(readOnly = true)
    public MenuGrillaDTO obtenerMenuOrdenado(int columnasGrid, int diasAnalizar, boolean porCategoria) {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime desde = ahora.minusDays(diasAnalizar);
        LocalDateTime desdeAntiguo = desde.minusDays(diasAnalizar);

        // Obtener solo productos base activos y disponibles en menú
        List<Producto> productosBase = productoRepository.findByProductoBaseIdIsNull().stream()
                .filter(Producto::getActivo)
                .filter(Producto::getDisponibleEnMenu)
                .toList();

        // OPTIMIZACIÓN: Obtener todas las estadísticas en batch (2 queries en lugar de N*2)
        List<ProductoEstadisticasAggregate> statsRecientes = ventaItemRepository.obtenerTodosLosEstadisticasEnPeriodo(desde);
        Map<Long, ProductoEstadisticasAggregate> mapaReciente = statsRecientes.stream()
                .collect(Collectors.toMap(ProductoEstadisticasAggregate::productoId, stat -> stat));

        List<ProductoEstadisticasAggregate> statsAntiguas = ventaItemRepository.obtenerTodosLosEstadisticasEnPeriodo(desdeAntiguo);
        Map<Long, ProductoEstadisticasAggregate> mapaAntiguo = statsAntiguas.stream()
                .collect(Collectors.toMap(ProductoEstadisticasAggregate::productoId, stat -> stat));

        // Convertir a DTOs con información de popularidad
        List<ProductoPopularidadDTO> productosConPopularidad = productosBase.stream()
                .map(p -> calcularPopularidadDesdeMapas(p, mapaReciente, mapaAntiguo))
                .collect(Collectors.toList());

        // Ordenar por popularidad
        List<ProductoPopularidadDTO> productosOrdenados =
                PopularityAlgorithm.ordenarPorPopularidad(productosConPopularidad);

        // Distribuir en grilla
        Map<Long, ?> posiciones;
        if (porCategoria) {
            // Por categoría: Map<String, Map<Long, GridPosition>>
            posiciones = (Map<Long, ?>) (Object) PopularityAlgorithm.distribuirPorCategoria(productosOrdenados, columnasGrid);
        } else {
            // Simple: Map<Long, GridPosition>
            posiciones = (Map<Long, ?>) (Object) PopularityAlgorithm.distribuirEnGrid(productosOrdenados, columnasGrid);
        }

        return new MenuGrillaDTO(
                columnasGrid,
                posiciones,
                productosOrdenados,
                LocalDateTime.now().toString()
        );
    }    /**
     * Calcula popularidad usando mapas de estadísticas previamente obtenidas en batch (optimización).
     */
    private ProductoPopularidadDTO calcularPopularidadDesdeMapas(
            Producto producto,
            Map<Long, ProductoEstadisticasAggregate> mapaReciente,
            Map<Long, ProductoEstadisticasAggregate> mapaAntiguo) {

        // Obtener stats del mapa, o defaults si no existe
        ProductoEstadisticasAggregate statsReciente = mapaReciente.get(producto.getId());
        ProductoEstadisticasAggregate statsAntiguo = mapaAntiguo.get(producto.getId());

        long frecuencia = statsReciente != null ? statsReciente.frecuencia() : 0;
        long cantidad = statsReciente != null ? statsReciente.cantidad() : 0;
        java.math.BigDecimal ingreso = statsReciente != null ? statsReciente.ingreso() : java.math.BigDecimal.ZERO;
        java.time.LocalDateTime ultimaVenta = statsReciente != null ? statsReciente.ultimaVenta() : null;

        long cantidadAntigua = statsAntiguo != null ? statsAntiguo.cantidad() : 0;
        double tendencia = PopularityAlgorithm.calcularTendencia(cantidad, cantidadAntigua);

        java.math.BigDecimal score = PopularityAlgorithm.calcularScore(
            producto.getId(),
            frecuencia,
            cantidad,
            ingreso,
            ultimaVenta,
            tendencia
        );

        String categoriaNombre = producto.getCategoria() != null
            ? producto.getCategoria().getNombre()
            : "Sin Categoría";

        return new ProductoPopularidadDTO(
            producto.getId(),
            producto.getNombre(),
            categoriaNombre,
            producto.getPrecio(),
            producto.getDescripcion(),
            frecuencia,
            cantidad,
            ingreso,
            ultimaVenta,
            score
        );
    }

    /**
     * Obtiene el top N productos por popularidad.
     *
     * @param limite Número máximo de productos
     * @param diasAnalizar Días para análisis
     * @return Lista ordenada de productos populares
     */
    public List<ProductoPopularidadDTO> obtenerTopProductos(int limite, int diasAnalizar) {
        MenuGrillaDTO menu = obtenerMenuOrdenado(3, diasAnalizar, false);
        return menu.productos().stream()
                .limit(limite)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la distribución completa del menú (para UI/UX).
     * Retorna la estructura de grilla con posiciones x,y.
     *
     * @param columnasGrid Columnas en la grilla
     * @param diasAnalizar Días para análisis
     * @return Estructura de grilla con posiciones
     */
    public MenuGrillaDTO obtenerDistribucionGrilla(int columnasGrid, int diasAnalizar) {
        return obtenerMenuOrdenado(columnasGrid, diasAnalizar, false);
    }

    /**
     * Obtiene la distribución del menú agrupado por categoría.
     * Cada categoría tiene su propia grilla.
     *
     * @param columnasGrid Columnas por categoría
     * @param diasAnalizar Días para análisis
     * @return Estructura de grilla por categoría
     */
    public MenuGrillaDTO obtenerDistribucionPorCategoria(int columnasGrid, int diasAnalizar) {
        return obtenerMenuOrdenado(columnasGrid, diasAnalizar, true);
    }
}
