package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para representar el desglose de ventas por método de pago.
 */
public record DesglosePagoDTO(
    String metodoPago,
    BigDecimal total
) {}
