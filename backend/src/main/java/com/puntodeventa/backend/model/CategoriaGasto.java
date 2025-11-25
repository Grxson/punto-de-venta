package com.puntodeventa.backend.model;

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
 */
@Entity
@Table(name = "categorias_gasto", indexes = {
    @Index(name = "idx_cat_gasto_nombre", columnList = "nombre")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaGasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(precision = 12, scale = 2)
    private BigDecimal presupuestoMensual; // Opcional: presupuesto mensual para esta categoría

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;
}

