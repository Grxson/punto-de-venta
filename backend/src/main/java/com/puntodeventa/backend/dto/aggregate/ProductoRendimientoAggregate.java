package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;

/**
 * Proyección agregada para rendimiento de productos.
 */
public record ProductoRendimientoAggregate(
        Long productoId,
        String nombreProducto,
        BigDecimal precio,
        BigDecimal costoEstimado,
        Long unidadesVendidas,
        BigDecimal ingresoTotal,
        BigDecimal costoTotal
) {}
