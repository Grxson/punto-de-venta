
# Instrucciones Copilot para punto-de-venta

## 📌 LEER SIEMPRE PRIMERO
**Este proyecto usa Java 21 con características modernas. Consultar también:**
- `.github/copilot-instructions-java21.md` - Guía completa de Java 21
- `backend/DEVELOPMENT-GUIDE.md` - Guía de desarrollo detallada
- `backend/JAVA21-UPGRADE.md` - Características de Java 21

## Descripción general del proyecto
Sistema de Punto de Venta con arquitectura moderna y multiplataforma. Backend desarrollado en Java 21 LTS con Spring Boot 3.5.7 y frontend en React Native.

### Stack tecnológico
- **Backend**: Java 21 LTS, Spring Boot 3.5.7, Maven, PostgreSQL/MySQL/H2
- **Frontend**: React Native 0.76.5, React 18.3.1, TypeScript 5.0.4
- **Documentación**: Markdown en `docs/`, Swagger/OpenAPI
- **Versionado**: Semántico (MAJOR.MINOR.PATCH) en `pom.xml`

## ⚠️ REGLAS CRÍTICAS DE JAVA 21

### 1. DTOs SIEMPRE como Records
```java
// ✅ CORRECTO
public record ProductoDTO(Long id, String nombre, BigDecimal precio) {}

// ❌ INCORRECTO
public class ProductoDTO {
    private Long id;
    private String nombre;
    // getters, setters...
}
```

### 2. Pattern Matching en lugar de if-else
```java
// ✅ CORRECTO
return switch (ex) {
    case EntityNotFoundException e -> ResponseEntity.notFound().build();
    case ValidationException e -> ResponseEntity.badRequest().body(e.getMessage());
    default -> ResponseEntity.internalServerError().build();
};

// ❌ INCORRECTO
if (ex instanceof EntityNotFoundException) {
    return ResponseEntity.notFound().build();
} else if (ex instanceof ValidationException) {
    // ...
}
```

### 3. Virtual Threads (YA HABILITADOS)
Virtual threads están activos automáticamente. Para async:
```java
@Async
public CompletableFuture<T> metodoAsync() { }
```

### 4. Sequenced Collections
```java
// ✅ CORRECTO
productos.getFirst()
productos.getLast()
productos.addFirst(item)

// ❌ INCORRECTO
productos.get(0)
productos.get(productos.size() - 1)
```

## Directorios y archivos clave
- `backend/`: API RESTful en Java con Spring Boot
  - `src/main/java/com/puntodeventa/backend/`: Código fuente Java
  - `src/main/resources/`: Configuraciones y recursos
  - `pom.xml`: Gestión de dependencias Maven
  - Backend README: `backend/README.md`
- `frontend/`: Aplicación React Native (por inicializar)
- `docs/flujo-interno.md`: Flujo interno principal del sistema POS.
- `docs/admin/`: Documentación administrativa, incluyendo:
  - `vision.md`: Visión y alcance del proyecto.
  - `inventario.md`: Inventario, recetas y gestión de mermas.
  - `finanzas.md`: Operaciones financieras (ingresos, gastos, caja).
  - `reportes.md`: Reportes y analítica.
  - `seguridad.md`: Seguridad y roles.
  - `operacion.md`: Operación diaria.
- `docs/datos/`: Arquitectura de datos y reportes:
  - `modelo-datos.md`: Propuesta de modelo de datos.
  - `especificacion-bd.md`: Especificación de la base de datos (tablas, índices, vistas).
  - `escalabilidad.md`: Consideraciones de escalabilidad de datos.
  - `reportes-sql.md`: Consultas SQL para KPIs y reportes.
- `docs/diagramas/`: Diagramas visuales de flujos para diferentes productos/servicios (por ejemplo, `flujo-pago.md`, `flujo-pedido.md`).

## Arquitectura y patrones
- El sistema sigue una arquitectura cliente-servidor con backend y frontend desacoplados:
  - **Backend (Java + Spring Boot)**: API RESTful con arquitectura por capas (Controller, Service, Repository, Model).
  - **Frontend (React Native)**: Aplicación multiplataforma que consume la API REST.
- La separación de responsabilidades es fundamental: administración, datos y flujos operativos se documentan de forma independiente.
- Los modelos de datos y especificaciones de la base de datos están centralizados en `docs/datos/`.
- La lógica de negocio y los procesos se describen en markdown, no en código; los agentes AI deben consultar estos archivos para requisitos y lógica.
- Los diagramas en `docs/diagramas/` ilustran los flujos de extremo a extremo para productos/servicios específicos.
- El backend implementa patrones como:
  - **Repository Pattern**: Para acceso a datos con Spring Data JPA.
  - **Service Layer**: Para lógica de negocio.
  - **DTO Pattern**: Para transferencia de datos entre capas.
  - **Security**: Autenticación y autorización con Spring Security.

## Flujos de trabajo para desarrolladores
### Backend (Java + Spring Boot)
- **EJECUTAR EL PROYECTO**: `cd backend && ./start.sh` (script oficial que gestiona perfiles, build y variables de entorno)
- Compilar: `./mvnw clean compile`
- Crear package: `./mvnw clean package`
- La API estará disponible en `http://localhost:8080`
- Documentación Swagger: `http://localhost:8080/swagger-ui.html`
- Consola H2 (desarrollo): `http://localhost:8080/h2-console`

