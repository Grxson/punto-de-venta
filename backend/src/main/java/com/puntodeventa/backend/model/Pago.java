package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa un pago asociado a una venta.
 * Una venta puede tener múltiples pagos (por ejemplo: parte en efectivo, parte en tarjeta).
 */
@Entity
@Table(name = "pagos", indexes = {
    @Index(name = "idx_pago_venta", columnList = "venta_id"),
    @Index(name = "idx_pago_metodo", columnList = "metodo_pago_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    /** Identificador único del pago. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Venta que este pago cancela; many-to-one, una venta admite varios pagos. */
    @NotNull(message = "La venta es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    /** Medio con el que se pagó; many-to-one obligatorio y de carga anticipada (EAGER) porque se muestra junto al pago. */
    @NotNull(message = "El método de pago es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "metodo_pago_id", nullable = false)
    private MetodoPago metodoPago;

    /** Importe cubierto por este pago; la suma de los pagos debe igualar el total de la venta. */
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    /** Número de autorización, folio, etc. */
    @Column(length = 200)
    private String referencia; // Número de autorización, folio, etc.

    /** Momento en que se registró el cobro. */
    @NotNull(message = "La fecha del pago es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;
}