package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Receta de un producto: la lista de ingredientes y cantidades que lo componen (BOM, bill
 * of materials).
 *
 * <p>Se envía como request al definir o editar la receta de un producto y se devuelve como
 * response al consultarla. Es la base para calcular el costo estimado del producto.
 *
 * @param productoId producto al que pertenece la receta
 * @param productoNombre nombre de ese producto (solo lectura)
 * @param ingredienteId ingrediente que compone la receta
 * @param ingredienteNombre nombre de ese ingrediente (solo lectura)
 * @param cantidad cantidad del ingrediente requerida por unidad de producto
 * @param unidadId unidad de medida de la cantidad
 * @param unidadNombre nombre de esa unidad (solo lectura)
 * @param unidadAbreviatura abreviatura de esa unidad (solo lectura)
 * @param mermaTeorica porcentaje de merma esperado en la preparación, entre 0 y 1
 */
public record RecetaDTO(
    @NotNull(message = "El ID del producto es obligatorio")
    Long productoId,
    
    String productoNombre,
    
    @NotNull(message = "El ID del ingrediente es obligatorio")
    Long ingredienteId,
    
    String ingredienteNombre,
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    BigDecimal cantidad,
    
    @NotNull(message = "La unidad es obligatoria")
    Long unidadId,
    
    String unidadNombre,
    String unidadAbreviatura,
    
    @PositiveOrZero(message = "La merma teórica debe ser entre 0 y 1")
    BigDecimal mermaTeorica
) {}
