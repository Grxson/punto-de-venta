package com.puntodeventa.backend.service;

import com.puntodeventa.backend.model.LogEntry;
import com.puntodeventa.backend.util.CircularLogAppender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * Servicio que mantiene un buffer circular de logs en memoria.
 * Permite filtrado, búsqueda y exportación de logs en tiempo real.
 * 
 * Thread-safe: Usa CopyOnWriteArrayList para operaciones concurrentes.
 * Circularidad: Cuando se alcanza el máximo de entradas, se remueven las más antiguas.
 */
@Service
public class LogService {

    private final List<LogEntry> logBuffer;
    private final int maxSize;
    private final Object lock = new Object();
    private long totalLogsProcessed = 0;

    public LogService(@Value("${monitoring.log.buffer-size:1000}") int maxSize) {
        this.maxSize = Math.max(100, maxSize);  // Mínimo 100 entradas
        this.logBuffer = new CopyOnWriteArrayList<>();
        
        // Inyectar este servicio en el appender de Logback
        CircularLogAppender.setLogService(this);
    }

    /**
     * Agrega una entrada de log al buffer circular.
     */
    public void addLogEntry(LogEntry logEntry) {
        synchronized (lock) {
            if (logBuffer.size() >= maxSize) {
                // Remover la más antigua (FIFO - First In First Out)
                logBuffer.remove(0);
            }
            logBuffer.add(logEntry);
            totalLogsProcessed++;
        }
    }

    /**
     * Obtiene todos los logs del buffer (últimos N).
     */
    public List<LogEntry> obtenerTodos() {
        return new ArrayList<>(logBuffer);
    }

    /**
     * Obtiene los últimos N logs.
     */
    public List<LogEntry> obtenerUltimos(int cantidad) {
        synchronized (lock) {
            int inicio = Math.max(0, logBuffer.size() - cantidad);
            return new ArrayList<>(logBuffer.subList(inicio, logBuffer.size()));
        }
    }

    /**
     * Filtra logs por nivel (ERROR, WARN, INFO, DEBUG).
     */
    public List<LogEntry> filtrarPorNivel(String nivel) {
        return logBuffer.stream()
                .filter(log -> nivel.equalsIgnoreCase(log.getLevel()))
                .collect(Collectors.toList());
    }

    /**
     * Filtra logs por múltiples niveles.
     */
    public List<LogEntry> filtrarPorNiveles(String... niveles) {
        Set<String> nivelesSet = Arrays.stream(niveles)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
        
        return logBuffer.stream()
                .filter(log -> nivelesSet.contains(log.getLevel()))
                .collect(Collectors.toList());
    }

    /**
     * Filtra logs por logger (clase que generó el log).
     */
    public List<LogEntry> filtrarPorLogger(String logger) {
        return logBuffer.stream()
                .filter(log -> log.getLogger().contains(logger))
                .collect(Collectors.toList());
    }

    /**
     * Busca logs que contengan un texto en el mensaje.
     */
    public List<LogEntry> buscarPorMensaje(String texto) {
        String textoBusqueda = texto.toLowerCase();
        return logBuffer.stream()
                .filter(log -> log.getMessage().toLowerCase().contains(textoBusqueda))
                .collect(Collectors.toList());
    }

