package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Request para confirmar recepción de un item específico.
 * Permite auditar diferencias entre lo ordenado y lo recibido.
 */
public record RecibirItemRequest(
        @NotNull(message = "El ID del item es obligatorio") Long itemId,

        @NotNull(message = "La cantidad recibida es obligatoria") @PositiveOrZero(message = "La cantidad recibida debe ser >= 0") BigDecimal cantidadRecibida) {
}
