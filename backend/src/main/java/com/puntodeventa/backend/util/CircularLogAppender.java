package com.puntodeventa.backend.util;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.puntodeventa.backend.model.LogEntry;
import com.puntodeventa.backend.service.LogService;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Appender personalizado de Logback que captura logs en tiempo real
 * y los envía al LogService para almacenamiento en buffer circular.
 */
public class CircularLogAppender extends AppenderBase<ILoggingEvent> {
    
    private static LogService logService;

    /**
     * Inyección estática del LogService.
     * Se llama una vez que el bean está disponible.
     */
    public static void setLogService(LogService service) {
        CircularLogAppender.logService = service;
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (logService == null) {
            return;  // LogService aún no está disponible
        }

        try {
            // Convertir evento de Logback a LogEntry
            LogEntry logEntry = new LogEntry(
                    System.nanoTime(),  // ID único basado en nanosegundos
                    event.getLevel().levelStr,
                    event.getLoggerName(),
                    event.getFormattedMessage(),
                    formatThrowable(event),
                    LocalDateTime.ofInstant(
                            java.time.Instant.ofEpochMilli(event.getTimeStamp()),
                            ZoneId.systemDefault()),
                    Thread.currentThread().getName(),
                    obtenerSucursal(),
                    obtenerUsuario()
            );

            // Agregar al buffer circular
            logService.addLogEntry(logEntry);
        } catch (Exception e) {
            // No lanzar excepción en appender para no afectar la app
            e.printStackTrace(System.err);
        }
    }

    /**
     * Formatea la excepción si existe.
     */
    private String formatThrowable(ILoggingEvent event) {
        if (event.getThrowableProxy() == null) {
            return null;
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append(event.getThrowableProxy().getClassName())
                .append(": ")
                .append(event.getThrowableProxy().getMessage())
                .append("\n");

        // Agregar primeras 10 líneas del stack trace
        var elementProxies = event.getThrowableProxy().getStackTraceElementProxyArray();
        int limit = Math.min(10, elementProxies.length);
        for (int i = 0; i < limit; i++) {
            sb.append("\tat ").append(elementProxies[i].getStackTraceElement()).append("\n");
        }

        if (elementProxies.length > limit) {
            sb.append("\t... ").append(elementProxies.length - limit).append(" more");
        }

        return sb.toString();
    }

    /**
     * Obtiene la sucursal desde el contexto actual (si existe).
     * Implementar según tu lógica de negocio.
     */
    private String obtenerSucursal() {
        // TODO: Obtener de contexto de Spring Security o ThreadLocal
        return "DEFAULT";
    }

    /**
     * Obtiene el usuario actual desde el contexto.
     * Implementar según tu lógica de autenticación.
     */
    private String obtenerUsuario() {
        // TODO: Obtener de Spring Security
        return "SISTEMA";
    }
}
