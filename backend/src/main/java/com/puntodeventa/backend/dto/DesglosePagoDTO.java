package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Importe acumulado por medio de pago en un rango de fechas.
 *
 * <p>Es la respuesta del desglose de ventas por método de pago, usado para conciliar la
 * caja: indica cuánto entró por cada medio.
 *
 * @param metodoPago nombre del medio de pago (efectivo, tarjeta, transferencia, etc.)
 * @param total      importe acumulado en ese medio dentro del rango consultado
 */
public record DesglosePagoDTO(
    String metodoPago,
    BigDecimal total
) {}
