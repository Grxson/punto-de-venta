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

/**
 * Entidad que representa una opción dentro de un atributo de producto.
 * Ejemplo: Opción "Naranja" dentro del atributo "Ingrediente del Jugo"
 */
@Entity
@Table(name = "producto_atributo_opcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributoOpcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El atributo es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atributo_id", nullable = false)
    private ProductoAtributo atributo;

    @NotBlank(message = "El nombre de la opción es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotNull(message = "El precio extra es obligatorio")
    @PositiveOrZero(message = "El precio extra debe ser positivo o cero")
    @Column(name = "precio_extra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;
}
