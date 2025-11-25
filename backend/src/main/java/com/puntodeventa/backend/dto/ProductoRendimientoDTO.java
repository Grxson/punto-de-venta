package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para métricas de rendimiento de un producto dentro de un periodo.
 */
public record ProductoRendimientoDTO(
        Long productoId,
        String nombre,
        BigDecimal precio,
        BigDecimal costoEstimado,
        BigDecimal margenUnitario,
        BigDecimal margenPorcentaje,
        long unidadesVendidas,
        BigDecimal ingresoTotal,
        BigDecimal costoTotal,
        BigDecimal margenBrutoTotal
) {}
