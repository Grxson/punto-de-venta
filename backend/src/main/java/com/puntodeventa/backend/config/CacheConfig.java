package com.puntodeventa.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuración de caché con Caffeine para mejorar el rendimiento
 * de consultas frecuentes a datos que cambian poco.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configuración de cachés por tipo de dato:
     * - Estáticos (10 min): categorías, métodos de pago, roles
     * - Semi-estáticos (5 min): productos, proveedores, ingredientes
     * - Dinámicos (1 min): inventario, turnos activos
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                // Catálogos estáticos (cambian poco)
                "categorias-productos",
                "categorias-gastos",
                "metodos-pago",
                "roles",
                "permisos",
                "sucursales",
                "unidades",

                // Datos semi-estáticos (actualizaciones ocasionales)
                "productos",
                "proveedores",
                "ingredientes",
                "recetas",

                // Datos dinámicos (actualizaciones frecuentes, caché corto)
                "inventario",
                "turnos-activos",
                "cajas-activas",

                // Menú por popularidad (dinámico)
                "menuPopularidad");

        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }

    /**
     * Configuración de Caffeine:
     * - Tamaño máximo: 1000 entradas por caché
     * - Expiración: 10 minutos después de escribir (se puede personalizar por
     * caché)
     * - Métricas: habilitadas para monitoreo
     */
    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats(); // Habilita métricas de hit/miss
    }
}
