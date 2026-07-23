# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

**punto-de-venta** is a monorepo POS system with three independent services:

```
punto-de-venta/
├── backend/          Java 21 + Spring Boot 3.5.7 API (port 8080)
├── frontend-web/     React 18 + TypeScript 5 + Vite web app (port 3000)
└── docs/            Business logic, data models, flows
```

Each service builds and deploys independently to Railway. The codebase follows semantic versioning in `backend/pom.xml`.

### Database
PostgreSQL on Railway. Flyway migrations manage schema (26 migrations: V001 through V1.0.1). Backend profile `railway` auto-runs migrations on startup.

## Tech Stack

**Backend**
- Java 21 LTS, Spring Boot 3.5.7 with Maven (./mvnw)
- Spring Security (HTTP Basic Auth, JWT planned)
- Spring Data JPA + Hibernate
- Flyway migrations
- Swagger/OpenAPI documentation
- Spring WebSocket (STOMP/SockJS for real-time)

**Frontend-web**
- React 18.2, TypeScript 5.3, Vite 5.0
- Material-UI (MUI) 5.15, React Query 5.32
- Axios for HTTP, stomp/stompjs for WebSocket
- Serves with `serve` package on custom PORT

**Environment Variable Injection Strategy (Critical)**
- Vite substitutes import.meta.env.* at BUILD-TIME
- Railway sets env vars at RUNTIME (after build)
- Solution: frontend-web/public/env-config.js runs BEFORE React bundle loads
  - Auto-detects production via hostname pattern (frontend-web-production-*.up.railway.app)
  - Injects correct URLs into window.__ENV__
  - api.config.ts reads window.__ENV__ first, then import.meta.env, then fallbacks
- DO NOT hardcode backend URLs in TypeScript—use this two-layer injection

## Key Commands

### Backend

```bash
# Verify compilation (quick syntax check)
cd backend && ./mvnw clean compile

# Build JAR (creates target/backend-*.jar)
cd backend && ./mvnw clean package -DskipTests

# Run with Railway database (dev profile)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run locally with H2 (no DATABASE_URL required)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev-local

# Full test suite (slow, runs all tests)
cd backend && ./mvnw clean package
```

**Endpoints**
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI spec: http://localhost:8080/v3/api-docs
- H2 Console (dev-local): http://localhost:8080/h2-console

### Frontend-web

```bash
# Install dependencies
cd frontend-web && npm install

# Dev server with hot reload
cd frontend-web && npm run dev  # Runs on :5173

# Production build
cd frontend-web && npm run build:prod  # Outputs dist/

# Test production build locally
cd frontend-web && npm run preview:prod
```

**Key files**
- src/config/api.config.ts — API URL resolution (runtime env vars)
- src/services/websocket.service.ts — STOMP/WebSocket with protocol conversion (http→ws, https→wss)
- public/env-config.js — Runtime environment injection (MUST load before React app)

## Railway Deployment

**Current Setup**
- Project: "punto de venta" on Railway
- Backend service: backend-production-df01 (Java)
- Frontend service: frontend-web-production-* (Node)
- Database: PostgreSQL on Railway

**Manual Dashboard Steps Required**
Each service needs rootDirectory configured in Railway Settings > Source:
- Backend: Set to backend/
- Frontend-web: Set to frontend-web/

Without these, Railway searches repo root instead of subdirectories.

**Deploy Process**
1. Push to repository (Railway auto-detects changes)
2. Uses Procfile or nixpacks.toml for build/start commands
3. Backend: compiles JAR via Maven, runs with Spring profile railway
4. Frontend: runs npm install && npm run build:prod, serves with serve on PORT

**Environment Variables (Railway Dashboard)**

Backend:
- DATABASE_URL — PostgreSQL connection string (auto-populated)
- SPRING_PROFILES_ACTIVE — set to railway
- CORS_ALLOWED_ORIGINS — comma-separated list of frontend domains

