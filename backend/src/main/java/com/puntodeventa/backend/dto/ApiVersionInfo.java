package com.puntodeventa.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

/**
 * Record para información de versión de la API.
 * 
 * Usa Java Record (Java 21) para crear un DTO inmutable y conciso.
 * Los records automáticamente generan constructores, getters, equals, hashCode y toString.
 * 
 * Este DTO se utiliza para que las apps móviles y de escritorio puedan
 * verificar la versión del backend y mostrarla en la interfaz.
 * 
 * @param version Versión semántica de la aplicación (ej: 1.0.0)
 * @param build Timestamp del build
 * @param javaVersion Versión de Java utilizada
 * @param description Descripción de la aplicación
 * @param timestamp Timestamp actual del servidor
 * @param environment Entorno actual (dev, prod)
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Schema(description = "Información de versión y configuración del backend")
public record ApiVersionInfo(
    @Schema(description = "Versión semántica de la API", example = "1.0.0")
    String version,
    
    @Schema(description = "Timestamp del build", example = "20231121120000")
    String build,
    
    @Schema(description = "Versión de Java", example = "21")
    String javaVersion,
    
    @Schema(description = "Descripción de la aplicación")
    String description,
    
    @Schema(description = "Timestamp actual del servidor")
    Instant timestamp,
    
    @Schema(description = "Entorno actual", example = "development")
    String environment
) {
    /**
     * Constructor compacto que valida los datos.
     * Java 21 permite agregar validación en el constructor compacto de records.
     */
    public ApiVersionInfo {
        if (version == null || version.isBlank()) {
            throw new IllegalArgumentException("La versión no puede estar vacía");
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
