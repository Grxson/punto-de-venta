package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Entidad que representa un producto del menú.
 *
 * Admite dos niveles: un producto base, que agrupa el catálogo y del que cuelgan
 * variantes (por ejemplo "Jugo de Naranja" con "1 Litro" y "500ml"), y la propia
 * variante, que es un producto vendible con precio propio.
 *
 * El precio publicado en la entidad es el precio base del catálogo; el precio
 * efectivo por sucursal se resuelve en {@link SucursalProducto}.
 */
@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    /** Identificador único del producto. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Versión para bloqueo optimista: Hibernate rechaza el UPDATE si otro proceso ya modificó la fila. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** Nombre comercial del producto; es el texto que ve el cliente en el menú. */
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;

    /** Descripción ampliada del producto; se muestra como texto libre en el punto de venta. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /** Categoría a la que pertenece el producto; muchos productos apuntan a una misma categoría. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private CategoriaProducto categoria;

    /** Sucursal propietaria del producto, base de la segregación de datos entre sucursales. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;

    /** Precio de venta base del producto en el catálogo. */
    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    /** Costo estimado de producción, derivado de la receta; se usa para medir el margen. */
    @Column(name = "costo_estimado", precision = 12, scale = 4)
    private BigDecimal costoEstimado;

    /** Código interno de inventario que permite identificar el producto sin depender del nombre. */
    @Column(length = 50)
    private String sku;

    /** Si es false, el producto queda desactivado pero conserva su historial de ventas. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    /** Si es false, el producto se oculta del menú aunque siga activo en el catálogo. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(name = "disponible_en_menu", nullable = false)
    @Builder.Default
    private Boolean disponibleEnMenu = true;

    /**
     * many-to-one autorreferente: apunta al producto base del que es variante.
     * Si es null, este producto es un producto base o un producto sin variantes.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_base_id")
    private Producto productoBase;

    /**
     * one-to-many inverso de la relación anterior: las variantes de este producto.
     * Solo se llena si este producto NO tiene productoBase.
     */
    @OneToMany(mappedBy = "productoBase", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Producto> variantes;

    /**
     * Nombre de la variante (ej: "1 Litro", "500ml", "Bolsa 250ml", "Grande",
     * "Mediano", "Chico").
     * Solo aplica si producto_base_id no es null.
     */
    @Column(name = "nombre_variante", length = 100)
    private String nombreVariante;

    /**
     * Orden para mostrar las variantes (menor número = primero).
     * Solo aplica si producto_base_id no es null.
     */
    @Column(name = "orden_variante")
    private Integer ordenVariante;

    // ============================================================
    // Relaciones para variantes multi-paso
    // ============================================================

    /**
     * Tamaños disponibles para este producto/variante.
     * one-to-many: un producto declara varios tamaños; quitar uno lo desvincula del producto.
     */
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoVarianteTamano> tamañosDisponibles;

    /**
     * Atributos disponibles para este producto/variante (ingredientes, salsas,
     * etc.). one-to-many: cada atributo pertenece a un solo producto y sus
     * opciones se eliminan en cascada al quitarlo.
     */
    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoAtributo> atributos;
}