package com.puntodeventa.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.sql.SQLException;

/**
 * Configuración personalizada de Flyway.
 * En desarrollo, permite que las migraciones se ejecuten incluso si algunas tablas no existen aún
 * (Hibernate las creará automáticamente con las columnas correctas).
 */
@Configuration
@Profile("dev")
public class FlywayConfig {

    /**
     * Estrategia personalizada de migración que captura errores cuando las tablas no existen
     * (normal en desarrollo con H2 donde Hibernate crea las tablas automáticamente).
     */
    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                // Ejecutar migraciones normalmente
                flyway.migrate();
            } catch (Exception e) {
                // Capturar específicamente errores de SQL cuando la tabla no existe
                Throwable rootCause = e;
                while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
                    rootCause = rootCause.getCause();
                }
                
                // Verificar si es un error de tabla no encontrada (SQLException)
                if (rootCause instanceof SQLException) {
                    String errorMessage = rootCause.getMessage();
                    if (errorMessage != null && (
                        errorMessage.contains("Table \"PRODUCTOS\" not found") ||
                        errorMessage.contains("Table \"productos\" not found") ||
                        errorMessage.contains("Table PRODUCTOS not found") ||
                        errorMessage.contains("not found"))) {
                        System.out.println(">>> ⚠️  Migración Flyway falló porque la tabla no existe aún.");
                        System.out.println(">>> ✅ Esto es normal en desarrollo. Hibernate creará la tabla con las columnas correctas automáticamente.");
                        // Continuar sin error - Hibernate creará las tablas con las columnas correctas
                        return; // Salir sin error
                    }
                }
                
                // Verificar mensajes de error genéricos
                String errorMessage = e.getMessage();
                String rootCauseMessage = rootCause.getMessage();
                
                boolean tablaNoEncontrada = (errorMessage != null && 
                    (errorMessage.contains("Table \"PRODUCTOS\" not found") ||
                     errorMessage.contains("Table \"productos\" not found") ||
                     errorMessage.contains("Table PRODUCTOS not found") ||
                     errorMessage.contains("not found"))) ||
                    (rootCauseMessage != null && 
                    (rootCauseMessage.contains("Table \"PRODUCTOS\" not found") ||
                     rootCauseMessage.contains("Table \"productos\" not found") ||
                     rootCauseMessage.contains("Table PRODUCTOS not found") ||
                     rootCauseMessage.contains("not found")));
                
                if (tablaNoEncontrada) {
                    System.out.println(">>> ⚠️  Migración Flyway falló porque la tabla no existe aún.");
                    System.out.println(">>> ✅ Esto es normal en desarrollo. Hibernate creará la tabla con las columnas correctas automáticamente.");
                    // Continuar sin error - Hibernate creará las tablas con las columnas correctas
                    return; // Salir sin error
                }
                
                // Re-lanzar otros errores
                System.err.println(">>> ❌ Error en migración Flyway que no es de tabla no encontrada:");
                System.err.println(">>> " + e.getMessage());
                throw e;
            }
        };
    }
}

