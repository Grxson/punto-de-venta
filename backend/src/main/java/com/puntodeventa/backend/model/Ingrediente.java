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

/**
 * Entidad que representa un ingrediente o insumo del inventario.
 *
 * Es la base del control de costo: guarda el costo unitario ya convertido a la
 * unidad base, de modo que el costo de una receta se pueda calcular sin
 * depender de la unidad en la que se compró el insumo.
 */
@Entity
@Table(name = "ingredientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingrediente {

    /** Identificador único del ingrediente. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del ingrediente o insumo. */
    @NotBlank(message = "El nombre del ingrediente es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;

    /** Descripción ampliada del insumo. */
    @Column(length = 500)
    private String descripcion;

    /** Clasificación libre del insumo dentro del inventario. */
    @Column(length = 100)
    private String categoria;

    // VINCULACIÓN A GASTO
    /** many-to-one opcional al gasto que originó la compra del insumo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gasto_id")
    private Gasto gasto;

    /** Importe total del gasto de compra que respalda el costo del insumo. */
    @Column(name = "costo_total_gasto", precision = 14, scale = 6)
    private BigDecimal costoTotalGasto;

    // CONVERSIÓN DE UNIDADES
    /** many-to-one a la unidad en la que se capturó el gasto; es la unidad de compra original. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidad_gasto_id")
    private Unidad unidadGasto;

    /** Descripción de la conversión aplicada entre la unidad de compra y la unidad base. */
    @Column(name = "factor_conversion", length = 100)
    private String factorConversion;

    // RESULTADO FINAL
    /** Unidad en la que se normaliza el insumo; base de todos los cálculos de costo. */
    @NotNull(message = "La unidad base es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unidad_base_id", nullable = false)
    private Unidad unidadBase;

    /** Costo por unidad base; es la cifra que consumen las recetas para costear productos. */
    @NotNull(message = "El costo unitario base es obligatorio")
    @PositiveOrZero(message = "El costo unitario base debe ser positivo o cero")
    @Column(name = "costo_unitario_base", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoUnitarioBase;

    /** Umbral que dispara la alerta de reorden; es null si el insumo no lleva control de mínimo. */
    @PositiveOrZero(message = "El stock mínimo debe ser positivo o cero")
    @Column(name = "stock_minimo", precision = 12, scale = 3)
    private BigDecimal stockMinimo;

    /** Existencias actuales en la unidad base; se actualiza con cada movimiento de inventario. */
    @Column(name = "stock_actual", nullable = false, precision = 14, scale = 6)
    @Builder.Default
    private BigDecimal stockActual = BigDecimal.ZERO;

    /** Versión para bloqueo optimista: evita que dos movimientos descuenten el mismo stock. */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /** many-to-one opcional al proveedor habitual del insumo. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    /** Código interno del insumo en el inventario. */
    @Column(length = 50)
    private String sku;

    /** Si es false, el insumo queda fuera de los cálculos sin perder su historial. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean activo = true;
}