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
 */
@Entity
@Table(name = "ventas_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "La venta es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;
    
    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    // Nombre completo del producto al momento de la venta (incluye variante si aplica)
    // Ejemplo: "Jugo de Naranja - 1 Litro" o "Jugo de Naranja"
    @Column(name = "producto_nombre", length = 255)
    private String productoNombre;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    @Column(nullable = false)
    private Integer cantidad;
    
    @NotNull(message = "El precio unitario es obligatorio")
    @PositiveOrZero(message = "El precio unitario debe ser positivo o cero")
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;
    
    @NotNull(message = "El subtotal es obligatorio")
    @PositiveOrZero(message = "El subtotal debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    // Costo total estimado del item (costo unitario estimado del producto * cantidad).
    // Puede ser null si el producto aún no tiene costo calculado.
    @PositiveOrZero(message = "El costo estimado debe ser positivo o cero")
    @Column(name = "costo_estimado", precision = 12, scale = 4)
    private BigDecimal costoEstimado;
    
    @Column(columnDefinition = "TEXT")
    private String nota; // Notas especiales del cliente (sin cebolla, extra queso, etc.)
    
    // ============================================================
    // Relaciones para variantes multi-paso
    // ============================================================
    
    /**
     * Referencia al tamaño seleccionado (nullable si el producto no tiene tamaños)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamaño_id")
    private ProductoTamaño tamaño;
    
    /**
     * Nombre del tamaño al momento de la venta (denormalización para auditoría)
     */
    @Column(name = "tamaño_nombre", length = 100)
    private String tamañoNombre;
    
    /**
     * Precio extra del tamaño aplicado a este item
     */
    @PositiveOrZero(message = "El precio extra del tamaño debe ser positivo o cero")
    @Column(name = "precio_extra_tamaño", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precioExtraTamaño = BigDecimal.ZERO;
    
    /**
     * Atributos seleccionados para este item (ej: ingredientes del jugo)
     */
    @OneToMany(mappedBy = "ventaItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaItemAtributoSeleccionado> atributosSeleccionados = new ArrayList<>();
}
