package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa una categoría de productos.
 */
@Entity
@Table(name = "categorias_productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaProducto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, unique = true, length = 100)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;
}
