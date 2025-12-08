package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa la disponibilidad y configuración de un producto en una sucursal específica.
 *
 * Permite:
 * - Productos diferentes por sucursal (ej: jugos L-S mañana, alitas V-D noche)
 * - Precios diferentes por sucursal
 * - Control de disponibilidad independiente
 * - Orden de visualización por sucursal
 */
@Entity
@Table(name = "sucursal_productos", 
    indexes = {
        @Index(name = "idx_sucursal_producto_sucursal", columnList = "sucursal_id"),
        @Index(name = "idx_sucursal_producto_producto", columnList = "producto_id"),
        @Index(name = "idx_sucursal_producto_disponible", columnList = "disponible"),
        @Index(name = "idx_sucursal_producto_unique", columnList = "sucursal_id,producto_id", unique = true)
    },
    uniqueConstraints = @UniqueConstraint(columnNames = {"sucursal_id", "producto_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SucursalProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La sucursal es obligatoria")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @NotNull(message = "El producto es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    /**
     * Precio específico de esta sucursal (si es diferente al precio base del producto).
     * Si es null, se usa el precio del producto.
     */
    @Column(name = "precio_sucursal", precision = 12, scale = 2)
    private BigDecimal precioSucursal;

    /**
     * Indica si el producto está disponible en esta sucursal.
     * Permite desactivar un producto para una sucursal específica sin eliminarlo del catálogo.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean disponible = true;

    /**
     * Orden de visualización en el menú de esta sucursal.
     * Menor número = primero en el menú.
     */
    @Column(name = "orden_visualizacion")
    private Integer ordenVisualizacion;

    /**
     * Límite de existencias para esta sucursal.
     * null = sin límite.
     */
    @Column(name = "stock_maximo")
    private Integer stockMaximo;

    /**
     * Horario de disponibilidad (JSON con estructura: {"inicio": "06:00", "fin": "12:00"}).
     * null = disponible todo el día.
     */
    @Column(name = "horario_disponibilidad", columnDefinition = "TEXT")
    private String horarioDisponibilidad;

    /**
     * Días de la semana en que el producto está disponible (JSON con estructura: {"dias": [1,2,3,4,5]}).
     * 1=lunes, 2=martes, ..., 7=domingo.
     * null = disponible todos los días.
     */
    @Column(name = "dias_disponibilidad", columnDefinition = "TEXT")
    private String diasDisponibilidad;

    /**
     * Notas específicas para esta sucursal (ej: "Solo en jueves", "Con comisión especial").
     */
    @Column(length = 500)
    private String notas;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Métodos útiles

    /**
     * Obtiene el precio a usar para esta sucursal.
     * Si tiene precio específico, lo retorna. Si no, retorna el precio del producto.
     */
    public BigDecimal getPrecioEfectivo() {
        return precioSucursal != null ? precioSucursal : producto.getPrecio();
    }

    /**
     * Verifica si el producto está disponible en esta sucursal
     * considerando horario, días, y disponibilidad general.
     */
    public boolean estaDisponibleAhora() {
        if (!disponible) {
            return false;
        }

        LocalDateTime ahora = LocalDateTime.now();
        
        // TODO: Implementar validación de horario y días
        // Por ahora, solo verifica disponibilidad general
        
        return true;
    }
}
