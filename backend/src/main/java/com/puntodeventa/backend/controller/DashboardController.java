package com.puntodeventa.backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Controlador para servir el dashboard de monitoreo.
 * Permite acceder a /monitoring y devuelve el HTML directamente
 */
@Controller
public class DashboardController {

    /**
     * Sirve el dashboard HTML de monitoreo
     */
    @GetMapping("/monitoring")
    public ResponseEntity<String> monitoring() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/monitoring.html");
        String htmlContent = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(htmlContent);
    }
}
