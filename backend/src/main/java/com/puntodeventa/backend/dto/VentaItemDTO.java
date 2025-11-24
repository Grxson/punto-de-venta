package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * DTO para items de venta.
 */
public record VentaItemDTO(
    Long id,
    
    @NotNull(message = "El ID del producto es obligatorio")
    Long productoId,
    
    String productoNombre, // Para respuestas
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    Integer cantidad,
    
    @NotNull(message = "El precio unitario es obligatorio")
    @PositiveOrZero(message = "El precio unitario debe ser positivo o cero")
    BigDecimal precioUnitario,
    
    BigDecimal subtotal,
    BigDecimal costoEstimado,
    String nota
) {}
