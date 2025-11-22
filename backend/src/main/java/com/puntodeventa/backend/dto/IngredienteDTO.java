package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * DTO para Ingrediente.
 */
public record IngredienteDTO(
    Long id,
    
    @NotBlank(message = "El nombre del ingrediente es obligatorio")
    String nombre,
    
    String categoria,
    
    @NotNull(message = "La unidad base es obligatoria")
    Long unidadBaseId,
    
    String unidadBaseNombre,
    String unidadBaseAbreviatura,
    
    @NotNull(message = "El costo unitario base es obligatorio")
    @PositiveOrZero(message = "El costo unitario base debe ser positivo o cero")
    BigDecimal costoUnitarioBase,
    
    @PositiveOrZero(message = "El stock mínimo debe ser positivo o cero")
    BigDecimal stockMinimo,
    
    Long proveedorId,
    String proveedorNombre,
    
    String sku,
    Boolean activo
) {}
