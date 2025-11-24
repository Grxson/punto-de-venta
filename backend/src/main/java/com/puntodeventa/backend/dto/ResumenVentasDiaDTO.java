package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO que representa el resumen agregado de ventas de un día o rango (si fecha es null).
 */
public record ResumenVentasDiaDTO(
        LocalDate fecha,
        BigDecimal totalVentas,
        BigDecimal totalCostos,
        BigDecimal margenBruto,
        int cantidadVentas,
        long itemsVendidos,
        BigDecimal ticketPromedio,
        BigDecimal margenPorcentaje
) {}
