package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa una venta realizada en el punto de venta.
 *
 * Es la cabecera de la operación: concentra los totales, el estado y la relación
 * con los renglones vendidos ({@link VentaItem}) y con los pagos aplicados
 * ({@link Pago}). El estado gobierna el ciclo de vida completo.
 *
 * Estados válidos (según BD): abierta, cerrada, cancelada
 */
@Entity
@Table(name = "ventas", indexes = {
    @Index(name = "idx_venta_fecha", columnList = "fecha"),
    @Index(name = "idx_venta_estado", columnList = "estado"),
    @Index(name = "idx_venta_sucursal", columnList = "sucursal_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    /** Identificador único de la venta. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista: evita que dos cajeros cierren la misma venta a la vez. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** Sucursal donde se cobró la venta; delimita qué sucursal reporta los ingresos. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;

    // Nota: La base de datos en Railway tiene la columna caja_id con NOT NULL.
    // Aún no modelamos la entidad Caja; por compatibilidad mínima mapeamos el ID plano.
    /** Punto de cobro usado; se guarda como ID plano por compatibilidad con el esquema actual. */
    @Column(name = "caja_id")
    private Long cajaId;

    // Id de turno asociado a la venta (compatibilidad con esquema actual)
    /** Turno de caja en el que se registró la venta; se guarda como ID plano. */
    @Column(name = "turno_id")
    private Long turnoId;

    /** Momento en que se cobró la venta; determina a qué periodo de reporte pertenece. */
    @NotNull(message = "La fecha de la venta es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;

    /** Suma de los subtotales de los renglones, antes de impuestos y descuentos. */
    @NotNull(message = "El subtotal es obligatorio")
    @PositiveOrZero(message = "El subtotal debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    /** Importe final cobrado al cliente, ya con impuestos y descuentos aplicados. */
    @NotNull(message = "El total es obligatorio")
    @PositiveOrZero(message = "El total debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    // TODO: Implementar cálculo de IVA (pendiente)
    /** Monto de impuestos aplicado a la venta; queda en cero mientras no exista el cálculo de IVA. */
    @PositiveOrZero(message = "Los impuestos deben ser positivos o cero")
    @Column(precision = 12, scale = 2)
    private BigDecimal impuestos = BigDecimal.ZERO;

    // TODO: Implementar sistema de descuentos (pendiente)
    /** Descuento aplicado al total; queda en cero mientras no exista el motor de descuentos. */
    @PositiveOrZero(message = "El descuento debe ser positivo o cero")
    @Column(precision = 12, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    /** Canal de origen de la venta: POS, WEB o MOVIL. */
    @Column(length = 50)
    private String canal = "POS"; // POS, WEB, MOVIL

    /** Situación de la venta en su ciclo de vida: abierta, cerrada o cancelada. */
    @NotNull(message = "El estado es obligatorio")
    @Column(nullable = false, length = 20)
    private String estado = "cerrada"; // abierta, cerrada, cancelada

    /** Observaciones internas sobre la atención (pedido especial, incidencias de cobro). */
    @Column(columnDefinition = "TEXT")
    private String nota;

    /** Usuario que registró la venta; many-to-one, cada venta tiene un único autor. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Usuario que registró la venta

    /**
     * one-to-many: los renglones vendidos. many-to-one desde cada renglón hacia
     * esta cabecera, con eliminación en cascada y sin dejar huérfanos.
     */
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaItem> items = new ArrayList<>();

    /**
     * one-to-many: los pagos aplicados. many-to-one desde cada pago hacia esta
     * cabecera; una venta admite pagos mixtos (efectivo, tarjeta, transferencia).
     */
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();

    /**
     * Agrega un renglón a la venta y mantiene sincronizada la referencia inversa.
     *
     * @param item renglón a incorporar a la venta
     */
    public void addItem(VentaItem item) {
        items.add(item);
        item.setVenta(this);
    }

    /**
     * Agrega un pago a la venta y mantiene sincronizada la referencia inversa.
     *
     * @param pago pago a incorporar a la venta
     */
    public void addPago(Pago pago) {
        pagos.add(pago);
        pago.setVenta(this);
    }
}