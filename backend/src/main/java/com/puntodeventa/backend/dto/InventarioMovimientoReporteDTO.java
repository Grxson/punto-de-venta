package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Reporte de movimientos de inventario por producto.
 *
 * <p>Es el response del endpoint de reportes de inventario: entrega una estructura dinámica
 * que solo incluye los días con operación, en lugar de un rango completo de fechas.
 *
 * @param diasOperacion días del periodo que tuvieron algún movimiento
 * @param productos productos incluidos en el reporte, cada uno con su detalle diario
 */
public record InventarioMovimientoReporteDTO(
    List<LocalDate> diasOperacion,
    List<ProductoInventarioDTO> productos
) {
    
    /**
     * Información de un producto con sus movimientos diarios.
     *
     * @param id identificador del producto
     * @param nombre nombre del producto
     * @param datos movimientos del producto por día
     * @param totales totales consolidados del producto en el periodo
     */
    public record ProductoInventarioDTO(
        Long id,
        String nombre,
        Map<LocalDate, DiaMovimientoDTO> datos,
        DiaMovimientoDTO totales
    ) {}
    
    /**
     * Movimientos de un producto en un día específico.
     *
     * @param inicio stock con el que se abrió el día
     * @param compra cantidad ingresada por compras del día
     * @param venta cantidad consumida por ventas del día
     * @param merma cantidad perdida por mermas del día
     * @param queda stock con el que cerró el día
     */
    public record DiaMovimientoDTO(
        BigDecimal inicio,
        BigDecimal compra,
        BigDecimal venta,
        BigDecimal merma,
        BigDecimal queda
    ) {}
}
