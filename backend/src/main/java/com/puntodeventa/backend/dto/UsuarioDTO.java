package com.puntodeventa.backend.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO para Usuario con información de Rol anidada
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
     * DTO anidado para Rol dentro de Usuario
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


