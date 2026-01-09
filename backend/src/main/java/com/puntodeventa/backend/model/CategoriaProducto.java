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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    // ✅ SEGREGACIÓN: Relación con sucursal
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /**
     * Lista de subcategorías de esta categoría.
     * ✅ CASCADA: Al eliminar una categoría, se eliminan automáticamente todas sus
     * subcategorías
     */
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CategoriaSubcategoria> subcategorias;
}
