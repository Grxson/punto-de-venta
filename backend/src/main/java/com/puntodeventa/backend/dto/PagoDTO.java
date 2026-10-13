package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Pago que salda una venta, ya sea total o parcial (admite pago mixto).
 *
 * <p>Se envía como request al crear o actualizar una venta y se devuelve como response en
 * las consultas de venta.
 *
 * @param id identificador del pago; {@code null} al registrarlo
 * @param metodoPagoId medio de pago utilizado
 * @param metodoPagoNombre nombre de ese medio de pago (solo lectura)
 * @param monto importe abonado; debe ser mayor que cero
 * @param referencia folio o número de operación que respalda el pago
 * @param fecha fecha y hora del pago
 */
public record PagoDTO(
    Long id,
    
    @NotNull(message = "El ID del método de pago es obligatorio")
    Long metodoPagoId,
    
    String metodoPagoNombre, // Para respuestas
    
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    BigDecimal monto,
    
    String referencia,
    LocalDateTime fecha
) {}
