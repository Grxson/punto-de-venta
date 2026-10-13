package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Agregado de estadísticas de un producto para calcular su popularidad.
 *
 * <p>Es el resultado de una consulta de agregación sobre las ventas; el servicio lo usa de
 * forma interna para construir el menú y no se expone directamente en la API.
 *
 * @param productoId identificador del producto
 * @param frecuencia número de transacciones en las que se vendió
 * @param cantidad cantidad total de unidades vendidas
 * @param ingreso ingreso total generado por el producto
 * @param ultimaVenta fecha de la última venta del producto
 */
public record ProductoEstadisticasAggregate(
        Long productoId,        // ID del producto
        long frecuencia,        // Número de transacciones
        long cantidad,          // Cantidad total vendida
        BigDecimal ingreso,     // Ingreso total
        LocalDateTime ultimaVenta  // Última fecha de venta
) {
}
