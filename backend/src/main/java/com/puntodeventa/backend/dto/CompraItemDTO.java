package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * DTO para CompraItem - Legible y validado.
 */
public record CompraItemDTO(
        Long id,

        @NotNull(message = "El ID del ingrediente es obligatorio") Long ingredienteId,

        String ingredienteNombre,

        @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser > 0") BigDecimal cantidad,

        @NotNull(message = "La unidad es obligatoria") Long unidadId,

        String unidadNombre,

        @NotNull(message = "El precio unitario es obligatorio") @PositiveOrZero(message = "El precio unitario debe ser >= 0") BigDecimal precioUnitario,

        BigDecimal subtotal,

        @PositiveOrZero(message = "La cantidad recibida debe ser >= 0") BigDecimal cantidadRecibida) {
}
