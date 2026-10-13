package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Entidad que representa una unidad de medida para ingredientes.
 * Ejemplos: gramos (g), mililitros (ml), piezas (pza), kilogramos (kg), litros (L)
 */
@Entity
@Table(name = "unidades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unidad {

    /** Identificador único de la unidad de medida. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre completo de la unidad (gramos, mililitros, piezas). */
    @NotBlank(message = "El nombre de la unidad es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Símbolo corto de la unidad (g, ml, kg) que se muestra junto a las cantidades. */
    @NotBlank(message = "La abreviatura de la unidad es obligatoria")
    @Column(nullable = false, length = 10)
    private String abreviatura;

    /** Cuántas unidades base equivalen a una unidad de esta medida; normaliza las conversiones de inventario. */
    @NotNull(message = "El factor base es obligatorio")
    @Positive(message = "El factor base debe ser positivo")
    @Column(name = "factor_base", nullable = false, precision = 12, scale = 6)
    private BigDecimal factorBase;

    /** Detalle de la equivalencia de la unidad. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}