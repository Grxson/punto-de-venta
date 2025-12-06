package com.puntodeventa.backend.dto.aggregate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Agregado de estadísticas de un producto para cálculo de popularidad.
 */
public record ProductoEstadisticasAggregate(
        Long productoId,        // ID del producto
        long frecuencia,        // Número de transacciones
        long cantidad,          // Cantidad total vendida
        BigDecimal ingreso,     // Ingreso total
        LocalDateTime ultimaVenta  // Última fecha de venta
) {
}
