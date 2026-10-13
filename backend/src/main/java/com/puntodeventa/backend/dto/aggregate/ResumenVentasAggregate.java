package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;

/**
 * Proyección agregada para el resumen de ventas de un rango.
 *
 * <p>Es el resultado de una consulta de agregación sobre las ventas; el servicio la usa de
 * forma interna para armar los resúmenes y no se expone directamente en la API.
 *
 * @param totalVentas importe total vendido en el rango
 * @param subtotalVentas importe subtotal antes de impuestos y descuentos
 * @param cantidadVentas número de ventas registradas en el rango
 * @param itemsVendidos cantidad de unidades vendidas en el rango
 * @param totalCostos costo acumulado de los productos vendidos en el rango
 */
public record ResumenVentasAggregate(
        BigDecimal totalVentas,
        BigDecimal subtotalVentas,
        Long cantidadVentas,
        Long itemsVendidos,
        BigDecimal totalCostos
) {}
