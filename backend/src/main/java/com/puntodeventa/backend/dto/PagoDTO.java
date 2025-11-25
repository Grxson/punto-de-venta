package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para pagos de una venta.
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
