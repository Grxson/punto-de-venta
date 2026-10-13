package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Unidad de medida con la que se administran ingredientes y recetas (kilogramo, litro,
 * mililitro, etc.).
 *
 * <p>Se envía como request al crear o editar una unidad y se devuelve como response en las
 * consultas de configuración.
 *
 * @param id identificador de la unidad; {@code null} al crearla
 * @param nombre nombre visible de la unidad
 * @param abreviatura forma corta de la unidad (por ejemplo, kg o ml)
 * @param factorBase equivalencia de la unidad respecto de su unidad base
 * @param descripcion detalle de la unidad
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
