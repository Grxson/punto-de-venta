# Instrucciones Adicionales de Copilot - Java 21 & Modernización

## Nuevas Características Java 21 - USO OBLIGATORIO

### 1. Records para DTOs (USAR SIEMPRE)
Los DTOs deben implementarse como **Java Records** en lugar de clases tradicionales.

**❌ NO HACER (Estilo antiguo):**
```java
public class ProductoDTO {
    private Long id;
    private String nombre;
    private BigDecimal precio;
    
    // getters, setters, constructores, equals, hashCode, toString...
}
```

**✅ HACER (Java 21 - Records):**
```java
public record ProductoDTO(
    Long id,
    String nombre,
    BigDecimal precio
) {
    // Validación en constructor compacto si es necesario
    public ProductoDTO {
        if (precio != null && precio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
    }
}
```

**Ventajas:**
- Inmutabilidad por defecto
- Menos código boilerplate
- Generación automática de equals, hashCode, toString
- Compatibilidad total con Jackson para JSON
- Mejor rendimiento

### 2. Pattern Matching en Switch (USAR en Controllers y Services)
Reemplazar if-else anidados con pattern matching.

**❌ NO HACER:**
```java
public ResponseEntity<?> handleException(Exception ex) {
    if (ex instanceof EntityNotFoundException) {
        return ResponseEntity.notFound().build();
    } else if (ex instanceof ValidationException) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    } else {
        return ResponseEntity.internalServerError().build();
    }
}
```

**✅ HACER:**
```java
public ResponseEntity<?> handleException(Exception ex) {
    return switch (ex) {
        case EntityNotFoundException e -> 
            ResponseEntity.notFound().build();
        case ValidationException e -> 
            ResponseEntity.badRequest().body(e.getMessage());
        case AccessDeniedException e -> 
            ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        default -> 
            ResponseEntity.internalServerError().build();
    };
}
```

### 3. Virtual Threads (YA HABILITADOS)
Los Virtual Threads están habilitados automáticamente en `application.properties`:
```properties
spring.threads.virtual.enabled=true
```

**Para operaciones asíncronas:**
```java
@Service
public class PedidoService {
    
    @Async
    public CompletableFuture<Pedido> procesarPedido(PedidoDTO dto) {
        // Esta operación se ejecutará en un virtual thread
        // Puede manejar miles de requests concurrentes sin problemas
        return CompletableFuture.completedFuture(pedido);
    }
}
```

### 4. Sequenced Collections (USAR para operaciones ordenadas)
```java
// Usar métodos modernos de colecciones
List<Producto> productos = repository.findAll();
Producto primero = productos.getFirst();  // En lugar de .get(0)
Producto ultimo = productos.getLast();     // En lugar de .get(size-1)
productos.addFirst(nuevoProducto);         // Más expresivo
```

### 5. String Templates (Preview - OPCIONAL)
```java
// Si se habilita preview features
String mensaje = STR."Total: \{total}, Fecha: \{fecha}";
// Más seguro que String.format() y concatenación
```

## Estructura de Paquetes - ESTÁNDAR

```
com.puntodeventa.backend/
├── config/              # Configuraciones (CORS, Security, OpenAPI)
├── controller/          # Controllers REST (usar @RestController)
├── service/            # Lógica de negocio (usar @Service)
├── repository/         # Acceso a datos (usar @Repository, Spring Data JPA)
├── model/              # Entidades JPA (usar @Entity, Lombok)
├── dto/                # Records para DTOs (SOLO RECORDS)
├── mapper/             # MapStruct para convertir Entity <-> DTO
├── exception/          # Excepciones personalizadas
└── util/               # Utilidades y helpers
```

## Convenciones de Código

### Nombrado
- **Entidades**: Sustantivos singulares (Producto, Venta, Usuario)
- **Repositorios**: [Entidad]Repository (ProductoRepository)
- **Services**: [Entidad]Service (ProductoService)
- **Controllers**: [Entidad]Controller (ProductoController)
- **DTOs (Records)**: [Entidad]DTO (ProductoDTO, CreateProductoDTO, UpdateProductoDTO)
- **Mappers**: [Entidad]Mapper (ProductoMapper)

### Anotaciones Spring
- `@RestController` + `@RequestMapping` para controllers
- `@Service` para services
- `@Repository` para repositories (aunque no es necesario con Spring Data JPA)
- `@Transactional` para métodos que modifican datos
- `@Valid` para validación de DTOs

### Documentación OpenAPI/Swagger (OBLIGATORIO)
Cada endpoint debe tener documentación completa:

