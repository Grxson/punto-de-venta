package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para Movimiento de Inventario.
 */
public record InventarioMovimientoDTO(
    Long id,
    
    @NotNull(message = "El ingrediente es obligatorio")
    Long ingredienteId,
    
    String ingredienteNombre,
    
    @NotBlank(message = "El tipo de movimiento es obligatorio")
    String tipo,
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    BigDecimal cantidad,
    
    @NotNull(message = "La unidad es obligatoria")
    Long unidadId,
    
    String unidadNombre,
    String unidadAbreviatura,
    
    @NotNull(message = "El costo unitario es obligatorio")
    BigDecimal costoUnitario,
    
    @NotNull(message = "El costo total es obligatorio")
    BigDecimal costoTotal,
    
    @NotNull(message = "La fecha es obligatoria")
    LocalDateTime fecha,
    
    String refTipo,
    Long refId,
    String lote,
    LocalDate caducidad,
    String nota
) {}
