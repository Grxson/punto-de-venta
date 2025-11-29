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

### 🚀 Desarrollo con Railway PostgreSQL (Recomendado)

**El perfil `dev` está configurado para conectarse directamente a Railway PostgreSQL**, permitiéndote trabajar con datos reales sin mantener una BD local.

#### Configuración rápida:

1. **Obtén la URL de conexión** desde [Railway Dashboard](https://railway.app) → PostgreSQL → Connect
2. **Configura la variable de entorno:**

   ```bash
   # Linux/macOS
   export DATABASE_URL="postgresql://usuario:password@host.railway.app:5432/railway"
   
   # O crea backend/.env
   echo 'DATABASE_URL=postgresql://...' > .env
   ```

3. **Ejecuta el script de inicio:**
   ```bash
   ./start-dev.sh
   ```

📖 **Guía completa**: [RAILWAY-LOCAL-CONNECTION.md](./RAILWAY-LOCAL-CONNECTION.md)

### Base de datos H2 (alternativa local)

Si prefieres trabajar con H2 en memoria, puedes crear un perfil `dev-local` o modificar temporalmente `application-dev.properties`.

### Base de datos MySQL (producción legacy)
Configura en `application-prod.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/punto_venta
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
spring.jpa.hibernate.ddl-auto=update
```

## Ejecutar el proyecto

### Desarrollo (conectado a Railway)
```bash
# Opción 1: Script con validación automática (recomendado)
./start-dev.sh

# Opción 2: Maven directamente (requiere DATABASE_URL configurado)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Opción 3: Con variable inline
DATABASE_URL="postgresql://..." ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Producción
```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## Endpoints principales

La documentación completa de la API está disponible en:
- **Documentación detallada**: [API-ENDPOINTS.md](./API-ENDPOINTS.md)
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### Módulos Implementados

#### ✅ Autenticación
- Login y registro de usuarios
- Gestión de usuarios por sucursal
- Activación/desactivación de cuentas

#### ✅ Inventario Completo
- **Unidades de Medida**: Gestión con factor de conversión
- **Proveedores**: CRUD con búsqueda y filtros
- **Ingredientes**: Gestión con categorización, stock mínimo y costos
- **Productos**: Productos del menú con precios y disponibilidad
- **Categorías de Productos**: Organización de productos
- **Recetas**: Vinculación producto-ingrediente con cantidades y merma
- **Movimientos**: Registro de ingresos/egresos con trazabilidad
- **Mermas**: Control de pérdidas con motivos

**Endpoints base**:
- `/api/auth/*` - Autenticación y usuarios
- `/api/inventario/unidades` - Unidades de medida
- `/api/inventario/proveedores` - Proveedores
- `/api/inventario/ingredientes` - Ingredientes
- `/api/inventario/productos` - Productos del menú
- `/api/inventario/categorias-productos` - Categorías
- `/api/inventario/recetas` - Recetas
- `/api/inventario/movimientos` - Movimientos de inventario
- `/api/inventario/mermas` - Registro de mermas

### Colección Postman

Importa la colección completa desde `postman/punto-de-venta.postman_collection.json` para probar todos los endpoints con:
- Scripts automáticos de captura de IDs
- Variables de entorno pre-configuradas
- Organización por carpetas (Autenticación, Salud, Inventario)

### Características de la API

- ✅ **DTOs como Records**: Java 21 records para inmutabilidad
- ✅ **Borrado Lógico**: Preservación de histórico en todas las entidades
- ✅ **Filtros Dinámicos**: Búsqueda y filtrado por múltiples criterios
- ✅ **Validaciones**: Validación automática con Bean Validation
- ✅ **Manejo de Errores**: Respuestas de error estandarizadas
- ✅ **Documentación**: Swagger/OpenAPI completo
- ✅ **Migraciones**: Flyway para control de versiones de BD

## Próximos pasos

1. ~~Crear entidades según `docs/datos/modelo-datos.md`~~ ✅
2. ~~Implementar repositorios JPA~~ ✅
3. ~~Desarrollar servicios con lógica de negocio~~ ✅
4. ~~Crear controladores REST~~ ✅
5. ~~Documentar endpoints con anotaciones Swagger~~ ✅
6. Implementar JWT para autenticación (en desarrollo)
7. Sistema de ventas con cálculo automático de costos
8. Reportes y analítica
9. Tests unitarios e integración completos
10. Consolidar todas las tablas bajo migraciones Flyway

## Documentación del proyecto

Consulta la documentación completa en el directorio `docs/` del repositorio principal:
- Modelo de datos: `docs/datos/modelo-datos.md`
- Especificación BD: `docs/datos/especificacion-bd.md`
- Seguridad: `docs/admin/seguridad.md`
- Flujos de negocio: `docs/diagramas/`
