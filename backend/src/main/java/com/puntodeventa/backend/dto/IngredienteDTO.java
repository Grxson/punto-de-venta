package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * DTO para Ingrediente.
 * Permite vincular ingredientes con gastos de "Materia Prima" para calcular
 * costos unitarios automáticamente.
 */
public record IngredienteDTO(
        Long id,

        @NotBlank(message = "El nombre del ingrediente es obligatorio") String nombre,

        String descripcion,
        String categoria,

        // VINCULACIÓN A GASTO
        Long gastoId, // ID del gasto original
        BigDecimal costoTotalGasto, // Costo total del gasto

        // CONVERSIÓN DE UNIDADES
        Long unidadGastoId, // Unidad original del gasto
        String unidadGastoNombre,
        String unidadGastoAbreviatura,

        String factorConversion, // Ej: "1 kg = 500 ml" o "0.5 kg = 250 ml" (flexible)

        // RESULTADO FINAL
        @NotNull(message = "La unidad base es obligatoria") Long unidadBaseId,

        String unidadBaseNombre,
        String unidadBaseAbreviatura,

        @NotNull(message = "El costo unitario base es obligatorio") @PositiveOrZero(message = "El costo unitario base debe ser positivo o cero") BigDecimal costoUnitarioBase, // Calculado
                                                                                                                                                                               // =
                                                                                                                                                                               // costoTotalGasto
                                                                                                                                                                               // /
                                                                                                                                                                               // factorConversion

        @PositiveOrZero(message = "El stock mínimo debe ser positivo o cero") BigDecimal stockMinimo,

        Long proveedorId,
        String proveedorNombre,

        String sku,
        Boolean activo) {
}
