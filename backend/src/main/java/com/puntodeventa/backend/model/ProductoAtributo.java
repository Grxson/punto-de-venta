package com.puntodeventa.backend.model;

import com.puntodeventa.backend.config.BooleanToIntegerConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLDialect;
import org.hibernate.type.descriptor.jdbc.BooleanJdbcType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa un atributo de un producto.
 * Ejemplo: "Ingrediente del Jugo", "Salsa", "Complemento"
 * 
 * Un atributo puede ser SIMPLE (una única selección) o MULTIPLE (varias selecciones).
 */
@Entity
@Table(name = "producto_atributo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @NotBlank(message = "El nombre del atributo es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotNull(message = "El tipo es obligatorio")
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoAtributo tipo;
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean requerido = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;
    
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
