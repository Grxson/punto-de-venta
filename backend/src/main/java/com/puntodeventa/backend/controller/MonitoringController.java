package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.LogEntryDTO;
import com.puntodeventa.backend.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador REST de consulta de logs en memoria.
 *
 * Expone el buffer circular de logs para su filtrado, búsqueda y estadísticas,
 * además de un health check del propio servicio de logs.
 */
@RestController
@RequestMapping("/api/monitoring/logs")
public class MonitoringController {

    @Autowired
    private LogService logService;

    /**
     * Obtiene todos los logs retenidos en el buffer.
     *
     * @return lista de entradas de log
     */
    @GetMapping
    public ResponseEntity<List<LogEntryDTO>> obtenerTodos() {
        List<LogEntryDTO> logs = logService.obtenerTodos().stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Obtiene los logs más recientes.
     *
     * @param cantidad número de entradas a devolver; se acota a 100 si es inválido
     * @return últimas entradas de log
     */
    @GetMapping("/ultimos")
    public ResponseEntity<List<LogEntryDTO>> obtenerUltimos(@RequestParam(defaultValue = "100") int cantidad) {
        if (cantidad <= 0 || cantidad > 10000) cantidad = 100;
        List<LogEntryDTO> logs = logService.obtenerUltimos(cantidad).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Filtra los logs por un nivel único.
     *
     * @param nivel nivel de log a filtrar
     * @return entradas de ese nivel
     */
    @GetMapping("/por-nivel")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorNivel(@RequestParam String nivel) {
        List<LogEntryDTO> logs = logService.filtrarPorNivel(nivel).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Filtra los logs por varios niveles separados por comas.
     *
     * @param niveles lista de niveles separados por comas
     * @return entradas que coinciden con alguno de los niveles
     */
    @GetMapping("/por-niveles")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorNiveles(@RequestParam String niveles) {
        String[] nivelesArray = niveles.split(",");
        List<LogEntryDTO> logs = logService.filtrarPorNiveles(nivelesArray).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Filtra los logs por el nombre del logger.
     *
     * @param logger nombre del logger
     * @return entradas emitidas por ese logger
     */
    @GetMapping("/por-logger")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorLogger(@RequestParam String logger) {
        List<LogEntryDTO> logs = logService.filtrarPorLogger(logger).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Busca logs que contengan un texto en el mensaje.
     *
     * @param texto texto a buscar
     * @return entradas cuyo mensaje contiene el texto
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<LogEntryDTO>> buscarPorMensaje(@RequestParam String texto) {
        List<LogEntryDTO> logs = logService.buscarPorMensaje(texto).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Obtiene los logs que incluyen una excepción.
     *
     * @return entradas con excepción asociada
     */
    @GetMapping("/con-excepcion")
    public ResponseEntity<List<LogEntryDTO>> obtenerConExcepcion() {
        List<LogEntryDTO> logs = logService.obtenerConExcepcion().stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Obtiene los errores más recientes.
     *
     * @param cantidad número de errores a devolver
     * @return últimas entradas de error
     */
    @GetMapping("/errores-recientes")
    public ResponseEntity<List<LogEntryDTO>> obtenerErroresRecientes(@RequestParam(defaultValue = "50") int cantidad) {
        List<LogEntryDTO> logs = logService.obtenerErroresRecientes(cantidad).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    /**
     * Obtiene estadísticas agregadas del buffer de logs.
     *
     * @return métricas del servicio de logs
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(logService.obtenerEstadisticas());
    }

    /**
     * Comprueba el estado del servicio de logs.
     *
     * @return estado y tamaño actual del buffer
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = Map.of(
            "status", "UP",
            "service", "LogService",
            "logsEnBuffer", logService.obtenerTamanoActual(),
            "timestamp", LocalDateTime.now()
        );
        return ResponseEntity.ok(health);
    }
}
