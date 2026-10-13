package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sucursal del negocio.
 *
 * <p>Se envía como request al crear o editar una sucursal y se devuelve como response en
 * las consultas del panel de administración.
 *
 * @param id identificador de la sucursal
 * @param nombre nombre visible de la sucursal
 * @param direccion dirección física de la sucursal
 * @param telefono teléfono de contacto de la sucursal
 * @param activo si la sucursal puede operar
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SucursalDTO {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private Boolean activo;
}
