package com.puntodeventa.backend.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO que contiene el menú con productos distribuidos en grilla.
 */
public record MenuGrillaDTO(
        int columnasGrid,
        Map<Long, ?> posiciones,      // {producto_id -> {row, col}} o {categoria -> posiciones}
        List<ProductoPopularidadDTO> productos,
        String timestamp
) {
}
