package com.puntodeventa.backend.dto;

import java.time.LocalDateTime;

/**
 * Respuesta del endpoint de cambio de sucursal.
 *
 * <p>Se devuelve cuando el usuario activo cambia de sucursal: informa la sucursal elegida
 * y sus datos de contacto, de modo que el frontend pueda mostrar la confirmación y ajustar
 * el contexto de las operaciones posteriores.
 *
 * @param sucursalId     identificador de la sucursal a la que se cambió
 * @param sucursalNombre nombre visible de esa sucursal
 * @param direccion      dirección física de la sucursal
 * @param telefono       teléfono de contacto
 * @param email          correo de contacto de la sucursal
 * @param timestamp      momento exacto en que se aplicó el cambio
 */
public record CambioSucursalDTO(
    Long sucursalId,
    String sucursalNombre,
    String direccion,
    String telefono,
    String email,
    LocalDateTime timestamp
) {}
