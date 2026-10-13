package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Entidad que representa un item (ingrediente) dentro de una compra.
 * ✅ Optimizado para entrada masiva
 * ✅ Auditoría integrada
 */
@Entity
@Table(name = "compra_items", indexes = {
        @Index(name = "idx_compra_items_compra", columnList = "compra_id"),
        @Index(name = "idx_compra_items_ingrediente", columnList = "ingrediente_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraItem implements Serializable {

    /** Identificador único del renglón de compra. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista del renglón. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** Compra a la que pertenece el renglón; many-to-one, una compra tiene varios renglones. */
    @NotNull(message = "La compra es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id", nullable = false)
    private Compra compra;

    /** Ingrediente adquirido; many-to-one obligatorio y de carga anticipada (EAGER) porque se muestra en cada renglón. */
    @NotNull(message = "El ingrediente es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    /** Cantidad comprada del ingrediente, expresada en la unidad de compra. */
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser > 0")
    @Column(nullable = false, precision = 12, scale = 6)
    private BigDecimal cantidad;

    /** Unidad en la que se expresa la cantidad comprada; many-to-one obligatorio. */
    @NotNull(message = "La unidad es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidad_id", nullable = false)
    private Unidad unidad;

    /** Importe total pagado por este ingrediente, incluido el flete. */
    @NotNull(message = "El precio total es obligatorio")
    @PositiveOrZero(message = "El precio total debe ser >= 0")
    @Column(nullable = false, precision = 14, scale = 6)
    private BigDecimal precioTotal;

    /** Precio por unidad: campo derivado, lo calcula el callback calcularDerivados y la base de datos no escribe. */
    @PositiveOrZero(message = "El precio unitario debe ser >= 0")
    @Column(nullable = false, precision = 14, scale = 6, insertable = false, updatable = false)
    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;

    /** Parte del renglón que compone el monto total de la compra. */
    @Column(precision = 14, scale = 2)
    private BigDecimal subtotal;

    // Campo para agilizar: cantidad recibida (auditoría de compra)
    /** Cantidad efectivamente recepcionada; puede diferir de la cantidad pedida. */
    @PositiveOrZero(message = "La cantidad recibida debe ser >= 0")
    @Column(precision = 12, scale = 6)
    @Builder.Default
    private BigDecimal cantidadRecibida = BigDecimal.ZERO;

    /**
     * Calcula los campos derivados del renglón antes de insertarlo o actualizarlo.
     * Se ejecuta en ambos casos porque el precio total puede cambiar en una corrección.
     */
    @PrePersist
    @PreUpdate
    protected void calcularDerivados() {
        // Calcular precioUnitario = precioTotal ÷ cantidad
        if (this.cantidad != null && this.precioTotal != null && this.cantidad.compareTo(BigDecimal.ZERO) > 0) {
            this.precioUnitario = this.precioTotal.divide(this.cantidad, 6, java.math.RoundingMode.HALF_UP);
        }
        // Subtotal = precioTotal (ya que precioTotal es el total de la compra)
        if (this.precioTotal != null) {
            this.subtotal = this.precioTotal;
        }
    }
}