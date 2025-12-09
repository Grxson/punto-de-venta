package com.puntodeventa.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuración para procesamiento asincrónico con Virtual Threads (Java 21).
 * 
 * En Java 21, los Virtual Threads permiten:
 * - Miles de threads sin overhead
 * - Mejor utilización de CPU
 * - Manejo automático de bloqueos
 * 
 * ThreadPoolTaskExecutor activa Virtual Threads automáticamente
 * cuando se configura con corePoolSize >= 1.
 * 
 * @author Sistema POS
 * @version 1.0
 */
@Configuration
public class AsyncConfig {

    /**
     * Executor para tareas async de MedianoPlazo (500ms - 5s).
     * Ejemplos: Cálculos de estadísticas, procesamiento de datos
     */
    @Bean(name = "asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Virtual Threads: el tamaño aquí es indicativo, no hay límite real
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        
        return executor;
    }

    /**
     * Executor para tareas de corta duración (< 500ms).
     * Ejemplos: Búsquedas rápidas, validaciones
     */
    @Bean(name = "fastAsyncExecutor")
    public Executor fastAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("fast-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        
        return executor;
    }

    /**
     * Executor para tareas pesadas (> 5s).
     * Ejemplos: Generación de reportes, procesamiento batch
     */
    @Bean(name = "heavyAsyncExecutor")
    public Executor heavyAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(3);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("heavy-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        
        return executor;
    }
}
