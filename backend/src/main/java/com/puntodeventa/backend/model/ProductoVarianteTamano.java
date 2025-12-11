package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Relación M-M entre una variante de producto y los tamaños disponibles.
 * Permite especificar qué tamaños tiene cada variante.
 */
@Entity
@Table(name = "producto_variante_tamano", uniqueConstraints = @UniqueConstraint(columnNames = { "producto_id",
        "tamano_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoVarianteTamano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @NotNull(message = "El tamaño es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamano_id", nullable = false)
    private ProductoTamano tamano;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
