package com.puntodeventa.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;
import java.util.HashMap;
import java.util.Map;

/**
 * OPTIMIZACIÓN FASE 1: Configuración inteligente de caché con Caffeine
 * 
 * Estrategia de TTL estratificado:
 * - ESTÁTICOS (30 min): Categorías, roles, permisos (raramente cambian)
 * - SEMI-ESTÁTICOS (15 min): Productos, proveedores, unidades
 * - DINÁMICOS (5 min): Inventario, cajas activas
 * - ULTRA-DINÁMICOS (2-3 min): Menú por popularidad
 * - VENTAS (1 min): Datos de ventas del día
 * 
 * Impacto esperado: -40% latencia, +80% cache hit rate
 */
@Configuration
@EnableCaching
public class CacheConfig {

    // ===== TTL ESTRATIFICADO =====
    private static final int CACHE_STATIC_MINUTES = 30;        // Categorías
    private static final int CACHE_SEMI_STATIC_MINUTES = 15;   // Productos
    private static final int CACHE_DYNAMIC_MINUTES = 5;        // Inventario
    private static final int CACHE_MENU_MINUTES = 3;           // Menú popularidad
    private static final int CACHE_SALES_MINUTES = 1;          // Ventas

    // ===== TAMAÑOS DE CACHÉ (optimizado para 50 branches × 20 users) =====
    private static final int CACHE_STATIC_SIZE = 500;          // Categorías pequeño
    private static final int CACHE_PRODUCTS_SIZE = 5000;       // Muchos productos
    private static final int CACHE_INVENTORY_SIZE = 2000;      // Inventario
    private static final int CACHE_MENU_SIZE = 500;            // Menú limitado
    private static final int CACHE_SALES_SIZE = 1000;          // Ventas del día

    /**
     * CacheManager con cachés específicas y TTLs estratificados
     * Cada caché tiene su propio builder personalizado
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Mapear cachés a builders específicos
        cacheManager.registerCustomCache("categorias-productos", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("categorias-gastos", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("metodos-pago", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("roles", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("permisos", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("sucursales", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));
        cacheManager.registerCustomCache("unidades", 
            buildCache(CACHE_STATIC_SIZE, CACHE_STATIC_MINUTES));

        // Datos semi-estáticos (productos, proveedores)
        cacheManager.registerCustomCache("productos", 
            buildCache(CACHE_PRODUCTS_SIZE, CACHE_SEMI_STATIC_MINUTES));
        cacheManager.registerCustomCache("proveedores", 
            buildCache(CACHE_STATIC_SIZE, CACHE_SEMI_STATIC_MINUTES));
        cacheManager.registerCustomCache("ingredientes", 
            buildCache(CACHE_PRODUCTS_SIZE, CACHE_SEMI_STATIC_MINUTES));
        cacheManager.registerCustomCache("recetas", 
            buildCache(CACHE_PRODUCTS_SIZE, CACHE_SEMI_STATIC_MINUTES));

        // Datos dinámicos (inventario, cajas)
        cacheManager.registerCustomCache("inventario", 
            buildCache(CACHE_INVENTORY_SIZE, CACHE_DYNAMIC_MINUTES));
        cacheManager.registerCustomCache("turnos-activos", 
            buildCache(CACHE_DYNAMIC_MINUTES, CACHE_DYNAMIC_MINUTES));
        cacheManager.registerCustomCache("cajas-activas", 
            buildCache(CACHE_DYNAMIC_MINUTES, CACHE_DYNAMIC_MINUTES));

        // Menú por popularidad (ultra-dinámico, actualizar cada 3 min)
        cacheManager.registerCustomCache("menuPopularidad", 
            buildCache(CACHE_MENU_SIZE, CACHE_MENU_MINUTES));

        // Ventas (datos más críticos, caché muy corto)
        cacheManager.registerCustomCache("ventas-del-dia", 
            buildCache(CACHE_SALES_SIZE, CACHE_SALES_MINUTES));
        cacheManager.registerCustomCache("resumen-ventas", 
            buildCache(CACHE_SALES_SIZE, CACHE_SALES_MINUTES));

        return cacheManager;
    }

    /**
     * Builder personalizado para cada tipo de caché
     * Parámetros:
     * - maxSize: Máximo de entradas antes de evicción
     * - expirationMinutes: Minutos hasta expiración (desde escritura)
     */
    private com.github.benmanes.caffeine.cache.Cache<Object, Object> 
           buildCache(int maxSize, int expirationMinutes) {
        return Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(expirationMinutes, TimeUnit.MINUTES)
                .recordStats()  // Habilita métricas para monitoreo
                .build();
    }

    /**
     * Configuración alternativa: Usar CaffeineCacheManager con default
     * (descomentar si prefieres una configuración más simple)
     */
    // COMENTADO: Usar el cacheManager() principal arriba
    // @Bean
    // public CaffeineCacheManager defaultCaffeineCacheManager() {
    //     CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    //     cacheManager.setCaffeine(Caffeine.newBuilder()
    //             .maximumSize(5000)
    //             .expireAfterWrite(10, TimeUnit.MINUTES)
    //             .recordStats());
    //     return cacheManager;
    // }
}
