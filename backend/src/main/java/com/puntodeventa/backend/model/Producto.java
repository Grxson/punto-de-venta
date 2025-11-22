package com.puntodeventa.backend.model;

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
 * Entidad que representa un producto del menú.
 */
@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private CategoriaProducto categoria;
    
    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;
    
    @Column(name = "costo_estimado", precision = 12, scale = 4)
    private BigDecimal costoEstimado;
    
    @Column(length = 50)
    private String sku;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "disponible_en_menu", nullable = false)
    @Builder.Default
    private Boolean disponibleEnMenu = true;
}
