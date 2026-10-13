package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Ingrediente: la materia prima que se compra, se controla y se consume.
 * Permite vincular ingredientes con gastos de "Materia Prima" para calcular
 * costos unitarios automáticamente.
 *
 * <p>Se recibe al crear o actualizar un ingrediente y se devuelve al consultarlo. El
 * núcleo del modelo está en la conversión: el gasto de compra viene expresado en una
 * unidad (por ejemplo, litros) y el ingrediente se administra en su unidad base (por
 * ejemplo, mililitros); de ahí se obtiene el costo unitario base que usan las recetas.
 *
 * @param id                     identificador del ingrediente; {@code null} al crearlo
 * @param nombre                 nombre del ingrediente
 * @param descripcion             detalle del ingrediente
 * @param categoria              agrupación para los filtros del catálogo
 * @param gastoId                gasto de "Materia Prima" del que se toma el costo
 * @param costoTotalGasto        costo total de ese gasto
 * @param unidadGastoId          unidad original en la que está expresado el gasto
 * @param unidadGastoNombre      nombre de esa unidad
 * @param unidadGastoAbreviatura abreviatura de esa unidad
 * @param factorConversion       relación entre ambas unidades en texto libre, por ejemplo
 *                               "1 kg = 500 ml" o "0.5 kg = 250 ml"
 * @param unidadBaseId           unidad en la que se administra el ingrediente
 * @param unidadBaseNombre       nombre de esa unidad base
 * @param unidadBaseAbreviatura  abreviatura de esa unidad base
 * @param costoUnitarioBase      costo por unidad base, calculado como
 *                               {@code costoTotalGasto / factorConversion}
 * @param stockMinimo            umbral que dispara la alerta de stock bajo
 * @param proveedorId            proveedor habitual del ingrediente
 * @param proveedorNombre        nombre de ese proveedor
 * @param sku                    código interno de inventario
 * @param activo                 si el ingrediente sigue en uso
 */
public record IngredienteDTO(
        Long id,

        @NotBlank(message = "El nombre del ingrediente es obligatorio") String nombre,

        String descripcion,
        String categoria,

        // VINCULACIÓN AL GASTO
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
