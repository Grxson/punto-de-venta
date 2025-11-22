package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para registro de Merma.
 */
public record MermaDTO(
    Long id,
    
    @NotNull(message = "El ingrediente es obligatorio")
    Long ingredienteId,
    
    String ingredienteNombre,
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    BigDecimal cantidad,
    
    @NotNull(message = "La unidad es obligatoria")
    Long unidadId,
    
    String unidadNombre,
    String unidadAbreviatura,
    
    @NotBlank(message = "El motivo es obligatorio")
    String motivo,
    
    @NotNull(message = "La fecha es obligatoria")
    LocalDateTime fecha,
    
    Long responsableId,
    String responsableNombre,
    
    BigDecimal costoUnitario,
    BigDecimal costoTotal
) {}
