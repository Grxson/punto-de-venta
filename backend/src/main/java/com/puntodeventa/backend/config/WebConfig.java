package com.puntodeventa.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de Web MVC para asegurar que las rutas /api/** se mapeen correctamente
 * a los controladores REST y no a recursos estáticos.
 * 
 * También configura CORS para permitir requests desde el frontend en desarrollo y producción.
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configuración CORS global para permitir requests del frontend
        registry.addMapping("/api/**")
            .allowedOriginPatterns(
                "http://localhost:.*",
                "http://127\\.0\\.0\\.1:.*",
                "https://.*\\.up\\.railway\\.app"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
        
        // CORS para websockets - SockJS hace requests HTTP a /ws/info
        registry.addMapping("/ws/**")
            .allowedOriginPatterns(
                "http://localhost:.*",
                "http://127\\.0\\.0\\.1:.*",
                "https://.*\\.up\\.railway\\.app"
            )
            .allowedMethods("GET", "POST", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar recursos estáticos solo para rutas específicas
        // Las rutas /api/** NO deben ser tratadas como recursos estáticos
        // Con spring.web.resources.add-mappings=false en application.properties,
        // solo estos handlers específicos estarán activos
        registry
            .addResourceHandler("/static/**", "/public/**", "/resources/**")
            .addResourceLocations("classpath:/static/", "classpath:/public/", "classpath:/resources/");
        
        // Swagger UI resources
        registry
            .addResourceHandler("/swagger-ui/**", "/v3/api-docs/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/springdoc-openapi-ui/");
    }
}

