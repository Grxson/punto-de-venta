package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO que expone un producto con su información de popularidad.
 * Usado para menús dinámicos que se ordenan por popularidad.
 */
public record ProductoPopularidadDTO(
        Long id,
        String nombre,
        String categoriaNombre,
        BigDecimal precio,
        String descripcion,
        long frecuenciaVenta,           // Veces que se vendió
        long cantidadVendida,           // Cantidad total vendida
        BigDecimal ingresoTotal,        // Dinero generado
        LocalDateTime ultimaVenta,      // Cuándo fue la última venta
        BigDecimal scorePopularidad     // Score normalizado 0-100
) {
}
