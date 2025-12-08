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

@RestController
@RequestMapping("/api/monitoring/logs")
public class MonitoringController {

    @Autowired
    private LogService logService;

    @GetMapping
    public ResponseEntity<List<LogEntryDTO>> obtenerTodos() {
        List<LogEntryDTO> logs = logService.obtenerTodos().stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/ultimos")
    public ResponseEntity<List<LogEntryDTO>> obtenerUltimos(@RequestParam(defaultValue = "100") int cantidad) {
        if (cantidad <= 0 || cantidad > 10000) cantidad = 100;
        List<LogEntryDTO> logs = logService.obtenerUltimos(cantidad).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/por-nivel")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorNivel(@RequestParam String nivel) {
        List<LogEntryDTO> logs = logService.filtrarPorNivel(nivel).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/por-niveles")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorNiveles(@RequestParam String niveles) {
        String[] nivelesArray = niveles.split(",");
        List<LogEntryDTO> logs = logService.filtrarPorNiveles(nivelesArray).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/por-logger")
    public ResponseEntity<List<LogEntryDTO>> filtrarPorLogger(@RequestParam String logger) {
        List<LogEntryDTO> logs = logService.filtrarPorLogger(logger).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<LogEntryDTO>> buscarPorMensaje(@RequestParam String texto) {
        List<LogEntryDTO> logs = logService.buscarPorMensaje(texto).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/con-excepcion")
    public ResponseEntity<List<LogEntryDTO>> obtenerConExcepcion() {
        List<LogEntryDTO> logs = logService.obtenerConExcepcion().stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/errores-recientes")
    public ResponseEntity<List<LogEntryDTO>> obtenerErroresRecientes(@RequestParam(defaultValue = "50") int cantidad) {
        List<LogEntryDTO> logs = logService.obtenerErroresRecientes(cantidad).stream()
                .map(LogEntryDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(logService.obtenerEstadisticas());
    }

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
