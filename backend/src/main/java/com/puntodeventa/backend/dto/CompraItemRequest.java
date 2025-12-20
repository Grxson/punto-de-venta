package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Request para item de compra.
 * Reutilizable en crear y actualizar.
 */
public record CompraItemRequest(
                @NotNull(message = "El ID del ingrediente es obligatorio") Long ingredienteId,

                @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser > 0") BigDecimal cantidad,

                @NotNull(message = "La unidad es obligatoria") Long unidadId,

                @NotNull(message = "El precio total es obligatorio") @PositiveOrZero(message = "El precio total debe ser >= 0") BigDecimal precioTotal) {
}
