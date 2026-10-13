package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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
@Table(name = "producto_tamano")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoTamano {

    /** Identificador único del tamaño. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del tamaño que ve el cliente (Pequeño, Mediano, Grande). */
    @NotBlank(message = "El nombre del tamaño es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Descripción ampliada del tamaño. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /** Recargo que suma el tamaño sobre el precio base; puede ser cero. */
    @NotNull(message = "El precio extra es obligatorio")
    @PositiveOrZero(message = "El precio extra debe ser positivo o cero")
    @Column(name = "precio_extra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;

    /** Posición del tamaño en el menú; menor número se muestra primero. */
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    /** Si es false, el tamaño deja de ofrecerse en productos nuevos sin borrar su histórico. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    /** Fecha de alta del tamaño. */
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;

    /** Vínculos de este tamaño con productos; one-to-many: un tamaño se reutiliza entre varios productos. */
    @OneToMany(mappedBy = "tamano", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductoVarianteTamano> variantes;
}
