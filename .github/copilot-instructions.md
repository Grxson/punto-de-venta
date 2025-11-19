
# Instrucciones Copilot para punto-de-venta

## Descripción general del proyecto
Sistema de Punto de Venta con arquitectura moderna y multiplataforma. Backend desarrollado en Java con Spring Boot y frontend en React Native.

### Stack tecnológico
- **Backend**: Java 21 LTS, Spring Boot 3.5.7, Maven, MySQL/H2
- **Frontend**: React Native (por inicializar)
- **Documentación**: Markdown en `docs/`

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
- Ejecutar el proyecto: `cd backend && ./mvnw spring-boot:run`
- Compilar: `./mvnw clean compile`
- Crear package: `./mvnw clean package`
- La API estará disponible en `http://localhost:8080`
- Documentación Swagger: `http://localhost:8080/swagger-ui.html`
- Consola H2 (desarrollo): `http://localhost:8080/h2-console`

### Frontend (React Native)
- Pendiente de inicializar

### General
- Al generar código, siempre consulta los archivos de documentación relevantes para requisitos, estructuras de datos y pasos de proceso.
- Usa español para la documentación y comentarios en el código, siguiendo la convención del proyecto.

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
- Pendiente de definir dependencias React Native

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
