package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Movimiento de inventario: cualquier cambio de stock de un ingrediente.
 *
 * <p>Se usa como cuerpo de entrada al registrar un movimiento y como respuesta al
 * consultar el historial. Los movimientos nacen de la operación de negocio que los origina
 * (una compra recibida, una venta, una merma) y quedan identificados por {@code refTipo} y
 * {@code refId}.
 *
 * @param id                 identificador del movimiento
 * @param ingredienteId      ingrediente cuyo stock cambia
 * @param ingredienteNombre  nombre de ese ingrediente
 * @param tipo               naturaleza del movimiento ({@code compra}, {@code venta},
 *                           {@code merma}, {@code ajuste})
 * @param cantidad           cantidad movida, siempre positiva
 * @param unidadId           unidad de medida de {@code cantidad}
 * @param unidadNombre       nombre de esa unidad
 * @param unidadAbreviatura  abreviatura de esa unidad
 * @param costoUnitario      costo por unidad en el momento del movimiento
 * @param costoTotal         costo total del movimiento
 * @param fecha              fecha y hora del movimiento
 * @param refTipo            tipo de entidad que originó el movimiento
 *                           ({@code compra}, {@code venta}, {@code merma})
 * @param refId              identificador de esa entidad
 * @param lote               lote o partida a la que pertenece el movimiento
 * @param caducidad          fecha de vencimiento, cuando el ingrediente es perecedero
 * @param nota               observación del movimiento
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