Frontend-web:
- None required for most deployments
- If needed, VITE_API_URL_PROD can be set (overrides detection in env-config.js)

## Important Codebase Rules

### Java 21 - Mandatory Patterns

**Records for DTOs** (never traditional classes):
```java
public record ProductoDTO(Long id, String nombre, BigDecimal precio) {
    public ProductoDTO {
        if (precio.compareTo(BigDecimal.ZERO) < 0) 
            throw new IllegalArgumentException("El precio no puede ser negativo");
    }
}
```

**Pattern Matching over if-else:**
```java
return switch (ex) {
    case EntityNotFoundException e -> ResponseEntity.notFound().build();
    case ValidationException e -> ResponseEntity.badRequest().body(e.getMessage());
    default -> ResponseEntity.internalServerError().build();
};
```

**Sequenced Collections for ordered operations:**
```java
productos.getFirst()  // not .get(0)
productos.getLast()   // not .get(size-1)
```

**Virtual Threads enabled** in application.properties:
```java
@Async
public CompletableFuture<T> procesarPedido(PedidoDTO dto) { ... }
```

See .github/copilot-instructions-java21.md for full Java 21 guide.

### Code Structure

**Backend package layout:**
```
com.puntodeventa.backend/
├── config/      CORS, Security, OpenAPI
├── controller/  RestController endpoints
├── service/     Service business logic
├── repository/  Repository (Spring Data JPA)
├── model/       Entity JPA entities
├── dto/         Records only for DTOs
├── mapper/      MapStruct Entity <-> DTO
├── exception/   Custom exceptions
└── util/        Helpers
```

**Naming conventions:**
- Entity: Producto (singular)
- Repository: ProductoRepository
- Service: ProductoService
- Controller: ProductoController
- DTO/Record: ProductoDTO, CreateProductoDTO
- Mapper: ProductoMapper

**Swagger required on all endpoints:**
```java
@Operation(summary = "...", description = "...")
@ApiResponses(value = {...})
@Parameter(description = "...")
```

### Frontend

**No hardcoded URLs** — all API calls use API_CONFIG.apiUrl from src/config/api.config.ts.

**WebSocket protocol conversion:**
- Use websocket.service.ts:convertToWebSocketUrl() to convert http/https to ws/wss
- Prevents "insecure SockJS connection from HTTPS page" errors

**Runtime vs build-time env:**
- env-config.js loads BEFORE React app (injected in index.html before main.tsx)
- Use window.__ENV__ for production URLs
- Fallback to import.meta.env for build-time vars

## Testing

- Backend unit/integration tests: ./mvnw clean package (skipped in CI by default with -DskipTests)
- Frontend ESLint: npm run lint
- Postman collection exists for manual API testing

## Documentation

Refer to:
- .github/copilot-instructions.md — Project-level rules, architecture
- .github/copilot-instructions-java21.md — Java 21 features & patterns
- backend/README.md — Backend-specific setup
- docs/ — Business logic, data models, security rules

## Common Pitfalls

1. Hardcoding backend URLs — Use API_CONFIG.apiUrl always
2. WebSocket protocol mismatch — Use convertToWebSocketUrl() for production HTTPS
3. Docker cache stale code — Railway redeploys may use cached layers; push a new commit or manually trigger
4. Env vars after build — Vite doesn't see Railway-injected vars; use env-config.js at runtime
5. Missing rootDirectory — Backend and frontend won't build correctly on Railway without it configured
6. Circular dependency in Java — Avoid service-to-service injection; use constructor injection or refactor
7. N+1 query problems — Use Query projections in repositories, avoid loading full entities

## Git Workflow

Branches: main (production) <- develop (integration) <- feature/* (work in progress)

Commit messages (Spanish, semantic):
- feat: new feature
- fix: bug fix
- docs: documentation
- refactor: code refactoring
- test: tests
- chore: maintenance

Tag releases: vX.Y.Z on main after merge from develop.
