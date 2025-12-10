package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para ProductoVarianteTamaño
 * Representa la relación entre un producto/variante y un tamaño disponible
 */
public record ProductoVarianteTamañoDTO(
    Long id,
    Long productoId,
    String productoNombre,
    Long tamañoId,
    String tamañoNombre,
    BigDecimal precioExtra,
    Integer orden
) {
}
