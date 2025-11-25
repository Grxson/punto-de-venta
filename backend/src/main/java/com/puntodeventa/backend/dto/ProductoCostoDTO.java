package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para exponer información de costo y margen de un producto.
 */
public record ProductoCostoDTO(
        Long id,
        String nombre,
        BigDecimal costoEstimado,
        BigDecimal precio,
        BigDecimal margenAbsoluto,
        BigDecimal margenPorcentaje,
        boolean tieneReceta
) {}
