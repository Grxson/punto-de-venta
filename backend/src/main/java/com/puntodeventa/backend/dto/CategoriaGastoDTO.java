package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Categoría de gasto operativo (servicios, renta, mantenimiento, insumos, etc.).
 *
 * <p>Se usa como cuerpo de entrada en la creación y actualización de la categoría, y como
 * respuesta en los endpoints de consulta.
 *
 * @param id               identificador de la categoría; {@code null} al crearla
 * @param nombre           nombre de la categoría
 * @param descripcion      detalle de a qué gastos aplica
 * @param presupuestoMensual límite mensual sugerido en dinero; {@code null} si no se controla
 * @param activo           si la categoría puede usarse en nuevos gastos
 */
public record CategoriaGastoDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal presupuestoMensual,
        Boolean activo
) {}

