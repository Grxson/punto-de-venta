package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Relación entre un producto o variante y un tamaño disponible.
 *
 * <p>Se envía como request al asociar tamaños a un producto y se devuelve como response en
 * las consultas de la configuración del menú.
 *
 * @param id identificador de la relación; {@code null} al crearla
 * @param productoId producto o variante asociada
 * @param productoNombre nombre de ese producto (solo lectura)
 * @param tamañoId tamaño asociado
 * @param tamañoNombre nombre de ese tamaño (solo lectura)
 * @param precioExtra importe adicional del tamaño para este producto
 * @param orden posición del tamaño dentro del producto
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
