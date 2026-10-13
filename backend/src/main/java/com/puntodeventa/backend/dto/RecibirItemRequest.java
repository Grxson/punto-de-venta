package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Línea de una recepción de compra: confirma cuánto de un item se recibió.
 *
 * <p>Es parte del request del endpoint de recepción y permite auditar las diferencias
 * entre lo ordenado y lo efectivamente recibido.
 *
 * @param itemId identificador de la línea de compra confirmada
 * @param cantidadRecibida cantidad efectivamente recibida de esa línea; puede ser cero si
 *                         no llegó nada
 */
public record RecibirItemRequest(
        @NotNull(message = "El ID del item es obligatorio") Long itemId,

        @NotNull(message = "La cantidad recibida es obligatoria") @PositiveOrZero(message = "La cantidad recibida debe ser >= 0") BigDecimal cantidadRecibida) {
}
