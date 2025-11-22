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
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre de la unidad es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotBlank(message = "La abreviatura de la unidad es obligatoria")
    @Column(nullable = false, length = 10)
    private String abreviatura;
    
    @NotNull(message = "El factor base es obligatorio")
    @Positive(message = "El factor base debe ser positivo")
    @Column(name = "factor_base", nullable = false, precision = 12, scale = 6)
    private BigDecimal factorBase;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
