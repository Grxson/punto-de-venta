package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;

/**
 * Proyección agregada para resumen de ventas (rango).
 */
public record ResumenVentasAggregate(
        BigDecimal totalVentas,
        BigDecimal subtotalVentas,
        Long cantidadVentas,
        Long itemsVendidos,
        BigDecimal totalCostos
) {}
