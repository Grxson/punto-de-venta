package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Costo y margen calculados de un producto.
 *
 * <p>Es el response del endpoint de consulta de costos: expone el costo estimado, el
 * precio de venta y los márgenes resultantes.
 *
 * @param id identificador del producto
 * @param nombre nombre del producto
 * @param costoEstimado costo calculado a partir de la receta y los insumos
 * @param precio precio de venta vigente
 * @param margenAbsoluto diferencia entre precio y costo
 * @param margenPorcentaje margen expresado como porcentaje del precio
 * @param tieneReceta si el producto cuenta con receta definida para calcular su costo
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
