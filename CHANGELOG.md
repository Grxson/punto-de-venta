# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2025-11-21

### 🎉 Primera Versión Estable

#### ✨ Agregado
- **Actualización a Java 21 LTS**: Migración completa del proyecto a Java 21 con todas sus características modernas
- **Virtual Threads**: Habilitados automáticamente para mejor manejo de concurrencia
- **Sistema de Versionado**: Implementación de versionado semántico en `pom.xml`
- **Endpoint de Versión**: `/api/version` para que apps móviles y escritorio verifiquen compatibilidad
- **Configuración CORS**: Soporte completo para apps móviles (React Native) y de escritorio
- **Documentación OpenAPI/Swagger**: 
  - Swagger UI en `/swagger-ui.html`
  - OpenAPI JSON en `/api-docs`
  - Exportación automática a Postman
- **Base de Datos**:
  - Script de inicialización `schema.sql`
  - Soporte para H2 (desarrollo), PostgreSQL y MySQL (producción)
  - Estructura completa de tablas según especificación
  - Índices optimizados
  - Datos iniciales (roles, métodos de pago, etc.)
- **Configuraciones por Entorno**:
  - `application.properties` - Configuración base
  - `application-dev.properties` - Desarrollo
  - `application-prod.properties` - Producción
- **Dependencias Agregadas**:
  - Lombok 1.18.34 - Reducción de boilerplate
  - MapStruct 1.6.3 - Mapeo automático de DTOs
  - PostgreSQL Driver - Soporte para PostgreSQL
  - WebSocket - Para funcionalidades en tiempo real
- **Estructura de Paquetes**:
  - `config/` - Configuraciones (CORS, Security, OpenAPI)
  - `controller/` - Controllers REST
  - `service/` - Lógica de negocio
  - `repository/` - Acceso a datos
  - `model/` - Entidades JPA
  - `dto/` - DTOs como Records
  - `mapper/` - Mappers MapStruct
  - `exception/` - Excepciones personalizadas
  - `util/` - Utilidades

#### 📚 Documentación
- **DEVELOPMENT-GUIDE.md**: Guía completa de desarrollo
- **JAVA21-UPGRADE.md**: Documentación de actualización a Java 21
- **copilot-instructions-java21.md**: Instrucciones específicas para Copilot con Java 21
- **.java21-commands.sh**: Script con comandos útiles
- **Actualización de README.md**: Información de Java 21

#### 🔧 Configuraciones
- **SecurityConfig**: Configuración temporal de seguridad (HTTP Basic Auth)
- **CorsConfig**: Configuración de CORS para apps móviles y escritorio
- **OpenApiConfig**: Configuración de Swagger/OpenAPI con seguridad
- **BaseEntity**: Entidad base con auditoría automática (createdAt, updatedAt)

#### 🔐 Seguridad
- Autenticación HTTP Basic (temporal para desarrollo)
- Endpoints públicos: `/api/version`, `/actuator/health`, `/swagger-ui.html`
- Sesiones stateless para API RESTful
- BCrypt para hashing de contraseñas
- CSRF deshabilitado (API stateless)

#### 🧪 Testing
- Configuración de test con Spring Boot Test
- Security Test configurado
- H2 en memoria para tests

#### 📦 Build
- Build info automático en JAR
- Metadata de versión incluida
- Annotation processors para Lombok y MapStruct
- Compilación con Java 21 features habilitadas (preview)

### 🔄 Cambiado
- Actualización de Java 17 → Java 21 LTS
- Estructura de proyecto reorganizada y estandarizada
- Configuración de base de datos expandida

### 🗑️ Deprecated
- N/A (primera versión)

### 🐛 Corregido
- N/A (primera versión)

### 🔒 Seguridad
- Implementación de autenticación básica
- CORS configurado para prevenir acceso no autorizado
- Passwords hasheados con BCrypt

---

## [1.1.0] - 2025-11-24

### ✨ Agregado
- **Módulo de Inventario Completo**: Implementación integral del sistema de gestión de inventario
  - **Unidades de Medida**: Gestión de unidades con factor de conversión
  - **Proveedores**: CRUD completo con búsqueda y filtros
  - **Ingredientes**: Gestión con categorización, stock mínimo, costos y SKU
  - **Productos**: Gestión de productos del menú con precios y disponibilidad
  - **Categorías de Productos**: Organización de productos en categorías
  - **Recetas**: Sistema de recetas que vincula productos con ingredientes, cantidades y merma teórica
  - **Movimientos de Inventario**: Registro de ingresos y egresos con trazabilidad
  - **Mermas**: Control de pérdidas con motivos y registro histórico

- **DTOs como Records (Java 21)**: Todos los DTOs implementados como records inmutables
  - `CategoriaProductoDTO`
  - `ProductoDTO`
  - `IngredienteDTO`
  - `UnidadDTO`
  - `ProveedorDTO`
  - `RecetaDTO`
  - `MovimientoInventarioDTO`
  - `MermaDTO`

