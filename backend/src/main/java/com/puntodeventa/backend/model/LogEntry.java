package com.puntodeventa.backend.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Representa una entrada de log capturada del sistema.
 * Se almacena en un buffer circular en memoria para acceso rápido.
 */
public class LogEntry {
    private final Long id;
    private final String level;           // ERROR, WARN, INFO, DEBUG
    private final String logger;          // Clase que generó el log
    private final String message;         // Mensaje del log
    private final String exception;       // Stack trace si aplica
    private final LocalDateTime timestamp;
    private final String thread;          // Thread que generó el log
    private final String sucursal;        // Sucursal desde donde se generó
    private final String usuario;         // Usuario que causó el log (si aplica)

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
