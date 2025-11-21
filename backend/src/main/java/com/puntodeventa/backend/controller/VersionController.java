package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ApiVersionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

/**
 * Controlador para obtener información de versión y estado de la API.
 * 
 * Este controlador proporciona endpoints públicos para que las apps móviles
 * y de escritorio puedan verificar la versión del backend y su estado.
 * 
 * Usa características de Java 21:
 * - Records para DTOs inmutables
 * - Pattern matching en switch (si se necesita)
 * - Virtual threads habilitados automáticamente por Spring Boot 3.5
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@RestController
@RequestMapping("/api/version")
@Tag(name = "Información del Sistema", description = "Endpoints para obtener información de versión y estado")
public class VersionController {

    @Value("${app.version}")
    private String appVersion;

    @Value("${app.build}")
    private String appBuild;

    @Value("${app.description}")
    private String appDescription;

    @Value("${java.version}")
    private String javaVersion;

    private final Environment environment;

    public VersionController(Environment environment) {
        this.environment = environment;
    }

    /**
     * Obtiene la información de versión de la API.
     * 
     * Este endpoint es público y no requiere autenticación.
     * Útil para que las apps móviles y de escritorio puedan:
     * - Verificar compatibilidad de versiones
     * - Mostrar versión en la interfaz
     * - Detectar si hay actualizaciones disponibles
     * 
     * @return Información de versión de la API
     */
    @GetMapping
    @Operation(
        summary = "Obtener información de versión",
        description = "Retorna información sobre la versión actual de la API, " +
                     "build timestamp, versión de Java y entorno activo"
    )
    public ResponseEntity<ApiVersionInfo> getVersion() {
        var versionInfo = new ApiVersionInfo(
            appVersion,
            appBuild,
            javaVersion,
            appDescription,
            Instant.now(),
            getCurrentEnvironment()
        );
        
        return ResponseEntity.ok(versionInfo);
    }

    /**
     * Obtiene el entorno activo actual.
     * Usa pattern matching de Java 21 para simplificar la lógica.
     * 
     * @return Nombre del entorno activo
     */
    private String getCurrentEnvironment() {
        String[] activeProfiles = environment.getActiveProfiles();
        
        // Si no hay perfiles activos, usar "default"
        if (activeProfiles.length == 0) {
            return "default";
        }
        
        // Retornar el primer perfil activo
        return activeProfiles[0];
    }
}
