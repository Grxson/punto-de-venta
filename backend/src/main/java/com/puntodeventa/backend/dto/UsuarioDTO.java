package com.puntodeventa.backend.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Usuario del sistema, con su rol y su sucursal asignada.
 *
 * <p>Es el response de los endpoints de usuarios y del alta de sesión: nunca incluye la
 * contraseña. Se usa tanto en el panel de administración como en el login.
 *
 * @param id identificador del usuario
 * @param nombre nombre de pila del usuario
 * @param apellido apellido del usuario
 * @param email correo institucional
 * @param username nombre de acceso
 * @param activo si el usuario puede iniciar sesión
 * @param rol rol asignado al usuario
 * @param rolNombre nombre del rol; se conserva para compatibilidad hacia atrás
 * @param sucursalId sucursal a la que está asignado el usuario
 * @param ultimoAcceso momento del último inicio de sesión
 * @param createdAt momento de creación del usuario
 * @param updatedAt momento de la última modificación
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String username;
    private Boolean activo;
    private RolDTO rol;
    private String rolNombre; // Para compatibilidad hacia atrás
    private Long sucursalId;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Rol del usuario anidado dentro de su ficha.
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
    public static class RolDTO {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activo;
    }
}


