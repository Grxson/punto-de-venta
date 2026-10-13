package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa un movimiento de inventario.
 * Tipos: entrada, consumo, ajuste, merma, devolución
 *
 * Es el libro de movimientos del inventario: toda variación de existencias
 * queda registrada con su importe, de modo que el stock actual del ingrediente
 * siempre se pueda reconstruir a partir del histórico.
 */
@Entity
@Table(name = "inventario_movimientos", indexes = {
    @Index(name = "idx_inv_mov_ingrediente_fecha", columnList = "ingrediente_id, fecha"),
    @Index(name = "idx_inv_mov_tipo_fecha", columnList = "tipo, fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioMovimiento {

    /** Identificador único del movimiento. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ingrediente que se movió; many-to-one obligatorio, muchos movimientos por ingrediente. */
    @NotNull(message = "El ingrediente es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    /** Naturaleza del movimiento: entrada, consumo, ajuste, merma o devolucion. */
    @NotBlank(message = "El tipo de movimiento es obligatorio")
    @Column(nullable = false, length = 20)
    private String tipo; // entrada, consumo, ajuste, merma, devolucion

    /** Cantidad movida, siempre positiva: el signo lo determina el tipo. */
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    @Column(nullable = false, precision = 14, scale = 6)
    private BigDecimal cantidad;

    /** Unidad en la que se expresa la cantidad movida; many-to-one obligatorio. */
    @NotNull(message = "La unidad es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_id", nullable = false)
    private Unidad unidad;

    /** Costo por unidad aplicado en el momento del movimiento. */
    @NotNull(message = "El costo unitario es obligatorio")
    @Column(name = "costo_unitario", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoUnitario;

    /** Importe total del movimiento: costo unitario por cantidad. */
    @NotNull(message = "El costo total es obligatorio")
    @Column(name = "costo_total", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoTotal;

    /** Fecha y hora del movimiento; ordena el histórico del ingrediente. */
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    /** Tipo de documento que originó el movimiento: venta, compra, ajuste o merma. */
    @Column(name = "ref_tipo", length = 50)
    private String refTipo; // venta, compra, ajuste, merma

    /** Identificador del documento origen; junto con refTipo permite revertir el movimiento. */
    @Column(name = "ref_id")
    private Long refId;

    /** Lote del insumo al que corresponde el movimiento. */
    @Column(length = 100)
    private String lote;

    /** Fecha de caducidad del lote, cuando el insumo es perecedero. */
    private LocalDate caducidad;

    /** Observaciones sobre el movimiento. */
    @Column(columnDefinition = "TEXT")
    private String nota;
}