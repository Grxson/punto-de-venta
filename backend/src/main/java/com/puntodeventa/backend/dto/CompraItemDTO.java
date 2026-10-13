package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Línea de una compra a proveedor: cuánto de un ingrediente se pidió y a qué precio.
 *
 * <p>Devuelve además los nombres de la unidad y del ingrediente para que el frontend
 * muestre la línea sin tener que resolver referencias adicionales.
 *
 * @param id              identificador de la línea; {@code null} al crearla
 * @param ingredienteId   ingrediente comprado
 * @param ingredienteNombre nombre del ingrediente (solo lectura)
 * @param cantidad        cantidad solicitada en la unidad indicada
 * @param unidadId        unidad de medida en la que se expresa {@code cantidad}
 * @param unidadNombre     nombre de esa unidad (solo lectura)
 * @param precioTotal     importe total de la línea
 * @param precioUnitario  precio por unidad, derivado de {@code precioTotal / cantidad}
 * @param subtotal        importe de la línea una vez aplicada la merma teórica, si la hay
 * @param cantidadRecibida cantidad efectivamente recibida; mientras la compra está
 *                        pendiente vale lo mismo que {@code cantidad}
 */
public record CompraItemDTO(
                Long id,

                @NotNull(message = "El ID del ingrediente es obligatorio") Long ingredienteId,

                String ingredienteNombre,

                @NotNull(message = "La cantidad es obligatoria") @Positive(message = "La cantidad debe ser > 0") BigDecimal cantidad,

                @NotNull(message = "La unidad es obligatoria") Long unidadId,

                String unidadNombre,

                @NotNull(message = "El precio total es obligatorio") @PositiveOrZero(message = "El precio total debe ser >= 0") BigDecimal precioTotal,

                BigDecimal precioUnitario,

                BigDecimal subtotal,

                @PositiveOrZero(message = "La cantidad recibida debe ser >= 0") BigDecimal cantidadRecibida) {
}
