package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.type.SqlTypes;

/**
 * Entidad que representa una subcategoría asociada a una categoría de productos.
 * Permite una relación 1:N entre CategoriaProducto y CategoriaSubcategoria.
 * 
 * Ejemplo:
 * - Categoría: Desayunos
 *   - Subcategoría: DULCES
 *   - Subcategoría: LONCHES
 *   - Subcategoría: SANDWICHES
 *   - Subcategoría: OTROS
 */
@Entity
@Table(name = "categoria_subcategorias", indexes = {
    @Index(name = "idx_subcategorias_categoria_id", columnList = "categoria_id"),
    @Index(name = "idx_subcategorias_activa", columnList = "activa")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaSubcategoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaProducto categoria;
    
    @NotBlank(message = "El nombre de la subcategoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false)
    @ColumnDefault("1")
    @Builder.Default
    private Boolean activa = true;
    
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
    
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();
}