    /**
     * Filtra logs por rango de tiempo.
     */
    public List<LogEntry> filtrarPorTiempo(LocalDateTime desde, LocalDateTime hasta) {
        return logBuffer.stream()
                .filter(log -> !log.getTimestamp().isBefore(desde) && 
                             !log.getTimestamp().isAfter(hasta))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene logs con excepciones.
     */
    public List<LogEntry> obtenerConExcepcion() {
        return logBuffer.stream()
                .filter(log -> log.getException() != null && !log.getException().isBlank())
                .collect(Collectors.toList());
    }

    /**
     * Obtiene logs de error recientes.
     */
    public List<LogEntry> obtenerErroresRecientes(int cantidad) {
        return filtrarPorNivel("ERROR").stream()
                .skip(Math.max(0, filtrarPorNivel("ERROR").size() - cantidad))
                .collect(Collectors.toList());
    }

    /**
     * Filtra logs por sucursal (si aplica).
     */
    public List<LogEntry> filtrarPorSucursal(String sucursal) {
        return logBuffer.stream()
                .filter(log -> log.getSucursal() != null && log.getSucursal().equals(sucursal))
                .collect(Collectors.toList());
    }

    /**
     * Filtra logs por usuario que los causó.
     */
    public List<LogEntry> filtrarPorUsuario(String usuario) {
        return logBuffer.stream()
                .filter(log -> log.getUsuario() != null && log.getUsuario().contains(usuario))
                .collect(Collectors.toList());
    }

    /**
     * Búsqueda combinada avanzada.
     */
    public List<LogEntry> buscarAvanzado(String nivel, String logger, String texto, 
                                        LocalDateTime desde, LocalDateTime hasta) {
        return logBuffer.stream()
                .filter(log -> nivel == null || nivel.equalsIgnoreCase(log.getLevel()))
                .filter(log -> logger == null || log.getLogger().contains(logger))
                .filter(log -> texto == null || log.getMessage().toLowerCase().contains(texto.toLowerCase()))
                .filter(log -> desde == null || !log.getTimestamp().isBefore(desde))
                .filter(log -> hasta == null || !log.getTimestamp().isAfter(hasta))
                .collect(Collectors.toList());
    }

    /**
     * Estadísticas generales de logs.
     */
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        synchronized (lock) {
            stats.put("totalLogsActuales", logBuffer.size());
            stats.put("totalLogsProcessados", totalLogsProcessed);
            stats.put("capacidadBuffer", maxSize);
            
            // Contar por nivel
            Map<String, Long> porNivel = logBuffer.stream()
                    .collect(Collectors.groupingBy(
                            LogEntry::getLevel,
                            Collectors.counting()
                    ));
            stats.put("logsPorNivel", porNivel);
            
            // Primero y último log
            if (!logBuffer.isEmpty()) {
                stats.put("primerLog", logBuffer.get(0).getTimestampFormatted());
                stats.put("ultimoLog", logBuffer.get(logBuffer.size() - 1).getTimestampFormatted());
            }
            
            // Contar loggers únicos
            Set<String> loggersUnicos = logBuffer.stream()
                    .map(LogEntry::getLogger)
                    .collect(Collectors.toSet());
            stats.put("loggersUnicos", loggersUnicos.size());
        }
        
        return stats;
    }

    /**
     * Limpia todos los logs (solo para desarrollo/debug).
     */
    public void limpiar() {
        synchronized (lock) {
            logBuffer.clear();
        }
    }

    /**
     * Exporta logs como CSV (para descarga).
     */
    public String exportarCSV() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Level,Logger,Message,Timestamp,Thread,Sucursal,Usuario\n");
        
        for (LogEntry log : logBuffer) {
            csv.append(String.format("%d,%s,%s,\"%s\",%s,%s,%s,%s\n",
                    log.getId(),
                    log.getLevel(),
                    log.getLogger(),
                    log.getMessage().replace("\"", "\"\""),  // Escapar comillas
                    log.getTimestampFormatted(),
                    log.getThread(),
                    log.getSucursal() != null ? log.getSucursal() : "",
                    log.getUsuario() != null ? log.getUsuario() : ""
            ));
        }
        
        return csv.toString();
    }

    /**
     * Obtiene el tamaño actual del buffer.
     */
    public int obtenerTamanoActual() {
        return logBuffer.size();
    }

    /**
     * Obtiene el porcentaje de capacidad del buffer.
     */
    public double obtenerPorcentajeCapacidad() {
        return (logBuffer.size() * 100.0) / maxSize;
    }
}
