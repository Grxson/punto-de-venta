package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Entidad que representa una categoría de productos.
 * ✅ SEGREGACIÓN: Cada categoría pertenece a una sucursal específica
 */
@Entity
@Table(name = "categorias_productos", indexes = {
        @Index(name = "idx_categoria_sucursal", columnList = "sucursal_id"),
        @Index(name = "idx_categoria_activa", columnList = "activa")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaProducto {

    /** Identificador único de la categoría. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre de la categoría tal como aparece en el menú. */
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Descripción ampliada de la categoría. */
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    /** Posición de la categoría en el menú; menor número se muestra primero. */
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    /** Si es false, la categoría se oculta del menú sin eliminar sus productos. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    // ✅ SEGREGACIÓN: Relación con sucursal
    /** Sucursal propietaria de la categoría; many-to-one obligatorio que aísla el catálogo por sucursal. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /**
     * Lista de subcategorías de esta categoría.
     * one-to-many en cascada: cada subcategoría pertenece a una sola categoría
     * y se elimina con ella.
     * ✅ CASCADA: Al eliminar una categoría, se eliminan automáticamente todas sus
     * subcategorías
     */
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CategoriaSubcategoria> subcategorias;
}