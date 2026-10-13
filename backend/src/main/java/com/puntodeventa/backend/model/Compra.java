package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa una compra de materia prima a un proveedor.
 * ✅ Segregación por sucursal
 * ✅ Auditoría con createdAt, updatedAt
 * ✅ Estados: pendiente, recibida, cancelada, rechazada
 */
@Entity
@Table(name = "compras", indexes = {
        @Index(name = "idx_compras_sucursal", columnList = "sucursal_id"),
        @Index(name = "idx_compras_proveedor", columnList = "proveedor_id"),
        @Index(name = "idx_compras_fecha", columnList = "fecha"),
        @Index(name = "idx_compras_estado", columnList = "estado"),
        @Index(name = "idx_compras_sucursal_fecha", columnList = "sucursal_id, fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compra implements Serializable {

    /** Identificador único de la compra. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista: impide que dos usuarios receptionen la misma compra. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** Sucursal que realiza la compra; delimita el alcance del movimiento de inventario. */
    @NotNull(message = "La sucursal es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Proveedor al que se le compra la materia prima; many-to-one obligatorio. */
    @NotNull(message = "El proveedor es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    /** Fecha en que se registró el pedido; define el periodo contable de la compra. */
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    /** Importe total de la compra, con el detalle ya capturado en sus renglones. */
    @NotNull(message = "El monto total es obligatorio")
    @PositiveOrZero(message = "El monto total debe ser >= 0")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal montoTotal;

    /** Situación de la compra en su ciclo de vida. */
    @NotNull(message = "El estado es obligatorio")
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "pendiente"; // pendiente, recibida, cancelada, rechazada

    /** Observaciones internas sobre el pedido o su recepción. */
    @Column(length = 500)
    private String notas;

    // Preferencias de usuario (para agilizar entrada masiva)
    /** Usuario que capturó la compra; se usa para recuperar sus preferencias de registro. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Referencia externa (ej: número de factura del proveedor)
    /** Referencia externa (ej: número de factura del proveedor). */
    @Column(length = 100)
    private String numeroFactura;

    // Auditoría
    /** Fecha de alta del registro de compra; la fija la aplicación porque no usa sellos de Hibernate. */
    @NotNull
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación; se refresca en el callback onUpdate. */
    @Column
    private LocalDateTime updatedAt;

    // Relación con items
    /**
     * one-to-many: los renglones de la compra. many-to-one desde cada renglón
     * hacia esta cabecera, con eliminación en cascada.
     */
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CompraItem> items;

    /**
     * Mantiene al día la marca de auditoría antes de cada actualización.
     * Existe porque esta entidad no hereda de {@link BaseEntity} y no usa @UpdateTimestamp.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}