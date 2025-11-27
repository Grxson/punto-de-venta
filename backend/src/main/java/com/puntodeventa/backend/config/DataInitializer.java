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
import static com.puntodeventa.backend.config.DataInitializerMenuHelper.crearProductoSimple;

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
                            "VALUES (1, 'Jugos', 'Jugos naturales de frutas y verduras', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (2, 'Licuados y Chocomiles', 'Licuados de frutas y chocomiles', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (3, 'Desayunos', 'Desayunos, molletes, lonches y sandwiches', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (4, 'Adicionales', 'Ingredientes y adiciones extra', true)"
                        );
                        jdbcTemplate.execute(
                            "INSERT INTO categorias_productos (id, nombre, descripcion, activa) " +
                            "VALUES (5, 'Complementos', 'Postres, bebidas y productos complementarios', true)"
                        );
                        
                        // ============================================
                        // JUGOS (Categoría 1) - Actualizados según menú (Chico/Mediano/Grande)
                        // ============================================

                        // Naranja y Toronja separados (aunque tengan el mismo precio)
                        crearProductoConVariantes(jdbcTemplate,
                            "Naranja", "Jugo natural de naranja", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "65.00"}});

                        crearProductoConVariantes(jdbcTemplate,
                            "Toronja", "Jugo natural de toronja", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "65.00"}});

                        crearProductoConVariantes(jdbcTemplate,
                            "Zanahoria", "Jugo natural de zanahoria", 1L, 30.00,
                            new String[][]{{"Chico", "20.00"}, {"Mediano", "30.00"}, {"Grande", "50.00"}});

                        crearProductoConVariantes(jdbcTemplate,
                            "Mixto", "Jugo mixto (naranja, zanahoria, betabel)", 1L, 35.00,
                            new String[][]{{"Chico", "22.00"}, {"Mediano", "35.00"}, {"Grande", "55.00"}});

                        crearProductoConVariantes(jdbcTemplate,
                            "Verde", "Jugo verde de verduras y frutas (apio, perejil, nopal, espinaca, piña)", 1L, 40.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "40.00"}, {"Grande", "70.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Verde Especial", "Jugo verde especial de verduras y frutas", 1L, 50.00,
                            new String[][]{{"Chico", "30.00"}, {"Mediano", "50.00"}, {"Grande", "90.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Mixto Betabel", "Jugo mixto con betabel", 1L, 45.00,
                            new String[][]{{"Chico", "28.00"}, {"Mediano", "45.00"}, {"Grande", "80.00"}});
                        
                        // ============================================
                        // LICUADOS Y CHOCOMILES (Categoría 2) - Separados por sabor (Chico/Mediano/Grande)
                        // ============================================
                        
                        // Licuados separados por sabor (aunque tengan el mismo precio)
                        crearProductoConVariantes(jdbcTemplate,
                            "Fresa", "Licuado de fresa", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Platano", "Licuado de plátano", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Manzana", "Licuado de manzana", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Papaya", "Licuado de papaya", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Frutas", "Licuado de frutas", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Cereales", "Licuado de cereales", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        // Chocomiles separados por sabor (con prefijo para diferenciarlos de licuados)
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk Chocolate", "Chocomilk de chocolate", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk Fresa", "Chocomilk de fresa", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk Vainilla", "Chocomilk de vainilla", 2L, 25.00,
                            new String[][]{{"Chico", "18.00"}, {"Mediano", "25.00"}, {"Grande", "40.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk Cafe", "Chocomilk de café", 2L, 35.00,
                            new String[][]{{"Chico", "25.00"}, {"Mediano", "35.00"}, {"Grande", "60.00"}});
                        
                        crearProductoConVariantes(jdbcTemplate,
                            "Chocomilk Fresa Natural", "Chocomilk de fresa natural", 2L, 35.00,
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
                            "Huevos al gusto", "Orden de Huevos al gusto acompañados de frijoles y bolillo", 3, 50.00, true, true
                        );
                        
                        // Waffles con variantes Chico/Grande
                        crearProductoConVariantes(jdbcTemplate,
                            "Waffles", "Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección", 3L, 60.00,
                            new String[][]{{"Chico", "35.00"}, {"Grande", "60.00"}});
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mini Hot Cakes (15 pzs)", "Mini hot cakes (15 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección", 3, 55.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mini Hot Cakes (10 pzs)", "Mini hot cakes (10 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección", 3, 45.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Burritas y Quesadillas", "Burritas y quesadillas acompañadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño", 3, 15.00, true, true
                        );
                        
                        // MOLLETES (ahora en Desayunos)
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes Dulces", "Molletes dulces con mantequilla, azúcar y canela", 3, 30.00, true, true
                            );
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes con Untado", "Molletes con untado de mermelada, nutella, lechera o miel", 3, 35.00, true, true
                            );
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Molletes Salados", "Molletes salados con frijoles con queso o salsa mexicana", 3, 40.00, true, true
                        );
                        
                        // LONCHES Y SANDWICHES (ahora en Desayunos) - Separados individualmente
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Lonches y Sincronizadas", "Lonches y sincronizadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño", 3, 35.00, true, true
                        );
                        
                        // Lonches separados
                        crearProductoSimple(jdbcTemplate, "Lonche de Pierna o Combinado", "Lonche de pierna o combinado", 3L, 65.00);
                        crearProductoSimple(jdbcTemplate, "Lonche de Jamón", "Lonche de jamón", 3L, 45.00);
                        crearProductoSimple(jdbcTemplate, "Lonche de Panela", "Lonche de panela", 3L, 55.00);
                        crearProductoSimple(jdbcTemplate, "Lonche de Jamón y Panela", "Lonche de jamón y panela", 3L, 55.00);
                        crearProductoSimple(jdbcTemplate, "Lonche de Chilaquiles", "Lonche de chilaquiles", 3L, 45.00);
                        
                        // Sandwiches separados
                        crearProductoSimple(jdbcTemplate, "Sandwich de Pierna o Combinado", "Sandwich de pierna o combinado", 3L, 55.00);
                        crearProductoSimple(jdbcTemplate, "Sandwich de Jamón", "Sandwich de jamón", 3L, 35.00);
                        crearProductoSimple(jdbcTemplate, "Sandwich de Panela", "Sandwich de panela", 3L, 45.00);
                        crearProductoSimple(jdbcTemplate, "Sandwich de Jamón y Panela", "Sandwich de jamón y panela", 3L, 45.00);
                        crearProductoSimple(jdbcTemplate, "Sandwich de Chilaquiles", "Sandwich de chilaquiles", 3L, 35.00);
                        
                        // ============================================
                        // ADICIONALES (Categoría 4) - Sin variantes
                        // ============================================
                        
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Miel", "Miel", 4, 5.00, true, true
                            );
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Deslactosada", "Leche deslactosada", 4, 5.00, true, true
                            );
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Cereal", "Cereal", 4, 5.00, true, true
                            );
                            jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Rompope, Jerez", "Rompope o jerez", 4, 15.00, true, true
                            );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Huevo Pata", "Huevo de pata", 4, 15.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Huevo Gallina", "Huevo de gallina", 4, 5.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Huevo Codorniz", "Huevo de codorniz", 4, 2.50, true, true
                        );
                        
                        // ============================================
                        // COMPLEMENTOS (Categoría 5) - Sin variantes
                        // ============================================
                        
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Bionicos", "Bionicos", 5, 55.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Panecitos 3 pzs", "Panecitos (3 piezas)", 5, 10.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Galletas Nuez o Avena", "Galletas de nuez o avena", 5, 10.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Pay Queso", "Pay de queso", 5, 25.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Mantecadas", "Mantecadas", 5, 25.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Yakult", "Yakult", 5, 10.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Cafe", "Café", 5, 20.00, true, true
                        );
                        jdbcTemplate.update(
                            "INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu) " +
                            "VALUES (?, ?, ?, ?, ?, ?)",
                            "Té", "Té", 5, 15.00, true, true
                        );
                        
                        // Contar productos totales (incluyendo variantes)
                        Long totalProductos = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos", Long.class);
                        Long productosBase = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE producto_base_id IS NULL", Long.class);
                        Long variantes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE producto_base_id IS NOT NULL", Long.class);
                        
                        System.out.println(">>> ✅ Categorías y productos del menú 'Jugos y Licuados Doña Chuy' cargados:");
                        System.out.println("    - 5 Categorías (Jugos, Licuados y Chocomiles, Desayunos, Adicionales, Complementos)");
                        System.out.println("    - " + productosBase + " Productos base");
                        System.out.println("    - " + variantes + " Variantes de productos");
                        System.out.println("    - Total: " + totalProductos + " productos");
                        System.out.println("    - Productos con variantes:");
                        System.out.println("      * 7 Jugos (21 variantes: Chico/Mediano/Grande)");
                        System.out.println("      * 11 Licuados/Chocomiles (33 variantes: Chico/Mediano/Grande)");
                        System.out.println("      * 1 Waffles (2 variantes: Chico/Grande)");
                        System.out.println("    - Productos sin variantes:");
                        System.out.println("      * 10 Lonches y Sandwiches (separados individualmente)");
                        System.out.println("    - Reorganización:");
                        System.out.println("      * 'Jugos Naturales' renombrado a 'Jugos'");
                        System.out.println("      * Nombres de jugos simplificados (sin 'Jugo de')");
                        System.out.println("      * Naranja y Toronja separados como productos individuales");
                        System.out.println("      * Molletes, Lonches y Sandwiches movidos a 'Desayunos'");
                        System.out.println("      * Nueva categoría 'Adicionales' con ingredientes extra");
                        System.out.println("      * 'Complementos' actualizado con Café y Té");
                        System.out.println("    - Productos actualizados:");
                        System.out.println("      * Desayunos: Huevos al gusto ($50), Waffles (Chico $35/Grande $60), Mini Hot Cakes (15pzs $55, 10pzs $45)");
                        System.out.println("      * Molletes: Molletes Dulces ($30), Ingrediente Extra ($5)");
                        System.out.println("      * Lonches: Lonches y Sincronizadas ($35)");
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
