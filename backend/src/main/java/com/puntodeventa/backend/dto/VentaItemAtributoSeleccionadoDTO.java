package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para VentaItemAtributoSeleccionado
 * Representa un atributo/opción seleccionada en un item de venta
 */
public record VentaItemAtributoSeleccionadoDTO(
    Long id,
    Long ventaItemId,
    Long atributoId,
    String atributoNombre,
    Long opcionId,
    String opcionNombre,
    String valorSeleccionado,
    BigDecimal precioExtra
) {
}
