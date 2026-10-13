package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    /** Identificador único de la opción. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Atributo al que pertenece la opción; many-to-one obligatorio, un atributo agrupa varias opciones. */
    @NotNull(message = "El atributo es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atributo_id", nullable = false)
    @JsonIgnore
    private ProductoAtributo atributo;

    /** Nombre de la opción que ve el cliente. */
    @NotBlank(message = "El nombre de la opción es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Recargo que suma la opción al precio del producto; puede ser cero. */
    @NotNull(message = "El precio extra es obligatorio")
    @PositiveOrZero(message = "El precio extra debe ser positivo o cero")
    @Column(name = "precio_extra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;

    /** Posición de la opción dentro del atributo; menor número se muestra primero. */
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    /** Si es false, la opción se oculta del menú sin perder su histórico de ventas. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN")
    @Builder.Default
    private Boolean activo = true;

    /** Fecha de alta de la opción. */
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;
}
