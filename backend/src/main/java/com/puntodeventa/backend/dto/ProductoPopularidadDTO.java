package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Producto con sus métricas de popularidad.
 *
 * <p>Es el response del endpoint que arma el menú dinámico: los productos se devuelven
 * ordenados por popularidad para destacar los más vendidos.
 *
 * @param id identificador del producto
 * @param nombre nombre visible del producto
 * @param categoriaNombre nombre de la categoría a la que pertenece
 * @param precio precio de venta
 * @param descripcion detalle del producto
 * @param frecuenciaVenta número de transacciones en las que se vendió
 * @param cantidadVendida cantidad total de unidades vendidas
 * @param ingresoTotal dinero generado por el producto
 * @param ultimaVenta momento de la última venta del producto
 * @param scorePopularidad puntuación normalizada de popularidad, en el rango 0-100
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