```java
@RestController
@RequestMapping("/api/productos")
@Tag(name = "Productos", description = "Gestión de productos del catálogo")
public class ProductoController {

    @GetMapping("/{id}")
    @Operation(
        summary = "Obtener producto por ID",
        description = "Retorna un producto específico buscando por su ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Producto encontrado"),
        @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    public ResponseEntity<ProductoDTO> getProducto(
        @Parameter(description = "ID del producto", required = true)
        @PathVariable Long id
    ) {
        // implementación
    }
}
```

## Versionado de la API

### Versión Actual: 1.0.0
La versión se gestiona en `pom.xml`:
```xml
<app.version.major>1</app.version.major>
<app.version.minor>0</app.version.minor>
<app.version.patch>0</app.version.patch>
```

### Incrementar Versión
- **PATCH** (x.x.X): Bug fixes, sin cambios de API
- **MINOR** (x.X.x): Nuevas funcionalidades, retrocompatible
- **MAJOR** (X.x.x): Cambios breaking, no retrocompatible

### Pasos para release:
1. Actualizar versión en `pom.xml`
2. Compilar: `./mvnw clean package`
3. Probar: `./mvnw test`
4. Commit: `git commit -m "chore: bump version to X.Y.Z"`
5. Tag: `git tag -a vX.Y.Z -m "Release X.Y.Z"`
6. Push: `git push origin develop --tags`

## Testing con Postman

### Exportar Colección
La API genera automáticamente documentación OpenAPI en:
- **JSON**: http://localhost:8080/api-docs
- **Swagger UI**: http://localhost:8080/swagger-ui.html

Para importar en Postman:
1. Abrir Postman
2. Import > Link > Pegar: `http://localhost:8080/api-docs`
3. La colección se importa automáticamente

### Variables de entorno Postman
Crear en Postman:
```
baseUrl: http://localhost:8080
username: admin
password: admin123
```

## Base de Datos

### Desarrollo (H2)
- URL: `jdbc:h2:mem:puntodeventa`
- Consola: http://localhost:8080/h2-console
- Usuario: `sa`
- Password: (vacío)

### Producción (PostgreSQL)
Configurar en `application-prod.properties` o variables de entorno:
```properties
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### Migraciones
- **Desarrollo**: `spring.jpa.hibernate.ddl-auto=create-drop`
- **Producción**: `spring.jpa.hibernate.ddl-auto=validate`
- Usar `schema.sql` para inicialización

## Seguridad

### Autenticación Actual (Temporal)
- Tipo: HTTP Basic Auth
- Usuario: `admin`
- Password: `admin123`

### TODO: Implementar JWT
Ver `docs/admin/seguridad.md` para especificación de roles y permisos.

## CORS para Apps Móviles y Escritorio

CORS está configurado en `application.properties`:
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:19006,capacitor://localhost
```

Para desarrollo, permite múltiples origins. En producción, especificar solo los necesarios.

## Logs y Debugging

### Niveles de log
- **Desarrollo**: DEBUG para com.puntodeventa, DEBUG para SQL
- **Producción**: INFO para com.puntodeventa, WARN para SQL

### Ver logs de SQL
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## Buenas Prácticas ADICIONALES

1. **SIEMPRE usar Records para DTOs** - No excepciones
2. **SIEMPRE documentar endpoints con @Operation** - Para Postman
3. **SIEMPRE usar Pattern Matching** - En lugar de if-else
4. **SIEMPRE validar DTOs con @Valid** - Bean Validation
5. **SIEMPRE usar transacciones** - @Transactional en services
6. **NUNCA exponer entidades directamente** - Siempre usar DTOs
7. **NUNCA hardcodear valores** - Usar application.properties
8. **NUNCA commitear secrets** - Usar variables de entorno

## Comandos Útiles

```bash
# Compilar
./mvnw clean compile

# Tests
./mvnw test

# Package
./mvnw clean package

# Ejecutar
./mvnw spring-boot:run

# Ejecutar con perfil
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Ver versión
curl http://localhost:8080/api/version

# Health check
curl http://localhost:8080/actuator/health
```

## Referencias Rápidas

- **OpenAPI Spec**: http://localhost:8080/api-docs
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console**: http://localhost:8080/h2-console
- **Health**: http://localhost:8080/actuator/health
- **Version**: http://localhost:8080/api/version

---

**Última actualización**: 21 de noviembre de 2025  
**Java Version**: 21 LTS  
**Spring Boot**: 3.5.7
