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
 * Entidad que representa un gasto operativo del negocio.
 * Puede ser de inventario (compras), servicios, nómina, etc.
 */
@Entity
@Table(name = "gastos", indexes = {
    @Index(name = "idx_gasto_fecha", columnList = "fecha"),
    @Index(name = "idx_gasto_categoria", columnList = "categoria_gasto_id"),
    @Index(name = "idx_gasto_sucursal", columnList = "sucursal_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La categoría de gasto es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_gasto_id", nullable = false)
    private CategoriaGasto categoriaGasto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor; // Opcional: proveedor del gasto

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal; // Sucursal donde se realizó el gasto

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "metodo_pago_id")
    private MetodoPago metodoPago; // Método de pago usado (efectivo, tarjeta, transferencia)

    @Column(length = 200)
    private String referencia; // Referencia del pago (número de factura, autorización, etc.)

    @Column(columnDefinition = "TEXT")
    private String nota; // Descripción adicional del gasto

    @Column(length = 500)
    private String comprobanteUrl; // URL del comprobante (factura, ticket, etc.)

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String tipoGasto = "Operacional"; // Tipo: Operacional (en resumen) o Administrativo (no incluir)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Usuario que registró el gasto

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;
}