**⚠️ IMPORTANTE - Errores de ejecución:**
- Si hay errores al ejecutar el backend, **SIEMPRE revisar y arreglar en `start.sh`** o en los archivos de configuración que referencia
- El script `start.sh` detecta automáticamente el perfil (dev/railway/prod) según el entorno
- Si falta el JAR, lo compila automáticamente
- Si hay errores de conexión a BD, revisar variables de entorno en `.env`

### Frontend (React Native)
- Ejecutar el proyecto: `cd frontend && npm start`
- Android: `npm run android` (en otra terminal)
- iOS: `npm run ios` (en otra terminal, solo macOS)
- Instalar dependencias: `npm install`
- La app se conecta al backend en `http://localhost:8080`

### General
- Al generar código, siempre consulta los archivos de documentación relevantes para requisitos, estructuras de datos y pasos de proceso.
- Usa español para la documentación y comentarios en el código, siguiendo la convención del proyecto.

## Estrategia de ramas y control de versiones
El proyecto utiliza una estrategia de branching profesional para mantener el código organizado y facilitar el despliegue:

### Ramas principales
- **`main`** (producción): Contiene código estable, probado y listo para despliegue en producción. Solo se actualiza mediante merges desde `develop` cuando el código ha sido completamente validado.
- **`develop`** (desarrollo): Rama de integración donde se fusionan todas las nuevas características. Es la rama base para el desarrollo activo.

### Ramas de trabajo
- **`feature/<nombre>`**: Para desarrollar nuevas funcionalidades (ej: `feature/auth-login`, `feature/inventario-recetas`). Se crean desde `develop` y se fusionan de vuelta a `develop`.
- **`hotfix/<nombre>`**: Para correcciones urgentes en producción (ej: `hotfix/error-calculo-total`). Se crean desde `main` y se fusionan tanto a `main` como a `develop`.
- **`bugfix/<nombre>`**: Para correcciones de errores no urgentes. Se crean desde `develop` y se fusionan de vuelta a `develop`.

### Flujo de trabajo Git
1. **Desarrollo normal**: `develop` → `feature/nombre` → PR a `develop` → merge
2. **Release**: `develop` (probado y estable) → PR a `main` → merge → tag versión
3. **Hotfix urgente**: `main` → `hotfix/nombre` → PR a `main` y `develop` → merge

### Convenciones de commits
- Usa mensajes descriptivos en español
- Formato sugerido: `tipo: descripción breve`
  - `feat:` nueva funcionalidad
  - `fix:` corrección de errores
  - `docs:` cambios en documentación
  - `refactor:` refactorización de código
  - `test:` añadir o modificar tests
  - `chore:` tareas de mantenimiento
- Ejemplo: `feat: añadir endpoint para gestión de inventario`

### Recomendaciones
- Siempre trabaja en ramas feature, nunca directamente en `develop` o `main`
- Mantén `develop` sincronizada con `main` después de hotfixes
- Usa Pull Requests para revisión de código antes de mergear
- Etiqueta releases en `main` con versionado semántico (v1.0.0, v1.1.0, etc.)

## Integración y dependencias
### Backend
- **Spring Boot 3.5.7**: Framework principal
- **Spring Web**: API RESTful
- **Spring Data JPA**: Persistencia con Hibernate
- **Spring Security**: Autenticación y autorización
- **Spring Validation**: Validación de datos
- **Spring Boot Actuator**: Monitoreo y métricas
- **H2 Database**: Base de datos en memoria (desarrollo)
- **MySQL Connector**: Base de datos (producción)
- **Swagger/OpenAPI**: Documentación de API
- **Spring Boot DevTools**: Herramientas de desarrollo

### Frontend
- **React Native 0.76.5**: Framework multiplataforma
- **React 18.3.1**: Biblioteca principal
- **TypeScript 5.0.4**: Tipado estático
- **Node.js 18+**: Runtime JavaScript

### Comunicación
- El frontend consume la API REST del backend mediante peticiones HTTP/HTTPS.
- Toda la comunicación se describe en la documentación de endpoints y flujos.

## Ejemplos y convenciones
- Para lógica de inventario, consulta `docs/admin/inventario.md` y `docs/datos/modelo-datos.md`.
- Para reportes, utiliza las consultas SQL en `docs/datos/reportes-sql.md` como referencia.
- Para seguridad y roles, sigue las directrices en `docs/admin/seguridad.md`.

## Guía práctica
- Antes de implementar cualquier funcionalidad, lee la documentación relevante en `docs/`.
- Documenta nueva lógica o flujos en español y colócalos en el subdirectorio correspondiente.
- Si tienes dudas, pide aclaraciones sobre reglas de negocio o flujos de datos según lo descrito en los archivos markdown.

## Buenas prácticas y convenciones de desarrollo
- Genera código limpio, legible y autoexplicativo.
- Evita duplicación de código; sugiere refactorizaciones cuando sean claras.
- Utiliza nombres descriptivos en variables, funciones y componentes.
- Prioriza la separación de responsabilidades: UI, lógica, datos.
- Usa principios SOLID y patrones de diseño cuando sea apropiado.
- Incluye documentación en funciones y clases (comentarios en español).
- Sugiere tests unitarios y de integración para cada pieza de lógica importante.
- Mantén consistencia en nombres, rutas, controladores y modelos.
- Aplica validación estricta de datos y manejo de errores.
- Evita suposiciones de datos no verificados.
- Propón mejoras cuando el rendimiento pueda verse afectado.
- No generes código si no está relacionado con el contexto del proyecto Punto de Venta.
- Sugerir actualizaciones a las instrucciones si se identifican áreas de mejora.

---
