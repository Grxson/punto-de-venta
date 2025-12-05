package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transferencia de datos de Rol
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
