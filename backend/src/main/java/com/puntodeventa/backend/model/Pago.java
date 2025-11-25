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
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La venta es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;
    
    @NotNull(message = "El método de pago es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "metodo_pago_id", nullable = false)
    private MetodoPago metodoPago;
    
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;
    
    @Column(length = 200)
    private String referencia; // Número de autorización, folio, etc.
    
    @NotNull(message = "La fecha del pago es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;
}
