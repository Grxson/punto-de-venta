package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Entidad que representa una receta (BOM - Bill of Materials).
 * Define qué ingredientes y en qué cantidad se necesitan para preparar un producto.
 */
@Entity
@Table(name = "recetas")
@IdClass(RecetaId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receta {
    
    /** Parte de la clave compuesta: identificador del producto al que pertenece el renglón de receta. */
    @Id
    @Column(name = "producto_id")
    private Long productoId;
    
    /** Parte de la clave compuesta: identificador del ingrediente consumido por el producto. */
    @Id
    @Column(name = "ingrediente_id")
    private Long ingredienteId;
    
    /** Producto asociado; many-to-one mapeado sobre la misma columna de la clave, solo lectura. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", insertable = false, updatable = false)
    private Producto producto;
    
    /** Ingrediente asociado; many-to-one mapeado sobre la misma columna de la clave, solo lectura. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id", insertable = false, updatable = false)
    private Ingrediente ingrediente;
    
    /** Cantidad del ingrediente necesaria para preparar el producto. */
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    @Column(nullable = false, precision = 12, scale = 6)
    private BigDecimal cantidad;
    
    /** Unidad en la que se expresa la cantidad del ingrediente; many-to-one obligatorio. */
    @NotNull(message = "La unidad es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_id", nullable = false)
    private Unidad unidad;
    
    /** Porcentaje de merma previsto en la preparación; se usa para inflar el costo teórico del producto. */
    @PositiveOrZero(message = "La merma teórica debe ser entre 0 y 1")
    @Column(name = "merma_teorica", precision = 6, scale = 4)
    @Builder.Default
    private BigDecimal mermaTeorica = BigDecimal.ZERO;
}
