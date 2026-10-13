package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.type.SqlTypes;

/**
 * Entidad que representa una subcategoría asociada a una categoría de
 * productos.
 * Permite una relación 1:N entre CategoriaProducto y CategoriaSubcategoria.
 * ✅ SEGREGACIÓN: Cada subcategoría pertenece a una sucursal específica
 *
 * Ejemplo:
 * - Categoría: Desayunos
 * - Subcategoría: DULCES
 * - Subcategoría: LONCHES
 * - Subcategoría: SANDWICHES
 * - Subcategoría: OTROS
 */
@Entity
@Table(name = "categoria_subcategorias", indexes = {
        @Index(name = "idx_subcategorias_categoria_id", columnList = "categoria_id"),
        @Index(name = "idx_subcategorias_activa", columnList = "activa"),
        @Index(name = "idx_subcategoria_sucursal", columnList = "sucursal_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaSubcategoria {

    /** Identificador único de la subcategoría. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Categoría a la que pertenece la subcategoría; many-to-one obligatorio. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaProducto categoria;

    /** Nombre de la subcategoría dentro de su categoría. */
    @NotBlank(message = "El nombre de la subcategoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Descripción ampliada de la subcategoría. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /** Posición de la subcategoría dentro de la categoría; menor número se muestra primero. */
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    /** Si es false, la subcategoría se oculta del menú sin eliminar sus productos. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    // ✅ SEGREGACIÓN: Relación con sucursal
    /** Sucursal propietaria de la subcategoría; many-to-one obligatorio. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Fecha de alta; el valor por defecto también lo garantiza la base de datos. */
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();
}