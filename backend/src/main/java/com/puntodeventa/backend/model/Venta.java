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
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa una venta realizada en el punto de venta.
 * Estados: PENDIENTE, PAGADA, CANCELADA
 */
@Entity
@Table(name = "ventas", indexes = {
    @Index(name = "idx_venta_fecha", columnList = "fecha"),
    @Index(name = "idx_venta_estado", columnList = "estado"),
    @Index(name = "idx_venta_sucursal", columnList = "sucursal_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @NotNull(message = "La fecha de la venta es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;
    
    @NotNull(message = "El subtotal es obligatorio")
    @PositiveOrZero(message = "El subtotal debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    @NotNull(message = "El total es obligatorio")
    @PositiveOrZero(message = "El total debe ser positivo o cero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;
    
    // TODO: Implementar cálculo de IVA (pendiente)
    @PositiveOrZero(message = "Los impuestos deben ser positivos o cero")
    @Column(precision = 12, scale = 2)
    private BigDecimal impuestos = BigDecimal.ZERO;
    
    // TODO: Implementar sistema de descuentos (pendiente)
    @PositiveOrZero(message = "El descuento debe ser positivo o cero")
    @Column(precision = 12, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @Column(length = 50)
    private String canal = "POS"; // POS, WEB, MOVIL
    
    @NotNull(message = "El estado es obligatorio")
    @Column(nullable = false, length = 20)
    private String estado = "PAGADA"; // PENDIENTE, PAGADA, CANCELADA
    
    @Column(columnDefinition = "TEXT")
    private String nota;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Usuario que registró la venta
    
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaItem> items = new ArrayList<>();
    
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Pago> pagos = new ArrayList<>();
    
    /**
     * Método helper para agregar items a la venta
     */
    public void addItem(VentaItem item) {
        items.add(item);
        item.setVenta(this);
    }
    
    /**
     * Método helper para agregar pagos a la venta
     */
    public void addPago(Pago pago) {
        pagos.add(pago);
        pago.setVenta(this);
    }
}
