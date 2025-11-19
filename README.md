# punto-de-venta

Sistema de Punto de Venta con arquitectura moderna y multiplataforma.

## Estructura del Proyecto

- **backend/**: API RESTful en Java con Spring Boot
- **frontend/**: Aplicación multiplataforma en React Native
- **docs/**: Documentación completa del sistema

## Backend (Java + Spring Boot)

### Tecnologías
- Java 21 LTS
- Spring Boot 3.5.7
- Maven
- H2 Database (desarrollo)
- MySQL (producción)

### Dependencias principales
- Spring Web (API RESTful)
- Spring Data JPA (Persistencia)
- Spring Security (Autenticación y roles)
- Spring Validation (Validación de datos)
- Spring Boot Actuator (Monitoreo)
- Spring Boot DevTools (Desarrollo)
- Swagger/OpenAPI (Documentación de API)

### Ejecutar el backend
```bash
cd backend
./mvnw spring-boot:run
```

La API estará disponible en `http://localhost:8080`  
Documentación Swagger: `http://localhost:8080/swagger-ui.html`

## Frontend (React Native)

### Tecnologías
- React Native 0.76.5
- React 18.3.1
- TypeScript 5.0.4
- Node.js 18+ (recomendado 24+)

### Ejecutar el frontend
```bash
cd frontend
npm install
npm start
# En otra terminal: npm run android o npm run ios
```

La aplicación se conectará al backend en `http://localhost:8080`

## Documentación

- Flujos internos del punto de venta: `docs/flujo-interno.md`
- Área administrativa
	- Visión y alcance: `docs/admin/vision.md`
	- Inventario, recetas y mermas: `docs/admin/inventario.md`
	- Finanzas (ingresos, gastos y caja): `docs/admin/finanzas.md`
	- Reportes y analítica: `docs/admin/reportes.md`
- Seguridad y roles: `docs/admin/seguridad.md`
- Operación diaria: `docs/admin/operacion.md`
- Modelo de datos (propuesta): `docs/datos/modelo-datos.md`
- Especificación de BD (tablas, índices, vistas): `docs/datos/especificacion-bd.md`
- Escalabilidad de datos: `docs/datos/escalabilidad.md`
- Consultas SQL para KPIs: `docs/datos/reportes-sql.md`
