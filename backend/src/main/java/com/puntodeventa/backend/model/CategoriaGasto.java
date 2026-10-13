package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Categorías de gastos para clasificación y reportes.
 * Ejemplos: Insumos, Servicios, Nómina, Renta, Mantenimiento, etc.
 * Segregadas por sucursal para dar soporte a varias sucursales: el nombre es único
 * dentro de cada sucursal, no de forma global.
 */
@Entity
@Table(name = "categorias_gasto", indexes = {
        @Index(name = "idx_cat_gasto_sucursal", columnList = "sucursal_id"),
        @Index(name = "idx_cat_gasto_activo", columnList = "activo"),
        @Index(name = "idx_cat_gasto_nombre", columnList = "nombre")
}, uniqueConstraints = {
        @UniqueConstraint(name = "unique_cat_gasto_nombre_sucursal", columnNames = { "sucursal_id", "nombre" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaGasto {

    /** Identificador único de la categoría de gasto. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** many-to-one obligatorio a la sucursal propietaria; junto con el nombre forma la clave única natural. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Nombre de la categoría; se repite entre sucursales pero es único dentro de cada una. */
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Descripción del tipo de gasto que agrupa. */
    @Column(length = 255)
    private String descripcion;

    /** Presupuesto asignado; es null si la categoría no lleva control presupuestario. */
    @Column(precision = 12, scale = 2)
    private BigDecimal presupuestoMensual; // Opcional: presupuesto mensual para esta categoría

    /** Si es false, la categoría deja de usarse en registros nuevos. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    /** Fecha de alta de la categoría. */
    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column
    private LocalDateTime updatedAt;
}