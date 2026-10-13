# Guía de Desarrollo - Punto de Venta Backend v1.0.0

## 📋 Índice
1. [Preparación del Entorno](#preparación-del-entorno)
2. [Versionado y Empaquetado](#versionado-y-empaquetado)
3. [Documentación de APIs](#documentación-de-apis)
4. [Modernización con Java 21](#modernización-con-java-21)
5. [Base de Datos](#base-de-datos)
6. [Pruebas con Postman](#pruebas-con-postman)
7. [Despliegue](#despliegue)

---

## 🚀 Preparación del Entorno

### Requisitos
- ✅ Java 21 LTS (OpenJDK 21.0.8+)
- ✅ Maven 3.9.11+
- ✅ PostgreSQL 13+ (producción) o H2 (desarrollo)
- ✅ IDE con soporte para Java 21 (IntelliJ IDEA, VS Code, Eclipse)

### Verificación
```bash
# Verificar Java
java -version  # Debe mostrar Java 21

# Verificar Maven
./mvnw --version  # Debe usar Java 21

# Verificar compilación
./mvnw clean compile
```

---

## 📦 Versionado y Empaquetado

### Sistema de Versionado Semántico
El proyecto usa versionado semántico: `MAJOR.MINOR.PATCH`

**Versión actual**: `1.0.0-SNAPSHOT`

### Ubicación de la Versión
La versión se gestiona en `pom.xml`:

```xml
<properties>
    <app.version.major>1</app.version.major>
    <app.version.minor>0</app.version.minor>
    <app.version.patch>0</app.version.patch>
</properties>
```

### Cuándo Incrementar la Versión

#### PATCH (x.x.X+1)
Cambios pequeños, bug fixes, sin cambios en la API:
- Corrección de errores
- Mejoras de rendimiento
- Refactorización interna

**Ejemplo**: `1.0.0` → `1.0.1`

```xml
<app.version.patch>1</app.version.patch>
```

#### MINOR (x.X+1.0)
Nuevas funcionalidades retrocompatibles:
- Nuevos endpoints
- Nuevas características
- Cambios en DB compatibles

**Ejemplo**: `1.0.5` → `1.1.0`

```xml
<app.version.minor>1</app.version.minor>
<app.version.patch>0</app.version.patch>
```

#### MAJOR (X+1.0.0)
Cambios breaking, no retrocompatibles:
- Cambios en estructura de API
- Eliminación de endpoints
- Cambios de BD incompatibles

**Ejemplo**: `1.9.3` → `2.0.0`

```xml
<app.version.major>2</app.version.major>
<app.version.minor>0</app.version.minor>
<app.version.patch>0</app.version.patch>
```

### Proceso de Release

#### 1. Actualizar Versión
Editar `pom.xml` y cambiar las propiedades de versión.

#### 2. Compilar y Empaquetar
```bash
# Limpiar y compilar
./mvnw clean compile

# Ejecutar tests
./mvnw test

# Crear package JAR
./mvnw clean package

# El JAR se genera en:
# target/backend-1.0.0-SNAPSHOT.jar
```

#### 3. Commit y Tag
```bash
# Commit de la nueva versión
git add pom.xml
git commit -m "chore: bump version to 1.0.0"

# Crear tag
git tag -a v1.0.0 -m "Release 1.0.0 - Primera versión estable"

# Push con tags
git push origin develop --tags
```

#### 4. Verificar la información del build
El JAR incluye información de build accesible via API:
```bash
# Ejecutar la app
java -jar target/backend-1.0.0-SNAPSHOT.jar

# Consultar versión
curl http://localhost:8080/api/version
```

Respuesta:
```json
{
  "version": "1.0.0",
  "build": "20251121101500",
  "javaVersion": "21",
  "description": "API RESTful para sistema de Punto de Venta",
  "timestamp": "2025-11-21T16:15:00Z",
  "environment": "development"
}
```

### Empaquetado para Diferentes Plataformas

#### Aplicación Móvil (React Native)
El backend expone una API REST que será consumida por:
- **Android**: APK/AAB compilado con React Native
- **iOS**: IPA compilado con React Native

La app móvil consultará `/api/version` para verificar compatibilidad.

#### Aplicación de Escritorio (Electron/Tauri - Futuro)
Similar a móvil, consumirá la misma API REST.

#### Configuración CORS
Ya configurada en `application.properties` para soportar apps móviles:
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:19006,capacitor://localhost
```

---

## 📚 Documentación de APIs

### OpenAPI/Swagger
La API genera documentación automáticamente usando SpringDoc OpenAPI.

#### Endpoints de Documentación
- **Swagger UI (Interactivo)**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs
- **OpenAPI YAML**: http://localhost:8080/api-docs.yaml

### Acceso a Swagger UI
1. Iniciar la aplicación: `./mvnw spring-boot:run`
2. Abrir navegador: http://localhost:8080/swagger-ui.html
3. Autenticarse (si es necesario):
   - Usuario: `admin`
   - Password: `admin123`

### Características de Swagger UI
- 📋 Lista todos los endpoints disponibles
- 🧪 Permite probar endpoints directamente
- 📝 Muestra modelos de datos (DTOs)
- 🔐 Soporta autenticación
- 📤 Permite exportar a Postman

### Ejemplo de Endpoint Documentado
```java
@GetMapping("/{id}")
@Operation(
    summary = "Obtener producto por ID",
    description = "Retorna un producto específico buscando por su ID"
)
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Producto encontrado"),
    @ApiResponse(responseCode = "404", description = "Producto no encontrado")
})
public ResponseEntity<ProductoDTO> getProducto(@PathVariable Long id) {
    // ...
}
```

---

## ☕ Modernización con Java 21

### 1. Records para DTOs ✅

**USAR SIEMPRE** Records en lugar de clases tradicionales para DTOs.

**Ejemplo Completo**:
```java
package com.puntodeventa.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Schema(description = "DTO para crear/actualizar producto")
public record ProductoDTO(
    @Schema(description = "ID del producto", example = "1")
    Long id,
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
    @Schema(description = "Nombre del producto", example = "Café Americano")
    String nombre,
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Schema(description = "Precio del producto", example = "35.00")
    BigDecimal precio,
    
    @NotNull(message = "La categoría es obligatoria")
    @Schema(description = "ID de la categoría", example = "2")
    Long categoriaId,
    
    @Schema(description = "Producto activo", example = "true", defaultValue = "true")
    Boolean activo
) {
    // Constructor compacto para validaciones adicionales
    public ProductoDTO {
        if (precio != null && precio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
        if (activo == null) {
            activo = true; // Valor por defecto
        }
    }
}
```

**Ventajas**:
- ✅ 90% menos código
- ✅ Inmutabilidad automática
- ✅ Compatibilidad total con Jackson/JSON
- ✅ Validación integrada
- ✅ Documentación con Swagger

### 2. Pattern Matching en Switch ✅

**Uso en Exception Handlers**:
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        return switch (ex) {
            case EntityNotFoundException e -> 
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Entidad no encontrada", e.getMessage()));
            
            case ValidationException e -> 
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Validación fallida", e.getMessage()));
            
            case AccessDeniedException e -> 
                ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Acceso denegado", e.getMessage()));
            
            case DataIntegrityViolationException e -> 
                ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Conflicto de integridad", "Operación viola restricciones de BD"));
            
            default -> 
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno", "Error inesperado en el servidor"));
        };
    }
}
```

### 3. Virtual Threads ✅

**YA HABILITADOS** automáticamente:
```properties
spring.threads.virtual.enabled=true
```

**Uso en Services Asíncronos**:
```java
@Service
public class PedidoService {
    
    @Async
    public CompletableFuture<Pedido> procesarPedidoAsync(CreatePedidoDTO dto) {
        // Esta operación se ejecuta en un virtual thread
        // Puede manejar miles de requests concurrentes
        Pedido pedido = crearPedido(dto);
        notificarCocina(pedido);
        return CompletableFuture.completedFuture(pedido);
    }
    
    @Transactional
    public Pedido crearPedido(CreatePedidoDTO dto) {
        // Lógica de negocio...
    }
}
```

### 4. Sequenced Collections ✅

```java
@Service
public class ProductoService {
    
    public ProductoDTO obtenerMasReciente() {
        List<Producto> productos = repository.findAllByOrderByCreatedAtDesc();
        
        // Java 21 - Más expresivo
        return productos.isEmpty() ? null : mapper.toDTO(productos.getFirst());
        
        // En lugar de:
        // return productos.isEmpty() ? null : mapper.toDTO(productos.get(0));
    }
    
    public List<ProductoDTO> obtenerTopVentas() {
        List<Producto> productos = repository.findTopByVentas();
        productos.addFirst(productoDestacado); // Agregar al inicio
        return productos.stream().map(mapper::toDTO).toList();
    }
}
```

### 5. String Templates (Preview - Opcional)

Si se habilitan preview features:
```java
String mensaje = STR."Pedido #\{pedido.getId()} - Total: $\{pedido.getTotal()}";
// Más seguro que String.format() y concatenación
```

---

## 🗄️ Base de Datos

### Estado Actual
- ✅ Script de inicialización creado: `src/main/resources/schema.sql`
- ✅ Entidades base definidas
- ✅ Índices configurados
- ✅ Datos iniciales incluidos

### Desarrollo (H2 en memoria)
```properties
spring.datasource.url=jdbc:h2:mem:puntodeventa
spring.h2.console.enabled=true
```

**Acceder a H2 Console**:
1. URL: http://localhost:8080/h2-console
2. JDBC URL: `jdbc:h2:mem:puntodeventa`
3. Usuario: `sa`
4. Password: (vacío)

### Producción (PostgreSQL)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/puntodeventa
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

### Próximos Pasos para BD

1. **Crear Entidades JPA** basadas en `docs/datos/especificacion-bd.md`:
   - Sucursales, Cajas, Turnos
   - Productos, Categorías
   - Ventas, VentasItems, Pagos
   - Usuarios, Roles
   - Inventario (Ingredientes, Recetas, Movimientos)

2. **Crear Repositorios** (Spring Data JPA)
3. **Crear Servicios** con lógica de negocio
4. **Crear Controladores** con endpoints REST
5. **Documentar con Swagger**

---

## 🧪 Pruebas con Postman

### Importar API a Postman

#### Método 1: Desde OpenAPI JSON (Recomendado)
1. Iniciar la aplicación: `./mvnw spring-boot:run`
2. Abrir Postman
3. Haz clic en **Import**
4. Seleccionar **Link**
5. Pegar: `http://localhost:8080/api-docs`
6. Haz clic **Continue** > **Import**
7. ✅ La colección completa se importa automáticamente

#### Método 2: Desde Swagger UI
1. Abrir: http://localhost:8080/swagger-ui.html
2. Haz clic en el link del OpenAPI JSON (arriba)
3. Copiar todo el JSON
4. En Postman: Import > Paste Raw Text > Pegar JSON
5. Import

### Configurar Variables de Entorno

Crear en Postman:
```
Environment: Punto de Venta - DEV

Variables:
baseUrl: http://localhost:8080
username: admin
password: admin123
token: (vacío - para JWT futuro)
```

### Autenticación en Postman

#### HTTP Basic Auth (Actual)
1. En cada request, ir a **Authorization**
2. Seleccionar **Basic Auth**
3. Username: `{{username}}`
4. Password: `{{password}}`

### Colecciones Organizadas
Postman generará automáticamente carpetas por tags:
- 📁 Información del Sistema
  - GET /api/version
  - GET /actuator/health
- 📁 Productos (futuro)
  - GET /api/productos
  - POST /api/productos
  - GET /api/productos/{id}
  - PUT /api/productos/{id}
  - DELETE /api/productos/{id}

### Tests Automatizados en Postman

Ejemplo de test para endpoint de versión:
```javascript
// En Tests tab de Postman
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has version", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.version).to.exist;
    pm.expect(jsonData.javaVersion).to.eql("21");
});

pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## 🚀 Despliegue

### Para Desarrollo
```bash
./mvnw spring-boot:run
```

### Para Producción

#### 1. Crear JAR
```bash
./mvnw clean package -DskipTests
```

#### 2. Ejecutar JAR
```bash
# Con perfil de producción
java -jar target/backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod

# Con optimizaciones Java 21
java -XX:+UseZGC -XX:+ZGenerational \
     -Xms512m -Xmx2g \
     -jar target/backend-1.0.0-SNAPSHOT.jar \
     --spring.profiles.active=prod
```

#### 3. Como Servicio (systemd)
Crear `/etc/systemd/system/puntodeventa.service`:
```ini
[Unit]
Description=Punto de Venta Backend
After=network.target

[Service]
Type=simple
User=puntodeventa
WorkingDirectory=/opt/puntodeventa
ExecStart=/usr/bin/java -jar /opt/puntodeventa/backend-1.0.0.jar --spring.profiles.active=prod
Restart=always
RestartSec=10

Environment="DB_USERNAME=postgres"
Environment="DB_PASSWORD=secretpassword"

[Install]
WantedBy=multi-user.target
```

Activar:
```bash
sudo systemctl enable puntodeventa
sudo systemctl start puntodeventa
sudo systemctl status puntodeventa
```

---

## 📝 Lista de verificación de Desarrollo

### Antes de Crear un Endpoint
- [ ] Consultar `docs/datos/modelo-datos.md` y `docs/datos/especificacion-bd.md`
- [ ] Crear DTO como **Record** en `dto/`
- [ ] Crear Entidad en `model/` (si no existe)
- [ ] Crear Repositorio en `repository/`
- [ ] Crear Servicio en `service/` con `@Transactional`
- [ ] Crear Controlador en `controller/` con documentación Swagger
- [ ] Usar Pattern Matching donde sea apropiado
- [ ] Probar en Swagger UI
- [ ] Exportar a Postman y crear tests

### Antes de un Release
- [ ] Incrementar versión en `pom.xml`
- [ ] Ejecutar `./mvnw clean compile`
- [ ] Ejecutar `./mvnw test`
- [ ] Verificar Swagger UI
- [ ] Probar en Postman
- [ ] Commit y crear tag
- [ ] Actualizar CHANGELOG.md

---

## 📚 Referencias

- [Java 21 Features](https://openjdk.org/projects/jdk/21/)
- [Spring Boot 3.5 Docs](https://docs.spring.io/spring-boot/docs/3.5.x/reference/html/)
- [SpringDoc OpenAPI](https://springdoc.org/)
- [Postman Documentation](https://learning.postman.com/)

---

**Autor**: Grxson  
**Versión**: 1.0.0  
**Fecha**: 21 de noviembre de 2025  
**Java**: 21 LTS  
**Spring Boot**: 3.5.7
