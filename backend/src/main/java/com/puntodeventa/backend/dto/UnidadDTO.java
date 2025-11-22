package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * DTO para Unidad de medida.
 */
public record UnidadDTO(
    Long id,
    
    @NotBlank(message = "El nombre de la unidad es obligatorio")
    String nombre,
    
    @NotBlank(message = "La abreviatura de la unidad es obligatoria")
    String abreviatura,
    
    @NotNull(message = "El factor base es obligatorio")
    @Positive(message = "El factor base debe ser positivo")
    BigDecimal factorBase,
    
    String descripcion
) {}
