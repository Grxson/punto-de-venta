package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Resumen agregado de ventas de un día o de un rango de fechas.
 *
 * <p>Es el response del endpoint de estadísticas: entrega los totales del periodo para el
 * tablero de resultados. Si {@code fecha} es {@code null}, el resumen corresponde a un
 * rango en lugar de a un solo día.
 *
 * @param fecha día representativo del resumen; {@code null} cuando el resumen es de un rango
 * @param totalVentas importe total vendido en el periodo
 * @param totalCostos suma de los costos de producto más los gastos del periodo
 * @param totalGastos gastos operativos del periodo, separados del costo de los productos
 * @param margenBruto total de ventas menos total de costos
 * @param cantidadVentas número de ventas registradas en el periodo
 * @param itemsVendidos cantidad de unidades vendidas en el periodo
 * @param ticketPromedio importe promedio por venta
 * @param margenPorcentaje margen bruto expresado como porcentaje de las ventas
 */
public record ResumenVentasDiaDTO(
        LocalDate fecha,
        BigDecimal totalVentas,
        BigDecimal totalCostos,
        BigDecimal totalGastos, // Gastos operativos (separado de costos de productos)
        BigDecimal margenBruto,
        int cantidadVentas,
        long itemsVendidos,
        BigDecimal ticketPromedio,
        BigDecimal margenPorcentaje
) {}
