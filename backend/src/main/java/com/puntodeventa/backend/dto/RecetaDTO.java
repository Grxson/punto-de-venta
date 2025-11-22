package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * DTO para Receta (BOM - Bill of Materials).
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
