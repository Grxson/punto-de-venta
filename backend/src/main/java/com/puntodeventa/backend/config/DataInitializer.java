package com.puntodeventa.backend.config;

import com.puntodeventa.backend.dto.MetodoPagoDTO;
import com.puntodeventa.backend.service.MetodoPagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.puntodeventa.backend.config.DataInitializerMenuHelper.crearProductoConVariantes;

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

    @Autowired(required = false)
    private MetodoPagoService metodoPagoService;

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

                // Cargar métodos de pago usando el servicio (más robusto)
                if (metodoPagoService != null) {
                    try {
                        var metodosExistentes = metodoPagoService.obtenerTodos();
                        if (metodosExistentes.isEmpty()) {
                            System.out.println(">>> Cargando métodos de pago...");
                            
                            // Crear métodos de pago usando el servicio
                            metodoPagoService.crear(new MetodoPagoDTO(null, "Efectivo", false, true, "Pago en efectivo"));
                            metodoPagoService.crear(new MetodoPagoDTO(null, "Tarjeta", false, true, "Pago con tarjeta de débito o crédito"));
                            metodoPagoService.crear(new MetodoPagoDTO(null, "Transferencia", true, true, "Transferencia bancaria"));
                            
                            System.out.println(">>> ✅ Métodos de pago cargados (Efectivo, Tarjeta, Transferencia)");
                        } else {
                            System.out.println(">>> Métodos de pago ya existen (" + metodosExistentes.size() + " métodos)");
                        }
                    } catch (Exception e) {
                        System.err.println(">>> ⚠️  No se pudieron cargar métodos de pago usando servicio: " + e.getMessage());
                        // Fallback: intentar con SQL directo después de un delay
                        try {
                            Thread.sleep(2000); // Esperar 2 segundos para que Hibernate cree las tablas
                            Long metodoPagoCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM metodos_pago", Long.class);
                            if (metodoPagoCount == null || metodoPagoCount == 0) {
                                System.out.println(">>> Reintentando cargar métodos de pago con SQL directo...");
                                jdbcTemplate.execute(
                                    "INSERT INTO metodos_pago (nombre, requiere_referencia, activo, descripcion) " +
                                    "VALUES ('Efectivo', false, true, 'Pago en efectivo')"
                                );
                                jdbcTemplate.execute(
                                    "INSERT INTO metodos_pago (nombre, requiere_referencia, activo, descripcion) " +
                                    "VALUES ('Tarjeta', false, true, 'Pago con tarjeta de débito o crédito')"
                                );
                                jdbcTemplate.execute(
                                    "INSERT INTO metodos_pago (nombre, requiere_referencia, activo, descripcion) " +
                                    "VALUES ('Transferencia', true, true, 'Transferencia bancaria')"
                                );
                                System.out.println(">>> ✅ Métodos de pago cargados en segundo intento (SQL directo)");
                            }
                        } catch (Exception retryException) {
                            System.err.println(">>> ❌ Error en segundo intento de cargar métodos de pago: " + retryException.getMessage());
                        }
                    }
                } else {
                    System.err.println(">>> ⚠️  MetodoPagoService no disponible, métodos de pago no se cargarán automáticamente");
                }

                // Cargar categorías y productos del menú "Jugos y Licuados Doña Chuy"
                try {
                    // Verificar si ya hay categorías
                    Long categoriaCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM categorias_productos", Long.class);
                    if (categoriaCount == null || categoriaCount == 0) {
                        System.out.println(">>> Cargando categorías y productos del menú 'Jugos y Licuados Doña Chuy'...");
                        
                        // Insertar categorías de productos
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (1, 'Jugos Naturales', 'Jugos naturales de frutas y verduras', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (2, 'Licuados y Chocomiles', 'Licuados de frutas y chocomiles', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (3, 'Desayunos', 'Desayunos y platillos del día', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (4, 'Molletes', 'Molletes dulces y salados', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (5, 'Lonches y Sandwiches', 'Lonches y sandwiches con diferentes rellenos', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (6, 'Complementos', 'Postres, bebidas y productos complementarios', true)"
                        );
                        
                        // ============================================
                        // JUGOS NATURALES (Categoría 1)
                        // ============================================
                        
                        // Naranja (separado de Toronja aunque tengan el mismo precio)
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo de Naranja", "Jugo natural de naranja", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "65.00"}});
                        
                        // Toronja (separado de Naranja aunque tengan el mismo precio)
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo de Toronja", "Jugo natural de toronja", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "65.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo de Zanahoria", "Jugo natural de zanahoria", 1L, 30.00,
                            new String[][]{{"Chico", "20.00"}, {"Mediano", "30.00"}, {"Grande", "50.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo Mixto", "Jugo mixto (naranja, zanahoria, betabel)", 1L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "55.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo Verde", "Jugo verde de verduras y frutas", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "65.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo Verde Especial", "Jugo verde especial de verduras y frutas", 1L, 50.00,
                            new String[][]{{"Chico", "35.00"}, {"Mediano", "50.00"}, {"Grande", "80.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Jugo de Betabel", "Jugo natural de betabel", 1L, 45.00,
                            new String[][]{{"Chico", "30.00"}, {"Mediano", "45.00"}, {"Grande", "70.00"}});
                        
                        // ============================================
                        // LICUADOS Y CHOCOMILES (Categoría 2)
                        // ============================================
                        
                        // Licuados separados por sabor (aunque tengan el mismo precio)
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Fresa", "Licuado de fresa", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Platano", "Licuado de plátano", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Manzana", "Licuado de manzana", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Papaya", "Licuado de papaya", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Frutas", "Licuado de frutas", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Licuado de Cereales", "Licuado de cereales", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        // Chocomiles separados por sabor
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk de Chocolate", "Chocomilk de chocolate", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk de Fresa", "Chocomilk de fresa", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk de Vainilla", "Chocomilk de vainilla", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk de Cafe", "Chocomilk de café", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk de Fresa Natural", "Chocomilk de fresa natural", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        // ============================================
                        // DESAYUNOS (Categoría 3) - Sin variantes
                        // ============================================
                        
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Chilaquiles", "Orden de chilaquiles rojos acompañados de frijoles, huevo al gusto y bolillo", 3, 65.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Huevos al gusto", "Orden de Huevos al gusto acompañados de frijoles y bolillo", 3, 45.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Waffles", "Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección", 3, 60.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mini Hot Cakes", "Mini hot cakes con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección", 3, 45.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Burritas y Quesadillas", "Burritas y quesadillas acompañadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño", 3, 15.00, true, true
                        );
                        
                        // ============================================
                        // MOLLETES (Categoría 4) - Sin variantes
                        // ============================================
                        
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes Dulces", "Molletes dulces con mantequilla, azúcar y canela", 4, 25.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes con Untado", "Molletes con untado de mermelada, nutella, lechera o miel", 4, 35.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes Salados", "Molletes salados con frijoles con queso o salsa mexicana", 4, 40.00, true, true
                        );
                        
                        // ============================================
                        // LONCHES Y SANDWICHES (Categoría 5) - Con variantes Lonche/Sandwich
                        // ============================================
                        
                        // Lonche/Sandwich de Pierna o combinado
                        crearProductoConVariantes(jdbcTemplate,
                            "Lonche/Sandwich de Pierna o Combinado", "Lonche o sandwich de pierna o combinado", 5L, 65.00,
                            new String[][]{{"Lonche", "65.00"}, {"Sandwich", "55.00"}});
                        
                        // Lonche/Sandwich de Jamón
                        crearProductoConVariantes(jdbcTemplate,
                            "Lonche/Sandwich de Jamón", "Lonche o sandwich de jamón", 5L, 45.00,
                            new String[][]{{"Lonche", "45.00"}, {"Sandwich", "35.00"}});
                        
                        // Lonche/Sandwich de Panela
                        crearProductoConVariantes(jdbcTemplate,
                            "Lonche/Sandwich de Panela", "Lonche o sandwich de panela", 5L, 55.00,
                            new String[][]{{"Lonche", "55.00"}, {"Sandwich", "45.00"}});
                        
                        // Lonche/Sandwich de Jamón y Panela
                        crearProductoConVariantes(jdbcTemplate,
                            "Lonche/Sandwich de Jamón y Panela", "Lonche o sandwich de jamón y panela", 5L, 55.00,
                            new String[][]{{"Lonche", "55.00"}, {"Sandwich", "45.00"}});
                        
                        // Lonche/Sandwich de Chilaquiles
                        crearProductoConVariantes(jdbcTemplate,
                            "Lonche/Sandwich de Chilaquiles", "Lonche o sandwich de chilaquiles", 5L, 45.00,
                            new String[][]{{"Lonche", "45.00"}, {"Sandwich", "35.00"}});
                        
                        // ============================================
                        // COMPLEMENTOS (Categoría 6) - Sin variantes
                        // ============================================
                        
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Bionicos", "Bionicos", 6, 55.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Panecitos 3 pzs", "Panecitos (3 piezas)", 6, 10.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Galletas Nuez o Avena", "Galletas de nuez o avena", 6, 10.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Pay Queso", "Pay de queso", 6, 25.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mantecadas", "Mantecadas", 6, 20.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Yakult", "Yakult", 6, 10.00, true, true
                        );
                        
                        // Contar productos totales (incluyendo variantes)
                        Long totalProductos = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos", Long.class);
                        Long productosBase = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE producto_base_id IS NULL", Long.class);
                        Long variantes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE producto_base_id IS NOT NULL", Long.class);
                        
                        System.out.println(">>> ✅ Categorías y productos del menú 'Jugos y Licuados Doña Chuy' cargados:");
                        System.out.println("    - 6 Categorías (Jugos Naturales, Licuados y Chocomiles, Desayunos, Molletes, Lonches y Sandwiches, Complementos)");
                        System.out.println("    - " + productosBase + " Productos base");
                        System.out.println("    - " + variantes + " Variantes de productos");
                        System.out.println("    - Total: " + totalProductos + " productos");
                        System.out.println("    - Productos con variantes:");
                        System.out.println("      * 7 Jugos Naturales (21 variantes: Chico/Mediano/Grande)");
                        System.out.println("      * 11 Licuados/Chocomiles (33 variantes: Chico/Mediano/Grande)");
                        System.out.println("      * 5 Lonches/Sandwiches (10 variantes: Lonche/Sandwich)");
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
