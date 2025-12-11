package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para ProductoVarianteTamano
 * Representa la relación entre un producto/variante y un tamaño disponible
 */
public record ProductoVarianteTamanoDTO(
    Long id,
    Long productoId,
    String productoNombre,
    Long tamañoId,
    String tamañoNombre,
    BigDecimal precioExtra,
    Integer orden
) {
}
