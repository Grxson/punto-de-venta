package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

/**
 * Línea de una venta: un producto con su cantidad, precio y opciones elegidas.
 *
 * <p>Viaja dentro del request de creación o actualización de una venta y también dentro
 * del response del detalle de la venta.
 *
 * @param id identificador de la línea; {@code null} al crearla
 * @param productoId producto vendido
 * @param productoNombre nombre de ese producto (solo lectura)
 * @param cantidad unidades vendidas; debe ser mayor que cero
 * @param precioUnitario precio por unidad al momento de la venta
 * @param subtotal importe de la línea antes de impuestos y descuentos
 * @param costoEstimado costo estimado de la línea, usado para calcular el margen
 * @param nota observación del vendedor para esta línea
 * @param tamañoId tamaño elegido para el producto, si aplica
 * @param tamañoNombre nombre de ese tamaño (solo lectura)
 * @param precioExtraTamano importe adicional del tamaño elegido
 * @param atributosSeleccionados atributos y opciones elegidos por el cliente
 */
public record VentaItemDTO(
    Long id,
    
    @NotNull(message = "El ID del producto es obligatorio")
    Long productoId,
    
    String productoNombre, // Para respuestas
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    Integer cantidad,
    
    @NotNull(message = "El precio unitario es obligatorio")
    @PositiveOrZero(message = "El precio unitario debe ser positivo o cero")
    BigDecimal precioUnitario,
    
    BigDecimal subtotal,
    BigDecimal costoEstimado,
    String nota,
    
    // ============================================================
    // Nuevos campos para variantes multi-paso
    // ============================================================
    Long tamañoId,
    String tamañoNombre,
    BigDecimal precioExtraTamano,
    List<VentaItemAtributoSeleccionadoDTO> atributosSeleccionados
) {}
