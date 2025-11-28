package com.puntodeventa.backend.model;
import com.puntodeventa.backend.config.BooleanToIntegerConverter;

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
 */
@Entity
@Table(name = "ingredientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingrediente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del ingrediente es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(length = 100)
    private String categoria;
    
    @NotNull(message = "La unidad base es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_base_id", nullable = false)
    private Unidad unidadBase;
    
    @NotNull(message = "El costo unitario base es obligatorio")
    @PositiveOrZero(message = "El costo unitario base debe ser positivo o cero")
    @Column(name = "costo_unitario_base", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoUnitarioBase;
    
    @PositiveOrZero(message = "El stock mínimo debe ser positivo o cero")
    @Column(name = "stock_minimo", precision = 12, scale = 3)
    private BigDecimal stockMinimo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;
    
    @Column(length = 50)
    private String sku;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    @Builder.Default
    private Boolean activo = true;
}
