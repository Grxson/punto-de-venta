package com.puntodeventa.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuración del procesamiento asíncrono en Java 21.
 *
 * En Java 21 los hilos virtuales permiten:
 * - Miles de hilos sin sobrecarga
 * - Mejor aprovechamiento de la CPU
 * - Manejo automático de los bloqueos
 *
 * Los ejecutores separan las tareas por duración estimada, de modo que una tarea
 * pesada no bloquea a las consultas rápidas del punto de venta.
 */
@Configuration
public class AsyncConfig {

    /**
     * Ejecutor para tareas asíncronas de duración media (500 ms a 5 s).
     * Ejemplos: cálculos de estadísticas y procesamiento de datos.
     *
     * @return ejecutor de tamaño medio ya inicializado
     */
    @Bean(name = "asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Con hilos virtuales el tamaño es orientativo, no hay un límite real
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
     * Ejecutor para tareas de corta duración (menos de 500 ms).
     * Ejemplos: búsquedas rápidas y validaciones.
     *
     * @return ejecutor rápido ya inicializado
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
     * Ejecutor para tareas pesadas (más de 5 s).
     * Ejemplos: generación de reportes y procesamiento por lotes.
     *
     * @return ejecutor de tareas pesadas ya inicializado
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
