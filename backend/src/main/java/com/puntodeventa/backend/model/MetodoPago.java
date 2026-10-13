package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un método de pago (efectivo, tarjeta, transferencia).
 *
 * Es el catálogo de medios de cobro disponibles. El indicador
 * {@code requiereReferencia} determina si el punto de venta debe exigir una
 * referencia (autorización, folio) al registrar un pago con este medio.
 */
@Entity
@Table(name = "metodos_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoPago {

    /** Identificador único del método de pago. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del medio de cobro (efectivo, tarjeta, transferencia); es único en el sistema. */
    @NotBlank(message = "El nombre del método de pago es obligatorio")
    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    /** Si es true, el cobro con este medio exige capturar una referencia. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(name = "requiere_referencia", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean requiereReferencia = false;

    /** Si es false, el medio deja de ofrecerse en el punto de venta sin borrar cobros históricos. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;

    /** Detalle del medio de cobro y de sus condiciones de uso. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}