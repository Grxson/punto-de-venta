package com.puntodeventa.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Componente que muestra información útil al iniciar la aplicación
 */
@Component
public class StartupInfo {

    private static final Logger log = LoggerFactory.getLogger(StartupInfo.class);
    private final Environment environment;

    public StartupInfo(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            String protocol = "http";
            String serverPort = environment.getProperty("server.port", "8080");
            String contextPath = environment.getProperty("server.servlet.context-path", "");
            // Normalizar context-path: si es "/" o está vacío, usar cadena vacía para evitar doble barra
            if (contextPath == null || contextPath.equals("/") || contextPath.isEmpty()) {
                contextPath = "";
            }
            // Asegurar que contextPath termine con / si no está vacío
            if (!contextPath.isEmpty() && !contextPath.endsWith("/")) {
                contextPath = contextPath + "/";
            }
            String hostAddress = InetAddress.getLocalHost().getHostAddress();
            String hostName = InetAddress.getLocalHost().getHostName();
            String profile = String.join(", ", environment.getActiveProfiles());
            if (profile.isEmpty()) {
                profile = "default";
            }

            // Construir URLs base (sin barra final para evitar problemas)
            String baseUrl = protocol + "://localhost:" + serverPort + contextPath;
            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
            }
            String externalUrl = protocol + "://" + hostAddress + ":" + serverPort + contextPath;
            if (externalUrl.endsWith("/")) {
                externalUrl = externalUrl.substring(0, externalUrl.length() - 1);
            }
            
            log.info("\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "  ✅ Aplicación iniciada correctamente\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "  📍 Perfil activo:     {}\n" +
                    "  🌐 URL local:         {}\n" +
                    "  🌐 URL externa:       {}\n" +
                    "  📚 Swagger UI:        {}/swagger-ui.html\n" +
                    "  📄 API Docs (JSON):   {}/api-docs\n" +
                    "  🗄️  H2 Console:        {}/h2-console\n" +
                    "  💚 Health Check:      {}/actuator/health\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                    profile,
                    baseUrl,
                    externalUrl,
                    baseUrl,
                    baseUrl,
                    baseUrl,
                    baseUrl);
        } catch (UnknownHostException e) {
            log.warn("No se pudo determinar la dirección del host", e);
        }
    }
}

