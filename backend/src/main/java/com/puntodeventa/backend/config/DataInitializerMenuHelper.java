package com.puntodeventa.backend.config;

import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Helper para crear productos con variantes en el DataInitializer.
 */
public class DataInitializerMenuHelper {
    
    /**
     * Crea un producto base y sus variantes.
     * @param jdbcTemplate El JdbcTemplate para ejecutar queries
     * @param nombre Nombre del producto base
     * @param descripcion Descripción del producto base
     * @param categoriaId ID de la categoría
     * @param precioBase Precio base (se usa para la primera variante)
     * @param variantes Array de variantes, cada una con: [nombreVariante, precio]
     * @return El ID del producto base creado
     */
    public static Long crearProductoConVariantes(
            JdbcTemplate jdbcTemplate,
            String nombre,
            String descripcion,
            Long categoriaId,
            double precioBase,
            String[][] variantes) {
        
        // Verificar si ya existe
        try {
            Long idExistente = jdbcTemplate.queryForObject(
                "SELECT id FROM productos WHERE nombre = ? AND producto_base_id IS NULL",
                Long.class,
                nombre
            );
            return idExistente; // Ya existe, retornar su ID
        } catch (Exception e) {
            // No existe, crear nuevo
        }
        
        // Crear producto base
        jdbcTemplate.update(
            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            nombre, descripcion, categoriaId, precioBase, true, true, null, null, null
        );
        
        // Obtener ID del producto base creado
        Long productoBaseId = jdbcTemplate.queryForObject(
            "SELECT id FROM productos WHERE nombre = ? AND producto_base_id IS NULL",
            Long.class,
            nombre
        );
        
        // Crear variantes
        int orden = 1;
        for (String[] variante : variantes) {
            String nombreVariante = variante[0];
            double precioVariante = Double.parseDouble(variante[1]);
            
            jdbcTemplate.update(
                "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                nombre,
                descripcion + " - " + nombreVariante,
                categoriaId,
                precioVariante,
                true,
                true,
                productoBaseId,
                nombreVariante,
                orden++
            );
        }
        
        return productoBaseId;
    }
    
    /**
     * Crea un producto simple sin variantes.
     * @param jdbcTemplate El JdbcTemplate para ejecutar queries
     * @param nombre Nombre del producto
     * @param descripcion Descripción del producto
     * @param categoriaId ID de la categoría
     * @param precio Precio del producto
     */
    public static void crearProductoSimple(
            JdbcTemplate jdbcTemplate,
            String nombre,
            String descripcion,
            Long categoriaId,
            double precio) {
        
        // Verificar si ya existe
        try {
            Long idExistente = jdbcTemplate.queryForObject(
                "SELECT id FROM productos WHERE nombre = ? AND producto_base_id IS NULL",
                Long.class,
                nombre
            );
            return; // Ya existe, no crear
        } catch (Exception e) {
            // No existe, crear nuevo
        }
        
        // Crear producto simple
        jdbcTemplate.update(
            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            nombre, descripcion, categoriaId, precio, true, true, null, null, null
        );
    }
}

