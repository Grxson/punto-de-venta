package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

public record ProductoDTO(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precio,
        BigDecimal costoEstimado,
        String sku,
        Boolean activo,
        Boolean disponibleEnMenu
) {}
