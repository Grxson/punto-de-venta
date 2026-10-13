package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa un atributo de un producto.
 * Ejemplo: "Ingrediente del Jugo", "Salsa", "Complemento"
 * 
 * Un atributo puede ser SIMPLE (una única selección) o MULTIPLE (varias
 * selecciones).
 */
@Entity
@Table(name = "producto_atributo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributo {

    /** Identificador único del atributo. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Producto al que pertenece el atributo; many-to-one obligatorio, un producto declara varios atributos. */
    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    /** Nombre del atributo tal como se pregunta al cliente. */
    @NotBlank(message = "El nombre del atributo es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Modo de selección del atributo: SIMPLE (una opción) o MULTIPLE (varias). */
    @NotNull(message = "El tipo es obligatorio")
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoAtributo tipo;

    /** Si es true, el punto de venta exige elegir al menos una opción antes de cobrar. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN")
    @Builder.Default
    private Boolean requerido = false;

    /** Posición del atributo en el menú; menor número se muestra primero. */
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;

    /** Si es false, el atributo se oculta del menú sin eliminar sus opciones. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN")
    @Builder.Default
    private Boolean activo = true;

    /** Fecha de alta del atributo. */
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;

    /** Opciones del atributo; one-to-many en cascada: al eliminar el atributo se borran sus opciones. */
    @OneToMany(mappedBy = "atributo", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductoAtributoOpcion> opciones;

    /**
     * Enum para los tipos de atributo
     */
    public enum TipoAtributo {
        /**
         * Selección única (radio button en UI)
         */
        SIMPLE,
        /**
         * Selección múltiple (checkboxes en UI)
         */
        MULTIPLE
    }
}
