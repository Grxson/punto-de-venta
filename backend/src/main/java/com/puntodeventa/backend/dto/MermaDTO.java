package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Merma: pérdida de un ingrediente durante la operación (caducidad, derrame, error de
 * preparación, entre otras causas).
 *
 * <p>Se envía como request al registrar una merma y se devuelve como response en las
 * consultas. Toda merma genera un movimiento de inventario que descuenta stock.
 *
 * @param id identificador de la merma; {@code null} al registrarla
 * @param ingredienteId ingrediente que se perdió
 * @param ingredienteNombre nombre de ese ingrediente (solo lectura)
 * @param cantidad cantidad perdida
 * @param unidadId unidad de medida en la que se expresa la cantidad
 * @param unidadNombre nombre de esa unidad (solo lectura)
 * @param unidadAbreviatura abreviatura de esa unidad (solo lectura)
 * @param motivo causa de la merma
 * @param fecha fecha y hora de la merma
 * @param responsableId usuario que reporta la merma
 * @param responsableNombre nombre de ese usuario (solo lectura)
 * @param costoUnitario costo por unidad en el momento de la merma
 * @param costoTotal valor total de la pérdida
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
