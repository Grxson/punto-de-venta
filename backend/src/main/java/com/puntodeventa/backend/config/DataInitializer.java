package com.puntodeventa.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Inicializador de datos para desarrollo.
 * Carga datos de prueba en la base de datos H2 al iniciar la aplicación.
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
@Profile("dev")
public class DataInitializer {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            try {
                // Verificar si ya hay datos
                Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM usuarios", Long.class);
                if (count != null && count > 0) {
                    System.out.println(">>> Los datos de prueba ya están cargados. Usuarios existentes: " + count);
                    // FORZAR RECARGA: Limpiar datos anteriores
                    System.out.println(">>> Limpiando datos anteriores...");
                    jdbcTemplate.execute("DELETE FROM usuarios");
                    jdbcTemplate.execute("DELETE FROM roles");
                    jdbcTemplate.execute("DELETE FROM sucursales");
                    jdbcTemplate.execute("ALTER TABLE sucursales ALTER COLUMN id RESTART WITH 1");
                    jdbcTemplate.execute("ALTER TABLE roles ALTER COLUMN id RESTART WITH 1");
                    jdbcTemplate.execute("ALTER TABLE usuarios ALTER COLUMN id RESTART WITH 1");
                }

                System.out.println(">>> Cargando datos iniciales de prueba...");

                // Insertar sucursal principal
                jdbcTemplate.execute(
                    "INSERT INTO sucursales (id, nombre, direccion, telefono, email, activo, created_at) " +
                    "VALUES (1, 'Sucursal Principal', 'Calle Principal #123', '5551234567', 'principal@puntodeventa.com', true, CURRENT_TIMESTAMP)"
                );

                // Insertar roles
                jdbcTemplate.execute(
                    "INSERT INTO roles (id, nombre, descripcion, activo, created_at) " +
                    "VALUES (1, 'ADMIN', 'Administrador del sistema', true, CURRENT_TIMESTAMP)"
                );
                jdbcTemplate.execute(
                    "INSERT INTO roles (id, nombre, descripcion, activo, created_at) " +
                    "VALUES (2, 'CAJERO', 'Cajero de ventas', true, CURRENT_TIMESTAMP)"
                );
                jdbcTemplate.execute(
                    "INSERT INTO roles (id, nombre, descripcion, activo, created_at) " +
                    "VALUES (3, 'GERENTE', 'Gerente de sucursal', true, CURRENT_TIMESTAMP)"
                );

                // Generar passwords BCrypt correctamente
                String adminPassword = passwordEncoder.encode("admin123");
                String cajeroPassword = passwordEncoder.encode("cajero123");
                String gerentePassword = passwordEncoder.encode("gerente123");

                // Insertar usuarios con passwords BCrypt generados dinámicamente
                jdbcTemplate.update(
                    "INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                    1, "admin", adminPassword, "Administrador", "Sistema", "admin@puntodeventa.com", true, 1, 1
                );
                jdbcTemplate.update(
                    "INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                    2, "cajero", cajeroPassword, "Juan", "Pérez", "cajero@puntodeventa.com", true, 2, 1
                );
                jdbcTemplate.update(
                    "INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                    3, "gerente", gerentePassword, "María", "González", "gerente@puntodeventa.com", true, 3, 1
                );

                // Cargar categorías y productos de prueba
                try {
                    // Verificar si ya hay categorías
                    Long categoriaCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM categorias_productos", Long.class);
                    if (categoriaCount == null || categoriaCount == 0) {
                        System.out.println(">>> Cargando categorías y productos de prueba...");
                        
                        // Insertar categorías de productos
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (1, 'Licuados', 'Licuados de frutas', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (2, 'Jugos', 'Jugos naturales', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (3, 'Lonches', 'Lonches y sándwiches', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (4, 'Postres', 'Postres y dulces', true)"
                        );
                        
                        // Insertar productos de ejemplo
                        // Licuados
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Licuado de Fresa", "Licuado natural de fresa", 1, 35.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Licuado de Plátano", "Licuado de plátano con leche", 1, 35.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Licuado de Mango", "Licuado natural de mango", 1, 38.00, true, true
                        );
                        
                        // Jugos
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Jugo de Naranja", "Jugo natural de naranja", 2, 25.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Jugo de Zanahoria", "Jugo natural de zanahoria", 2, 28.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Jugo Verde", "Jugo de verduras y frutas", 2, 30.00, true, true
                        );
                        
                        // Lonches
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Lonche de Jamón", "Lonche con jamón, queso y vegetales", 3, 45.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Lonche de Pollo", "Lonche con pollo deshebrado", 3, 50.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mollete", "Mollete con frijoles y queso", 3, 35.00, true, true
                        );
                        
                        // Postres
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Pastel de Chocolate", "Rebanada de pastel de chocolate", 4, 40.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Flan", "Flan casero", 4, 30.00, true, true
                        );
                        
                        System.out.println(">>> ✅ Categorías y productos cargados:");
                        System.out.println("    - 4 Categorías (Licuados, Jugos, Lonches, Postres)");
                        System.out.println("    - 11 Productos de ejemplo");
                    } else {
                        System.out.println(">>> Categorías y productos ya existen (" + categoriaCount + " categorías)");
                    }
                } catch (Exception e) {
                    System.err.println(">>> ⚠️  No se pudieron cargar categorías/productos (tablas pueden no existir aún): " + e.getMessage());
                    // No es crítico, las tablas se crearán con Hibernate y Flyway las poblará
                }

                System.out.println(">>> ✅ Datos iniciales cargados correctamente:");
                System.out.println("    - 1 Sucursal");
                System.out.println("    - 3 Roles (ADMIN, CAJERO, GERENTE)");
                System.out.println("    - 3 Usuarios:");
                System.out.println("      * admin/admin123 (Administrador)");
                System.out.println("      * cajero/cajero123 (Cajero)");
                System.out.println("      * gerente/gerente123 (Gerente)");
                System.out.println(">>> Passwords generados con BCrypt:");
                System.out.println("    admin123 -> " + adminPassword);

            } catch (Exception e) {
                System.err.println(">>> ❌ Error al cargar datos iniciales: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
