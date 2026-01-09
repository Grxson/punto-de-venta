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
 * Segregadas por sucursal para multi-branch support.
 */
@Entity
@Table(name = "categorias_gasto", indexes = {
    @Index(name = "idx_cat_gasto_sucursal", columnList = "sucursal_id"),
    @Index(name = "idx_cat_gasto_activo", columnList = "activo"),
    @Index(name = "idx_cat_gasto_nombre", columnList = "nombre")
}, uniqueConstraints = {
    @UniqueConstraint(name = "unique_cat_gasto_nombre_sucursal", columnNames = {"sucursal_id", "nombre"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(precision = 12, scale = 2)
    private BigDecimal presupuestoMensual; // Opcional: presupuesto mensual para esta categoría

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;
}


