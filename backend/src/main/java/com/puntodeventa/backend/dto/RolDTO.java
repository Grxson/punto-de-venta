package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Rol de usuario, que agrupa los permisos que se conceden.
 *
 * <p>Se envía como request al crear o editar un rol y se devuelve como response en las
 * consultas de administración de usuarios.
 *
 * @param id identificador del rol
 * @param nombre nombre del rol
 * @param descripcion detalle de las funciones del rol
 * @param activo si el rol puede asignarse a nuevos usuarios
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
