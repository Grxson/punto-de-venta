package com.puntodeventa.backend.dto;

import java.io.Serializable;

/**
 * DTO para serialización de LogEntry a JSON/REST.
 * Implementa Serializable para compatibilidad con frameworks de serialización.
 */
public record LogEntryDTO(
        Long id,
        String level,
        String logger,
        String message,
        String exception,
        String timestamp,
        String thread,
        String sucursal,
        String usuario
) implements Serializable {
    
    private static final long serialVersionUID = 1L;

    /**
     * Constructor compacto (implícito en record).
     * Valida que los campos requeridos no sean nulos.
     */
    public LogEntryDTO {
        if (level == null || level.isBlank()) {
            throw new IllegalArgumentException("level no puede ser nulo o vacío");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message no puede ser nulo o vacío");
        }
        if (timestamp == null || timestamp.isBlank()) {
            throw new IllegalArgumentException("timestamp no puede ser nulo o vacío");
        }
    }

    /**
     * Crea un DTO a partir de un LogEntry.
     */
    public static LogEntryDTO from(com.puntodeventa.backend.model.LogEntry entry) {
        return new LogEntryDTO(
                entry.getId(),
                entry.getLevel(),
                entry.getLogger(),
                entry.getMessage(),
                entry.getException(),
                entry.getTimestampFormatted(),
                entry.getThread(),
                entry.getSucursal(),
                entry.getUsuario()
        );
    }

    /**
     * Retorna si es un log de error.
     */
    public boolean isError() {
        return "ERROR".equalsIgnoreCase(level);
    }

    /**
     * Retorna si es un log de advertencia.
     */
    public boolean isWarning() {
        return "WARN".equalsIgnoreCase(level);
    }

    /**
     * Retorna si contiene stack trace.
     */
    public boolean hasException() {
        return exception != null && !exception.isBlank();
    }
}
