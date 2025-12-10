package com.puntodeventa.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.puntodeventa.backend.dto.InventarioMovimientoReporteDTO;
import com.puntodeventa.backend.dto.InventarioMovimientoReporteDTO.DiaMovimientoDTO;
import com.puntodeventa.backend.dto.InventarioMovimientoReporteDTO.ProductoInventarioDTO;
import com.puntodeventa.backend.model.Venta;
import com.puntodeventa.backend.model.VentaItem;
import com.puntodeventa.backend.repository.VentaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para generación de reportes de movimiento de inventario.
 * Optimizado para respuestas rápidas con queries eficientes y caché.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventarioMovimientoReporteService {

    private final VentaRepository ventaRepository;

    /**
     * Obtiene el reporte de movimiento de inventario por producto.
     * Incluye todos los días en el rango especificado (no solo días con operación).
     *
     * @param sucursalId ID de la sucursal
     * @param fechaInicio Inicio del rango (LocalDateTime)
     * @param fechaFin Fin del rango (LocalDateTime)
     * @return Reporte con estructura dinámica basada en el rango solicitado
     */
    @Cacheable(
        value = "reportes_inventario_movimiento",
        key = "#sucursalId + '_' + #fechaInicio.toLocalDate() + '_' + #fechaFin.toLocalDate()",
        unless = "#result.diasOperacion().isEmpty()"
    )
    public InventarioMovimientoReporteDTO obtenerReporte(
            Long sucursalId,
            LocalDateTime fechaInicio,
            LocalDateTime fechaFin) {

        log.info("Generando reporte inventario para sucursal {} entre {} y {}", 
            sucursalId, fechaInicio.toLocalDate(), fechaFin.toLocalDate());

        long inicio = System.currentTimeMillis();

        // 1. Obtener todas las ventas en el rango (un solo query optimizado)
        List<Venta> ventas = ventaRepository.findBySucursalIdAndFechaBetween(
            sucursalId, fechaInicio, fechaFin
        );

        // 2. Generar lista de todos los días en el rango (no solo con ventas)
        var diasOperacion = generarDiasDelRango(fechaInicio.toLocalDate(), fechaFin.toLocalDate());

        // 3. Agrupar datos por producto y día (procesamiento de una sola pasada)
        var productoMap = construirMapaProductos(ventas, diasOperacion);

        // 4. Convertir a DTOs
        var productos = productoMap.values()
            .stream()
            .sorted(Comparator.comparing(ProductoInventarioDTO::nombre))
            .toList();

        long duracion = System.currentTimeMillis() - inicio;
        log.info("Reporte generado en {}ms con {} productos y {} días", 
            duracion, productos.size(), diasOperacion.size());
        log.info("Dias generados: {}", diasOperacion);

        return new InventarioMovimientoReporteDTO(diasOperacion, productos);
    }

    /**
     * Genera una lista de todos los días dentro del rango especificado.
     * Útil para mostrar todas las columnas de fecha en la tabla.
     */
    private List<LocalDate> generarDiasDelRango(LocalDate inicio, LocalDate fin) {
        List<LocalDate> dias = new ArrayList<>();
        LocalDate actual = inicio;
        while (!actual.isAfter(fin)) {
            dias.add(actual);
            actual = actual.plusDays(1);
        }
        return dias;
    }

    /**
     * Detecta automáticamente qué días tuvieron operación.
     * Evita mostrar columnas vacías.
     */
    private List<LocalDate> detectarDiasActivos(List<Venta> ventas) {
        return ventas.stream()
            .map(venta -> venta.getFecha().toLocalDate())
            .distinct()
            .sorted()
            .toList();
    }

    /**
     * Construye el mapa de productos con sus movimientos diarios.
     * Una sola pasada por los datos para máxima eficiencia.
     */
    private Map<Long, ProductoInventarioDTO> construirMapaProductos(
            List<Venta> ventas,
            List<LocalDate> diasOperacion) {

        var productoMap = new HashMap<Long, ProductoInventarioDTO>();
        var totalesPorProducto = new HashMap<Long, TotalProductoTemp>();

        // Procesar todas las ventas en una sola pasada
        for (Venta venta : ventas) {
            LocalDate dia = venta.getFecha().toLocalDate();

            for (VentaItem item : venta.getItems()) {
                Long productoId = item.getProducto().getId();
                String productoNombre = item.getProductoNombre();

                // Obtener o crear mapa de datos del producto
                var datosProducto = productoMap
                    .computeIfAbsent(productoId, k -> {
                        var datosMap = new HashMap<LocalDate, DiaMovimientoDTO>();
                        // Inicializar días vacíos
                        for (LocalDate d : diasOperacion) {
                            datosMap.put(d, new DiaMovimientoDTO(
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO
                            ));
                        }
                        return new ProductoInventarioDTO(
                            productoId,
                            productoNombre,
                            datosMap,
                            new DiaMovimientoDTO(
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO,
                                BigDecimal.ZERO
                            )
                        );
                    })
                    .datos();

                // Actualizar datos del día
                DiaMovimientoDTO diaActual = datosProducto.get(dia);
                if (diaActual != null) {
                    // Reconstruir con valores actualizados
                    var nuevoMovimiento = new DiaMovimientoDTO(
                        diaActual.inicio(),
                        diaActual.compra(),
                        diaActual.venta().add(item.getSubtotal()),
                        diaActual.merma(),
                        diaActual.queda()
                    );
                    datosProducto.put(dia, nuevoMovimiento);
                }

                // Acumular totales
                totalesPorProducto.computeIfAbsent(productoId, k -> 
                    new TotalProductoTemp()).addVenta(item.getSubtotal());
            }
        }

        // Actualizar totales en cada producto
        for (var entry : productoMap.entrySet()) {
            TotalProductoTemp total = totalesPorProducto.get(entry.getKey());
            if (total != null) {
                var nuevoProducto = new ProductoInventarioDTO(
                    entry.getValue().id(),
                    entry.getValue().nombre(),
                    entry.getValue().datos(),
                    new DiaMovimientoDTO(
                        BigDecimal.ZERO,
                        total.compra,
                        total.venta,
                        total.merma,
                        total.queda
                    )
                );
                productoMap.put(entry.getKey(), nuevoProducto);
            }
        }

        return productoMap;
    }

    /**
     * Clase temporal para acumular totales de productos.
     */
    private static class TotalProductoTemp {
        BigDecimal compra = BigDecimal.ZERO;
        BigDecimal venta = BigDecimal.ZERO;
        BigDecimal merma = BigDecimal.ZERO;
        BigDecimal queda = BigDecimal.ZERO;

        void addVenta(BigDecimal monto) {
            this.venta = this.venta.add(monto);
        }
    }
}
