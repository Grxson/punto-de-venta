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
     * Inyecta el {@link LogService} de forma estática.
     * Logback instancia el appender antes de que exista el contexto de Spring,
     * por eso se invoca una única vez cuando el bean ya está disponible.
     *
     * @param service Servicio destino de las entradas de log.
     */
    public static void setLogService(LogService service) {
        CircularLogAppender.logService = service;
    }

    /**
     * Traduce cada evento de Logback a una entrada de bitácora y la encola.
     * Los errores se absorben a propósito: fallar al registrar un log nunca debe
     * propagarse al flujo de negocio de la aplicación.
     *
     * @param event Evento emitido por Logback.
     */
    @Override
    protected void append(ILoggingEvent event) {
        if (logService == null) {
            return;  // LogService aún no está disponible
        }

        try {
            // Convertir evento de Logback a LogEntry
            LogEntry logEntry = new LogEntry(
                    System.nanoTime(),  // el nanosegundo evita colisiones de id en ráfagas
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
     * Serializa la excepción asociada al evento, si la hay.
     * El traza se trunca a 10 líneas porque el buffer circular es de tamaño
     * acotado y una pila completa consumiría el espacio de otras entradas.
     *
     * @param event Evento emitido por Logback.
     * @return Traza formateada, o {@code null} si el evento no trae excepción.
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
     * Resuelve la sucursal activa para etiquetar la entrada de bitácora.
     * @return Identificador de sucursal, o {@code "DEFAULT"} si no hay contexto.
     */
    private String obtenerSucursal() {
        // TODO: Obtener de contexto de Spring Security o ThreadLocal
        return "DEFAULT";
    }

    /**
     * Resuelve el usuario responsable de la operación para etiquetar la entrada.
     * @return Nombre de usuario, o {@code "SISTEMA"} si no hay contexto.
     */
    private String obtenerUsuario() {
        // TODO: Obtener de Spring Security
        return "SISTEMA";
    }
}
