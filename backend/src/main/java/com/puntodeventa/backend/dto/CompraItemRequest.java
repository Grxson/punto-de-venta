package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Línea de compra tal como la envía el cliente.
 *
 * <p>Versión mínima de {@link CompraItemDTO}: solo lleva los datos que el usuario digita,
 * sin los campos calculados por el servidor. Se reutiliza tanto en la creación como en la
 * actualización de una compra.
 *
 * @param ingredienteId ingrediente a comprar
 * @param cantidad      cantidad solicitada; debe ser mayor que cero
 * @param unidadId      unidad de medida de {@code cantidad}
 * @param precioTotal   importe total de la línea
 */
public record CompraItemRequest(
                @NotNull(message = "El ID del ingrediente es obligatorio") Long ingredienteId,

                @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser > 0") BigDecimal cantidad,

                @NotNull(message = "La unidad es obligatoria") Long unidadId,

                @NotNull(message = "El precio total es obligatorio") @PositiveOrZero(message = "El precio total debe ser >= 0") BigDecimal precioTotal) {
}
