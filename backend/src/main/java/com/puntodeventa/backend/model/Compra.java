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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La sucursal es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @NotNull(message = "El proveedor es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    @NotNull(message = "El monto total es obligatorio")
    @PositiveOrZero(message = "El monto total debe ser >= 0")
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal montoTotal;

    @NotNull(message = "El estado es obligatorio")
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "pendiente"; // pendiente, recibida, cancelada, rechazada

    @Column(length = 500)
    private String notas;

    // Preferencias de usuario (para agilizar entrada masiva)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Referencia externa (ej: número de factura del proveedor)
    @Column(length = 100)
    private String numeroFactura;

    // Auditoría
    @NotNull
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    // Relación con items
    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CompraItem> items;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
