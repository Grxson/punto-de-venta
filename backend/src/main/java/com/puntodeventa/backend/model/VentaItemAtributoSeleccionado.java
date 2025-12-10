package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que registra las opciones de atributos seleccionadas en un item de venta.
 * Permite auditar exactamente qué ingredientes/opciones eligió el cliente.
 * 
 * Ejemplo: Un item de "Jugo Verde" seleccionó "Naranja" e "Zanahoria" como ingredientes.
 */
@Entity
@Table(name = "venta_item_atributo_seleccionado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaItemAtributoSeleccionado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "El item de venta es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_item_id", nullable = false)
    private VentaItem ventaItem;
    
    /**
     * Referencia al atributo (nullable por si se elimina el atributo de la definición)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atributo_id")
    private ProductoAtributo atributo;
    
    /**
     * Referencia a la opción seleccionada (nullable por si se elimina la opción de la definición)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opcion_id")
    private ProductoAtributoOpcion opcion;
    
    /**
     * Valor seleccionado como string (fallback si no está registrado en la BD)
     */
    @Column(length = 255)
    private String valorSeleccionado;
    
    /**
     * Precio extra aplicado por esta opción
     */
    @PositiveOrZero(message = "El precio extra debe ser positivo o cero")
    @Column(name = "precio_extra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioExtra = BigDecimal.ZERO;
    
    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
