# Actualización a Java 21 LTS - Punto de Venta Backend

## Resumen de la Actualización

Este documento describe la actualización exitosa del proyecto backend a Java 21 LTS, la versión de soporte a largo plazo más reciente de Java.

## Estado Actual ✅

### Versión de Java
- **Java Runtime**: OpenJDK 21.0.8
- **Java Version configurada en pom.xml**: 21
- **Maven**: 3.9.11

### Compilación y Tests
- ✅ Compilación exitosa con Java 21
- ✅ Tests unitarios pasando correctamente
- ✅ Spring Boot 3.5.7 totalmente compatible

## Cambios Realizados

### 1. Configuración del Compilador Maven

Se agregó configuración explícita del plugin `maven-compiler-plugin` en el `pom.xml`:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <release>21</release>
        <compilerArgs>
            <arg>-parameters</arg>
            <arg>--enable-preview</arg>
        </compilerArgs>
    </configuration>
</plugin>
```

**Beneficios:**
- `<release>21>`: Garantiza compilación con características de Java 21
- `-parameters`: Preserva nombres de parámetros en bytecode (útil para Spring)
- `--enable-preview`: Permite usar características preview de Java 21

### 2. Compatibilidad con Spring Boot

El proyecto utiliza Spring Boot 3.5.7, que tiene soporte completo para Java 21:
- Spring Framework 6.2.x incluido
- Hibernate 6.6.33.Final compatible
- Todas las dependencias actualizadas

## Nuevas Características de Java 21 Disponibles

### 1. Pattern Matching for Switch (JEP 441)
```java
// Ejemplo de uso
String formatObject(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> obj.toString();
    };
}
```

### 2. Record Patterns (JEP 440)
```java
// Definición de record
record Point(int x, int y) {}

// Uso de pattern matching
if (obj instanceof Point(int x, int y)) {
    System.out.println("Point at " + x + ", " + y);
}
```

### 3. Virtual Threads (JEP 444)
```java
// Creación de virtual threads para alta concurrencia
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        executor.submit(() -> {
            // Tarea asíncrona
        });
    }
}
```

### 4. Sequenced Collections (JEP 431)
```java
// Nuevos métodos para manipular colecciones
List<String> list = new ArrayList<>();
list.addFirst("primero");
list.addLast("último");
String first = list.getFirst();
String last = list.getLast();
```

### 5. String Templates (Preview - JEP 430)
```java
// Interpolación de strings más segura
String name = "Usuario";
int edad = 25;
String message = STR."Hola \{name}, tienes \{edad} años";
```

## Recomendaciones para el Proyecto

### 1. Modernizar DTOs con Records
Considera migrar las clases DTO a records de Java:

```java
// Antes
public class ProductoDTO {
    private Long id;
    private String nombre;
    private BigDecimal precio;
    // getters, setters, equals, hashCode, toString...
}

// Después (Java 21)
public record ProductoDTO(Long id, String nombre, BigDecimal precio) {}
```

### 2. Usar Pattern Matching en Controllers
```java
@ExceptionHandler
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

### 3. Virtual Threads para Operaciones Asíncronas
Para operaciones de alta concurrencia como procesamiento de pedidos:

```java
@Configuration
public class AsyncConfig {
    @Bean
    public AsyncTaskExecutor applicationTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setVirtualThreads(true); // Usa virtual threads
        return executor;
    }
}
```

### 4. Sequenced Collections en Repositorios
```java
// Para operaciones con orden específico
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Spring Data JPA devolverá implementaciones con soporte para 
    // getFirst(), getLast(), addFirst(), addLast()
    SequencedCollection<Pedido> findByFechaOrderByIdAsc(LocalDate fecha);
}
```

## Verificación del Entorno

### Comandos de Verificación
```bash
# Verificar versión de Java
java -version

# Verificar Maven y Java configurado
./mvnw --version

# Compilar proyecto
./mvnw clean compile

# Ejecutar tests
./mvnw test

# Ejecutar aplicación
./mvnw spring-boot:run
```

## Rendimiento y Optimización

### Mejoras de Rendimiento en Java 21
1. **Generational ZGC**: Mejor garbage collector para aplicaciones de baja latencia
2. **Virtual Threads**: Hasta 10x más threads concurrentes con menos recursos
3. **String Templates**: Mejor rendimiento en formateo de strings
4. **Pattern Matching**: Código más eficiente y legible

### Configuración JVM Recomendada
Agregar en `application.properties` o configurar en el script de inicio:

```properties
# Usar Generational ZGC (recomendado para Java 21)
-XX:+UseZGC
-XX:+ZGenerational

# Habilitar virtual threads
-Djdk.virtualThreadScheduler.parallelism=10
-Djdk.virtualThreadScheduler.maxPoolSize=256

# Optimizaciones de memoria
-Xms512m
-Xmx2g
```

## Próximos Pasos

1. **Refactorizar DTOs a Records**: Migrar gradualmente las clases DTO
2. **Implementar Virtual Threads**: Para operaciones asíncronas de alto volumen
3. **Modernizar Switch Statements**: Usar pattern matching donde sea apropiado
4. **Actualizar Tests**: Aprovechar nuevas características para tests más expresivos
5. **Documentar Patrones**: Crear guías de uso de nuevas características Java 21

## Recursos Adicionales

- [OpenJDK 21 Release Notes](https://openjdk.org/projects/jdk/21/)
- [Spring Boot 3.5 Java 21 Support](https://spring.io/blog/2023/09/09/all-together-now-spring-boot-3-2-graalvm-native-images-java-21-and-virtual-threads)
- [JEPs en Java 21](https://openjdk.org/projects/jdk/21/)

## Notas de Compatibilidad

### ⚠️ Advertencias Observadas
- **Dynamic Agent Loading**: Algunos frameworks (como Mockito) muestran advertencias sobre carga dinámica de agentes. Esto es normal y no afecta la funcionalidad.
  - Solución: Agregar `-XX:+EnableDynamicAgentLoading` en producción si es necesario

### ✅ Compatibilidad Verificada
- ✅ Spring Boot 3.5.7
- ✅ Hibernate 6.6.33
- ✅ MySQL Connector
- ✅ H2 Database
- ✅ Spring Security
- ✅ Spring Data JPA
- ✅ Swagger/OpenAPI

---

**Fecha de actualización**: 21 de noviembre de 2025  
**Versión de Java**: 21.0.8 (OpenJDK)  
**Estado**: ✅ Completado exitosamente
