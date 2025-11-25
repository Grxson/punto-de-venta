package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Snapshot histórico de costo y margen de un producto.
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
