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
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa un tamaño disponible para productos.
 * Es reutilizable entre múltiples productos/variantes.
 * Ejemplo: "Pequeño", "Mediano", "Grande"
 */
@Entity
@Table(name = "producto_tamaño")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoTamaño {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del tamaño es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @NotNull(message = "El precio extra es obligatorio")
    @PositiveOrZero(message = "El precio extra debe ser positivo o cero")
    @Column(name = "precio_extra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "tamaño", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductoVarianteTamaño> variantes;
}
