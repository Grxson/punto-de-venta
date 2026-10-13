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
 *
 * Es la fuente de verdad para la cuenta de resultados de la sucursal: los
 * reportes separan los gastos por tipo para no mezclar el gasto que incide en
 * el cálculo del resultado diario con el que solo afecta al cierre contable.
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

    /** Identificador único del gasto. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista del registro de gasto. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** many-to-one obligatorio a la categoría que clasifica el gasto; se carga de forma anticipada (EAGER) porque se lista junto al gasto. */
    @NotNull(message = "La categoría de gasto es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_gasto_id", nullable = false)
    private CategoriaGasto categoriaGasto;

    /** many-to-one opcional: proveedor del gasto */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor; // Opcional: proveedor del gasto

    /** many-to-one a la sucursal donde se realizó el gasto */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal; // Sucursal donde se realizó el gasto

    /** Importe del gasto. */
    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    /** Fecha en que se devengó el gasto; define el periodo al que se imputa. */
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    /** many-to-one al método de pago usado (efectivo, tarjeta, transferencia) */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "metodo_pago_id")
    private MetodoPago metodoPago; // Método de pago usado (efectivo, tarjeta, transferencia)

    /** Referencia del pago (número de factura, autorización, etc.) */
    @Column(length = 200)
    private String referencia; // Referencia del pago (número de factura, autorización, etc.)

    /** Descripción adicional del gasto */
    @Column(columnDefinition = "TEXT")
    private String nota; // Descripción adicional del gasto

    /** URL del comprobante (factura, ticket, etc.) */
    @Column(length = 500)
    private String comprobanteUrl; // URL del comprobante (factura, ticket, etc.)

    /** Tipo de gasto: Operacional (entra al resumen) o Administrativo (no incluir). */
    @Column(length = 50, nullable = false)
    @Builder.Default
    private String tipoGasto = "Operacional"; // Tipo: Operacional (en resumen) o Administrativo (no incluir)

    /** many-to-one al usuario que registró el gasto */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Usuario que registró el gasto

    /** Fecha de alta; la fija la aplicación al insertar. */
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column
    private LocalDateTime updatedAt;
}