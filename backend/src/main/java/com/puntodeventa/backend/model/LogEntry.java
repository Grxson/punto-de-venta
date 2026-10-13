package com.puntodeventa.backend.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Representa una entrada de log capturada del sistema.
 * Se almacena en un buffer circular en memoria para acceso rápido.
 */
public class LogEntry {
    /** Identificador secuencial de la entrada dentro del buffer. */
    private final Long id;
    /** Nivel de severidad del evento: ERROR, WARN, INFO, DEBUG. */
    private final String level;
    /** Nombre del logger (clase) que generó la entrada. */
    private final String logger;
    /** Texto del mensaje registrado. */
    private final String message;
    /** Stack trace asociado al evento; es null si no hubo excepción. */
    private final String exception;
    /** Momento en que se capturó la entrada. */
    private final LocalDateTime timestamp;
    /** Hilo de ejecución que generó la entrada. */
    private final String thread;
    /** Sucursal desde la que se generó la entrada. */
    private final String sucursal;
    /** Usuario que originó la entrada; es null si no aplica. */
    private final String usuario;

    public LogEntry(
            Long id, 
            String level, 
            String logger, 
            String message,
            String exception, 
            LocalDateTime timestamp, 
            String thread,
            String sucursal,
            String usuario) {
        this.id = id;
        this.level = level;
        this.logger = logger;
        this.message = message;
        this.exception = exception;
        this.timestamp = timestamp;
        this.thread = thread;
        this.sucursal = sucursal;
        this.usuario = usuario;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getLevel() {
        return level;
    }

    public String getLogger() {
        return logger;
    }

    public String getMessage() {
        return message;
    }

    public String getException() {
        return exception;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getTimestampFormatted() {
        return timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
    }

    public String getThread() {
        return thread;
    }

    public String getSucursal() {
        return sucursal;
    }

    public String getUsuario() {
        return usuario;
    }

    @Override
    public String toString() {
        return String.format("[%s] [%s] [%s] %s - %s",
                getTimestampFormatted(),
                level,
                logger,
                message,
                thread);
    }
}
