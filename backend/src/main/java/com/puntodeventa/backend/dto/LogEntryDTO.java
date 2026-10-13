package com.puntodeventa.backend.dto;

import java.io.Serializable;

/**
 * Entrada de log expuesta por la API de monitoreo.
 *
 * <p>Es el response del endpoint de consulta de logs. Transforma la entidad de log en un
 * objeto serializable a JSON/REST.
 *
 * @param id identificador de la entrada de log
 * @param level nivel del log ({@code ERROR}, {@code WARN}, {@code INFO}, {@code DEBUG})
 * @param logger nombre del logger que emitió la entrada
 * @param message mensaje del log
 * @param exception traza de la excepción asociada, si la hay
 * @param timestamp fecha y hora del log en formato de texto
 * @param thread hilo que emitió el log
 * @param sucursal sucursal en cuyo contexto se emitió el log
 * @param usuario usuario en cuyo contexto se emitió el log
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
    /**
     * Valida que los campos requeridos estén presentes.
     *
     * @throws IllegalArgumentException si {@code level}, {@code message} o {@code timestamp}
     *                                  son nulos o vacíos
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
