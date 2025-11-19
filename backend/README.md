# Backend - Punto de Venta

API RESTful desarrollada con Java y Spring Boot para el sistema de punto de venta.

## Tecnologías

- **Java**: 21 LTS
- **Spring Boot**: 3.5.7
- **Maven**: Gestión de dependencias
- **H2 Database**: Base de datos en memoria (desarrollo)
- **MySQL**: Base de datos (producción)

## Dependencias

### Principales
- **Spring Web**: Creación de API RESTful
- **Spring Data JPA**: Persistencia y gestión de entidades
- **Spring Security**: Autenticación, autorización y roles
- **Spring Validation**: Validación de datos en modelos y controladores
- **Swagger/OpenAPI**: Documentación automática de la API

### Opcionales (utilidades)
- **Spring Boot Actuator**: Monitoreo y métricas del sistema
- **Spring Boot DevTools**: Recarga automática durante desarrollo

## Estructura del Proyecto

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/puntodeventa/backend/
│   │   │   ├── PuntoDeVentaBackendApplication.java  # Punto de entrada
│   │   │   ├── config/              # Configuraciones (Security, Swagger, etc.)
│   │   │   ├── controller/          # Controladores REST
│   │   │   ├── model/               # Entidades JPA
│   │   │   ├── repository/          # Repositorios JPA
│   │   │   ├── service/             # Lógica de negocio
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   └── exception/           # Manejo de excepciones
│   │   └── resources/
│   │       ├── application.properties   # Configuración principal
│   │       ├── application-dev.properties  # Configuración desarrollo
│   │       └── application-prod.properties # Configuración producción
│   └── test/                        # Tests unitarios e integración
├── pom.xml                          # Dependencias Maven
└── README.md
```

## Configuración

### Base de datos H2 (desarrollo)
Por defecto, el proyecto usa H2 en memoria. La consola H2 está disponible en:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Usuario: `sa`
- Contraseña: (vacío)

### Base de datos MySQL (producción)
Configura en `application-prod.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/punto_venta
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
```

## Ejecutar el proyecto

### Desarrollo
```bash
./mvnw spring-boot:run
```

### Producción
```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Endpoints principales

La documentación completa de la API está disponible en Swagger:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

## Próximos pasos

1. Crear entidades según `docs/datos/modelo-datos.md`
2. Implementar repositorios JPA
3. Desarrollar servicios con lógica de negocio
4. Crear controladores REST
5. Configurar seguridad y roles según `docs/admin/seguridad.md`
6. Implementar validaciones
7. Documentar endpoints con anotaciones Swagger
8. Crear tests unitarios e integración

## Documentación del proyecto

Consulta la documentación completa en el directorio `docs/` del repositorio principal:
- Modelo de datos: `docs/datos/modelo-datos.md`
- Especificación BD: `docs/datos/especificacion-bd.md`
- Seguridad: `docs/admin/seguridad.md`
- Flujos de negocio: `docs/diagramas/`
