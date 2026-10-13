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
import java.time.LocalDateTime;

/**
 * Entidad que representa el registro de una merma.
 *
 * Registra la pérdida de insumos por deterioro, error o robo. Es el control que
 * justifica la diferencia entre el stock teórico y el stock contado.
 */
@Entity
@Table(name = "mermas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Merma {

    /** Identificador único del registro de merma. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ingrediente que se perdió; many-to-one obligatorio. */
    @NotNull(message = "El ingrediente es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    /** Cantidad perdida del ingrediente. */
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    @Column(nullable = false, precision = 14, scale = 6)
    private BigDecimal cantidad;

    /** Unidad en la que se expresa la cantidad perdida; many-to-one obligatorio. */
    @NotNull(message = "La unidad es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_id", nullable = false)
    private Unidad unidad;

    /** Causa de la pérdida (caducidad, error de preparación, robo). */
    @NotBlank(message = "El motivo es obligatorio")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    /** Fecha en que se detectó y registró la pérdida. */
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    /** many-to-one opcional al usuario responsable de la pérdida */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private Usuario responsable;

    /** Costo por unidad del insumo perdido, para valorar la pérdida. */
    @Column(name = "costo_unitario", precision = 14, scale = 6)
    private BigDecimal costoUnitario;

    /** Valor total de la pérdida: costo unitario por cantidad. */
    @Column(name = "costo_total", precision = 14, scale = 6)
    private BigDecimal costoTotal;
}