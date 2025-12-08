package com.puntodeventa.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuración para propiedades de monitoreo y logs en tiempo real.
 * Mapea propiedades de application.properties a esta clase.
 */
@Component
@ConfigurationProperties(prefix = "monitoring")
public class MonitoringProperties {

    private boolean enabled = true;
    private boolean requireAuth = true;
    private String apiKey = "cambiar-en-produccion";
    
    private RailwayTokenProperties railwayToken = new RailwayTokenProperties();
    private LogProperties log = new LogProperties();

    public MonitoringProperties() {
    }

    // Getters y Setters
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isRequireAuth() {
        return requireAuth;
    }

    public void setRequireAuth(boolean requireAuth) {
        this.requireAuth = requireAuth;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public RailwayTokenProperties getRailwayToken() {
        return railwayToken;
    }

    public void setRailwayToken(RailwayTokenProperties railwayToken) {
        this.railwayToken = railwayToken;
    }

    public LogProperties getLog() {
        return log;
    }

    public void setLog(LogProperties log) {
        this.log = log;
    }

    /**
     * Propiedades para Railway Token.
     */
    public static class RailwayTokenProperties {
        private String token = "";
        private boolean enabled = true;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }

    /**
     * Propiedades para configuración de logs.
     */
    public static class LogProperties {
        private int bufferSize = 1000;
        private String level = "DEBUG";
        private boolean includeStacktraces = true;

        public int getBufferSize() {
            return bufferSize;
        }

        public void setBufferSize(int bufferSize) {
            this.bufferSize = Math.max(100, bufferSize);  // Mínimo 100
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public boolean isIncludeStacktraces() {
            return includeStacktraces;
        }

        public void setIncludeStacktraces(boolean includeStacktraces) {
            this.includeStacktraces = includeStacktraces;
        }
    }
}
