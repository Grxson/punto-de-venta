package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Rendimiento de un producto dentro de un periodo consultado.
 *
 * <p>Es el response del endpoint de estadísticas que lista los productos con mejor
 * desempeño; cada elemento resume ventas, costos y margen del producto.
 *
 * @param productoId identificador del producto
 * @param nombre nombre del producto
 * @param precio precio de venta vigente
 * @param costoEstimado costo estimado por unidad
 * @param margenUnitario diferencia entre precio y costo por unidad
 * @param margenPorcentaje margen unitario expresado como porcentaje del precio
 * @param unidadesVendidas cantidad total de unidades vendidas en el periodo
 * @param ingresoTotal dinero ingresado por el producto en el periodo
 * @param costoTotal costo acumulado del producto en el periodo
 * @param margenBrutoTotal ingreso total menos costo total del periodo
 */
public record ProductoRendimientoDTO(
        Long productoId,
        String nombre,
        BigDecimal precio,
        BigDecimal costoEstimado,
        BigDecimal margenUnitario,
        BigDecimal margenPorcentaje,
        long unidadesVendidas,
        BigDecimal ingresoTotal,
        BigDecimal costoTotal,
        BigDecimal margenBrutoTotal
) {}
