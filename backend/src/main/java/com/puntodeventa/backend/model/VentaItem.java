package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un item (producto) dentro de una venta.
 *
 * Cada renglón congela el nombre del producto y los importes cobrados en el
 * momento de la venta, de modo que cambios posteriores en el catálogo o en el
 * precio no alteren el histórico ya facturado.
 */
@Entity
@Table(name = "ventas_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaItem {

    /** Identificador único del renglón. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista del renglón. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** Venta a la que pertenece el renglón; many-to-one, cada renglón tiene una única cabecera. */
    @NotNull(message = "La venta es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    /** Producto vendido; many-to-one, el mismo producto puede aparecer en muchos renglones. */
    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    // Nombre completo del producto al momento de la venta (incluye variante si
    // aplica)
    // Ejemplo: "Jugo de Naranja - 1 Litro" o "Jugo de Naranja"
    /** Nombre del producto congelado al cobrar, para que un cambio de catálogo no altere la factura. */
    @Column(name = "producto_nombre", length = 255)
    private String productoNombre;

    /** Número de unidades vendidas en este renglón. */
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    @Column(nullable = false)
    private Integer cantidad;

    /** Precio cobrado por unidad en este renglón. */
    @NotNull(message = "El precio unitario es obligatorio")
    @PositiveOrZero(message = "El precio unitario debe ser positivo o cero")
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    /** Importe del renglón: precio unitario por cantidad, ya con el recargo del tamaño. */
    @NotNull(message = "El subtotal es obligatorio")
    @PositiveOrZero(message = "El subtotal debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    // Costo total estimado del item (costo unitario estimado del producto *
    // cantidad).
    // Puede ser null si el producto aún no tiene costo calculado.
    /** Costo de producción atribuido al renglón; base para medir el margen real de la venta. */
    @PositiveOrZero(message = "El costo estimado debe ser positivo o cero")
    @Column(name = "costo_estimado", precision = 12, scale = 4)
    private BigDecimal costoEstimado;

    /** Indicaciones especiales del cliente para este renglón (sin cebolla, extra queso, etc.). */
    @Column(columnDefinition = "TEXT")
    private String nota; // Notas especiales del cliente (sin cebolla, extra queso, etc.)

    // ============================================================
    // Relaciones para variantes multi-paso
    // ============================================================

    /**
     * many-to-one opcional al tamaño elegido; es null si el producto no ofrece tamaños.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamano_id")
    private ProductoTamano tamano;

    /**
     * Nombre del tamaño al momento de la venta (denormalización para auditoría)
     */
    @Column(name = "tamano_nombre", length = 100)
    private String tamanoNombre;

    /**
     * Precio extra del tamaño aplicado a este item
     */
    /** Recargo que cobra el tamaño seleccionado sobre el precio base. */
    @PositiveOrZero(message = "El precio extra del tamaño debe ser positivo o cero")
    @Column(name = "precio_extra_tamano", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precioExtraTamano = BigDecimal.ZERO;

    /**
     * Atributos seleccionados para este item (ej: ingredientes del jugo).
     * one-to-many en cascada: cada selección apunta al renglón y se elimina
     * junto con él.
     */
    @OneToMany(mappedBy = "ventaItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaItemAtributoSeleccionado> atributosSeleccionados = new ArrayList<>();
}