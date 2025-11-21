package com.puntodeventa.backend.dto;
import java.time.LocalDateTime;
import java.util.Set;


public record UsuarioDTO(
    Long id,
    String nombre,
    String apellido,
    String email,
    String username,
    Boolean activo,
    String rolNombre,
    Long sucursalId,
    LocalDateTime ultimoAcceso,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}


