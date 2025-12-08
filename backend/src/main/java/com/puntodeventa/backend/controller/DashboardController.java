package com.puntodeventa.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador para servir el dashboard de monitoreo.
 * Permite acceder a /monitoring y redirige a monitoring.html
 */
@Controller
public class DashboardController {

    /**
     * Sirve el dashboard HTML de monitoreo
     */
    @GetMapping("/monitoring")
    public String monitoring() {
        return "forward:/static/monitoring.html";
    }
}
