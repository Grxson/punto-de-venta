package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;

/**
 * Proyección agregada para el rendimiento de productos.
 *
 * <p>Es el resultado de una consulta de agregación sobre las líneas de venta; el servicio
 * la usa de forma interna y no se expone directamente en la API.
 *
 * @param productoId identificador del producto
 * @param nombreProducto nombre del producto
 * @param precio precio de venta vigente
 * @param costoEstimado costo estimado por unidad
 * @param unidadesVendidas total de unidades vendidas en el periodo
 * @param ingresoTotal ingreso total generado por el producto
 * @param costoTotal costo acumulado del producto
 */
public record ProductoRendimientoAggregate(
        Long productoId,
        String nombreProducto,
        BigDecimal precio,
        BigDecimal costoEstimado,
        Long unidadesVendidas,
        BigDecimal ingresoTotal,
        BigDecimal costoTotal
) {}