- **Servicios de Negocio**: Lógica completa con validaciones y excepciones personalizadas
  - Borrado lógico en todas las entidades principales
  - Filtros dinámicos (activo/inactivo, búsqueda por nombre, categoría)
  - Cálculo automático de costos de recetas
  - Validación de relaciones y existencia de entidades

- **Controladores REST**: 8 controladores con documentación Swagger
  - `CategoriaProductoController` - `/api/inventario/categorias-productos`
  - `ProductoController` - `/api/inventario/productos`
  - `IngredienteController` - `/api/inventario/ingredientes`
  - `UnidadController` - `/api/inventario/unidades`
  - `ProveedorController` - `/api/inventario/proveedores`
  - `RecetaController` - `/api/inventario/recetas`
  - `MovimientoInventarioController` - `/api/inventario/movimientos`
  - `MermaController` - `/api/inventario/mermas`

- **Migraciones Flyway**: Control de versiones de base de datos
  - `V1__init_core.sql` - Tablas base (roles, sucursales, usuarios)
  - `V2__add_activo_columns_roles_sucursales.sql` - Columnas de activación
  - `R__seed_data.sql` - Datos iniciales idempotentes

- **Colección Postman Unificada**: Colección completa organizada por carpetas
  - Estructura: Autenticación, Salud, Inventario (8 subcarpetas)
  - Scripts automáticos de captura de IDs (token, usuarioId, productoId, categoriaProductoId, ingredienteId, movimientoId, mermaId)
  - Variables de entorno configuradas
  - Archivo: `postman/punto-de-venta.postman_collection.json`

### 🔧 Configuraciones
- **Flyway**: Migración automática de base de datos habilitada
  - Baseline deshabilitado
  - Validación on migrate
  - Migraciones en `src/main/resources/db/migration/`
  
- **JPA/Hibernate**: Configuración híbrida temporal
  - `ddl-auto=update` para tablas no migradas aún
  - Futuro: consolidar todas en migraciones Flyway

- **Logging**: Configuración diferenciada por entorno
  - Desarrollo: Multi-appender (consola + archivo)
  - Producción (Railway): Solo consola para evitar problemas de almacenamiento efímero

### 🔄 Cambiado
- **Eliminados `data.sql` y `data-postgresql.sql`**: Reemplazados por migraciones Flyway repetibles
- **Estructura de Datos**: Semillas ahora idempotentes con `SELECT WHERE NOT EXISTS`
- **GlobalExceptionHandler**: Mejorado para cubrir todas las excepciones del inventario

### 🐛 Corregido
- **PK duplicadas en usuarios**: Resuelto con migraciones idempotentes
- **Fallo healthcheck Railway**: Logging adaptado a filesystem efímero
- **Dependencia circular Flyway/JPA**: Resuelta con migración V1 inicial
- **Exit code 143**: Identificado como SIGTERM manual (no error)
- **404/500 en categorías-productos**: Implementado controlador faltante

### 📚 Documentación
- **API-ENDPOINTS.md**: Documentación completa de todos los endpoints de inventario
- **Actualización README.md**: Sección de inventario y endpoints disponibles
- **Postman**: Colección unificada con instrucciones de importación

### 🧪 Testing
- Arranque validado en dev con H2 y producción con PostgreSQL
- Migraciones Flyway aplicadas correctamente en ambos entornos
- Seed data cargado sin duplicados

---

## [Unreleased]

### 🚧 En Desarrollo
- Implementación de JWT para autenticación
- Sistema de ventas con cálculo automático de costos
- Reportes y analítica
- Tests unitarios y de integración completos

### 📋 Planificado
- Consolidar todas las tablas bajo migraciones Flyway (eliminar ddl-auto)

### 📋 Planificado
- WebSockets para actualizaciones en tiempo real
- Sistema de notificaciones
- Integración con sistemas de pago
- Integración con impresoras térmicas
- App móvil React Native
- App de escritorio Electron/Tauri
- Dashboard administrativo web

---

## Notas de Versión

### [1.0.0] - Baseline Inicial
Esta es la primera versión estable del backend modernizado con Java 21. 
Incluye la estructura completa del proyecto, configuraciones, documentación 
y preparación para desarrollo de funcionalidades.

**Características principales:**
- ✅ Java 21 LTS con Virtual Threads
- ✅ Spring Boot 3.5.7
- ✅ Versionado semántico
- ✅ Documentación OpenAPI/Swagger
- ✅ Soporte para apps móviles y escritorio
- ✅ Base de datos PostgreSQL/MySQL/H2
- ✅ Configuración por entornos
- ✅ Estructura de proyecto profesional

**Estado del proyecto:**
- Backend: ✅ Estructura completa, listo para desarrollo de features
- Frontend: 🚧 Por inicializar
- Base de Datos: ✅ Schema inicial, falta implementación de entidades
- Documentación: ✅ Completa
- Testing: ⚠️ Configurado, falta implementación

---

[1.0.0]: https://github.com/Grxson/punto-de-venta/releases/tag/v1.0.0
[Unreleased]: https://github.com/Grxson/punto-de-venta/compare/v1.0.0...HEAD
