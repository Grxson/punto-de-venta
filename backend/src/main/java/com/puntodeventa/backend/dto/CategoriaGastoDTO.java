package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para categorías de gastos.
 */
public record CategoriaGastoDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal presupuestoMensual,
        Boolean activo
) {}

