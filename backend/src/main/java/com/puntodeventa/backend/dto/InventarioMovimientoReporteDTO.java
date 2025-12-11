package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO optimizado para reporte de movimiento de inventario por producto.
 * Estructura dinámica que solo incluye días con operación.
 */
public record InventarioMovimientoReporteDTO(
    List<LocalDate> diasOperacion,
    List<ProductoInventarioDTO> productos
) {
    
    /**
     * Información de un producto con sus movimientos diarios.
     */
    public record ProductoInventarioDTO(
        Long id,
        String nombre,
        Map<LocalDate, DiaMovimientoDTO> datos,
        DiaMovimientoDTO totales
    ) {}
    
    /**
     * Movimientos de un producto en un día específico.
     */
    public record DiaMovimientoDTO(
        BigDecimal inicio,
        BigDecimal compra,
        BigDecimal venta,
        BigDecimal merma,
        BigDecimal queda
    ) {}
}
