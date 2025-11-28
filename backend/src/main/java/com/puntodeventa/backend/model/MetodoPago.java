package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un método de pago (efectivo, tarjeta, transferencia).
 */
@Entity
@Table(name = "metodos_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del método de pago es obligatorio")
    @Column(nullable = false, length = 100, unique = true)
    private String nombre;
    
    @Column(name = "requiere_referencia", nullable = false, columnDefinition = "INTEGER")
    private Boolean requiereReferencia = false;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    private Boolean activo = true;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
