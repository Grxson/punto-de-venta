package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registro histórico del costo y del margen de un producto en un momento dado.
 *
 * <p>Es el response del endpoint de historial de costos: cada recálculo guarda un snapshot
 * para poder comparar la evolución del costo en el tiempo.
 *
 * @param id identificador del registro histórico
 * @param productoId producto al que corresponde la medición
 * @param costo costo estimado en la fecha del cálculo
 * @param precio precio de venta en la fecha del cálculo
 * @param margenAbsoluto margen absoluto en la fecha del cálculo
 * @param margenPorcentaje margen porcentual en la fecha del cálculo
 * @param fechaCalculo momento en que se calculó el costo
 * @param fuente origen del cálculo ({@code RECETA_RECALCULO_MANUAL}, {@code AJUSTE_MANUAL},
 *               {@code IMPORTACION}, etc.)
 */
public record ProductoCostoHistoricoDTO(
        Long id,
        Long productoId,
        BigDecimal costo,
        BigDecimal precio,
        BigDecimal margenAbsoluto,
        BigDecimal margenPorcentaje,
        LocalDateTime fechaCalculo,
        String fuente
) {}
