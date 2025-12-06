package com.puntodeventa.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de cambio de sucursal.
 */
public record CambioSucursalDTO(
    Long sucursalId,
    String sucursalNombre,
    String direccion,
    String telefono,
    String email,
    LocalDateTime timestamp
) {}
