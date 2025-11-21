package com.puntodeventa.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración de OpenAPI/Swagger para documentación automática de la API.
 * 
 * Esta configuración genera documentación interactiva que puede ser exportada
 * a Postman o cualquier otra herramienta de testing de APIs.
 * 
 * Endpoints:
 * - Swagger UI: http://localhost:8080/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8080/api-docs
 * - OpenAPI YAML: http://localhost:8080/api-docs.yaml
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
public class OpenApiConfig {

    @Value("${springdoc.info.title}")
    private String title;

    @Value("${springdoc.info.description}")
    private String description;

    @Value("${springdoc.info.version}")
    private String version;

    @Value("${server.port}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(serverList())
                .components(securitySchemes())
                .addSecurityItem(securityRequirement());
    }

    /**
     * Información general de la API.
     * Utiliza records de Java para estructurar datos inmutables.
     */
    private Info apiInfo() {
        return new Info()
                .title(title)
                .description(description)
                .version(version)
                .contact(new Contact()
                        .name("Grxson")
                        .url("https://github.com/Grxson/punto-de-venta")
                        .email("grxson@example.com"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    /**
     * Lista de servidores disponibles.
     * Útil para documentar diferentes entornos (dev, staging, prod).
     */
    private List<Server> serverList() {
        var devServer = new Server()
                .url("http://localhost:" + serverPort)
                .description("Servidor de Desarrollo");

        var prodServer = new Server()
                .url("https://api.puntodeventa.com")
                .description("Servidor de Producción");

        return List.of(devServer, prodServer);
    }

    /**
     * Esquemas de seguridad para la API.
     * Configura autenticación básica y JWT (para implementación futura).
     */
    private Components securitySchemes() {
        return new Components()
                .addSecuritySchemes("basicAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("basic"))
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }

    /**
     * Requerimiento de seguridad global.
     */
    private SecurityRequirement securityRequirement() {
        return new SecurityRequirement()
                .addList("basicAuth")
                .addList("bearerAuth");
    }
}
