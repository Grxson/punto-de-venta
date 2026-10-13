# Guía del colaborador de frontend

Esta guía permite trabajar en la interfaz del POS **sin** levantar Spring Boot,
PostgreSQL ni Docker. La app puede consumir datos simulados (MSW) o el backend
real, con exactamente el mismo código de componentes.

Directorio de trabajo: `frontend-web/`.

---

## 1. Requisitos

| Herramienta | Versión | Fuente |
| ----------- | ------- | ------ |
| Git         | reciente | — |
| Node.js     | `>=22.0.0` | `frontend-web/package.json` → `engines.node` |
| npm         | el que acompaña a Node 22 | lockfile versionado (`frontend-web/package-lock.json`) |
| pnpm (opcional) | 11.x | funciona igual, pero el proyecto se instala con npm |

Editor recomendado: **Visual Studio Code** con la extensión **ESLint**. El
proyecto usa la configuración plana de ESLint (`frontend-web/eslint.config.js`).

No se necesita Java, Spring Boot, PostgreSQL ni Docker para el trabajo diario.

---

## 2. Instalación

```bash
git clone <url-del-repositorio>
cd punto-de-venta/frontend-web
npm install
```

> El repositorio es un monorepositorio. El backend vive en `backend/` y no se
> toca para trabajar en el frontend.

---

## 3. Los dos modos de ejecución

| Comando | Modo | Qué hace |
| ------- | ---- | -------- |
| `npm run dev:mock` | **Mock** | Levanta Vite e intercepta las peticiones HTTP con MSW. No requiere backend. |
| `npm run dev:api`  | **API**  | Levanta Vite contra el backend real definido en `src/config/api.config.ts`. |
| `npm run dev`      | API    | Igual que `dev:api` (modo desarrollo por defecto). |

Ambos abren la app en el navegador (por defecto `http://localhost:5173`).

**El conmutador es de infraestructura, no de componentes.** El modo mock se
activa con `vite --mode mock` + `VITE_ENABLE_MOCKS=true` (`frontend-web/.env.mock`).
Los componentes React usan siempre los mismos hooks de datos y el mismo cliente
HTTP (`src/services/api.service.ts`); no deben contener condiciones del tipo
"si estoy en mock...".

### Credenciales de demostración (solo modo mock)

| Usuario | Contraseña | Rol |
| ------- | ---------- | --- |
| `admin` | `admin123` | ADMIN |
| `gerente` | `gerente123` | GERENTE |
| `cajero` | `cajero123` | CAJERO |
| `inactivo` | `inactivo123` | CAJERO (inactivo → 403) |

Son ficticias. Nunca uses credenciales reales en los mocks.

---

## 4. Trabajo con mocks (MSW)

[Mock Service Worker](https://mswjs.io/) intercepta las peticiones `fetch` en el
Service Worker del navegador y responde con datos simulados. En modo mock la URL
base de la API es `/api` (mismo origen que Vite), así que **ninguna petición sale
al backend real**: una ruta sin handler es reportada por MSW en la consola.

Estructura:

```text
frontend-web/
├── public/
│   └── mockServiceWorker.js          # generado por `msw init`
├── src/mocks/
│   ├── config.ts                     # MOCKS_ENABLED y URL base mock
│   ├── browser.ts                    # arranque del worker en el navegador
│   ├── node.ts                       # servidor MSW para los tests
│   ├── db.ts                         # estado simulado + resetMockData()
│   ├── errors.ts                     # forma de error del backend
│   ├── scenarios.ts                  # escenarios 'empty' | 'error' | 'unauthorized'
│   ├── fixtures/
│   │   ├── sucursales.ts
│   │   └── usuarios.ts
│   └── handlers/
│       ├── apiPath.ts                # patrón de ruta
│       ├── auth.handlers.ts
│       ├── sucursales.handlers.ts
│       └── index.ts                  # handlers combinados
└── tests/mocks.test.mjs
```

### Añadir datos de prueba

Edita el fixture correspondiente (`src/mocks/fixtures/*.ts`). Mantén la forma de
los `DTO` del backend (`src/types/*.ts`).

### Añadir o ajustar un handler

Añade el handler en `src/mocks/handlers/*.handlers.ts` usando `apiPath(...)` para
que case cualquier origen (necesario para los tests de Node). Registra el
archivo en `src/mocks/handlers/index.ts` si creas uno nuevo.

### Simular errores y casos límite

Desde la consola del navegador, en modo mock:

```js
__MOCKS__.scenario('empty')          // listados vacíos
__MOCKS__.scenario('error')          // 500 del servidor
__MOCKS__.scenario('unauthorized')   // 403 sin permisos
__MOCKS__.scenario(null)             // volver a la normalidad
__MOCKS__.reset()                    // restaurar los datos iniciales
```

### Restablecer datos

`__MOCKS__.reset()` vuelve a los fixtures originales y limpia el escenario activo.

### ¿Los mocks llegan a producción?

No. `MOCKS_ENABLED` exige `MODE === 'mock'` (imposible en un build de
producción). Además, el plugin `strip-mock-service-worker` de `vite.config.ts`
borra `mockServiceWorker.js` del `dist/`, y el bundle de handlers no se emite.

---

## 5. Trabajo con contratos

- **Tipos del frontend**: `src/types/*.ts` (p. ej. `sucursal.types.ts`,
  `usuario.types.ts`). Son la referencia que usan servicios y hooks.
- **Cliente HTTP**: `src/services/api.service.ts` (único para ambos modos).
  Los servicios por dominio (`src/services/*.service.ts`) solo conocen su endpoint.
- **Hooks de datos**: `src/hooks/*.ts` (TanStack Query). Los componentes consumen
  estos hooks, nunca `fetch` ni los fixtures directamente.
- **Contrato del backend**: el backend expone OpenAPI (`/api-docs` y
  `/v3/api-docs`) y lo describe `backend/src/main/java/.../config/OpenApiConfig.java`.

### Si falta un endpoint

No lo inventes. Añade un handler mock **solo** si el contrato existe en el
backend; si no existe, abre un issue para coordinarlo con el responsable.

### Si un contrato cambió

Actualiza el tipo en `src/types` y el handler/fixture correspondiente, y anótalo
en el PR (sección "Contratos modificados"). Los cambios de contrato se revisan
con el responsable del proyecto.

### Tipos generados desde OpenAPI (opcional, pendiente)

El arranque diario **no** depende de generar tipos. Como tarea puntual de
actualización de contratos se puede generar desde un esquema versionado:

```bash
# Opcional, no instalado por defecto:
# npm i -D openapi-typescript
# npx openapi-typescript http://localhost:8080/api-docs -o src/types/api.generated.ts
```

El archivo generado se versiona y se actualiza solo en tareas de contrato, nunca
en `npm install` ni en `dev:mock`.

### Discrepancia conocida (sucursales)

El backend (`SucursalController`) desactiva y reactiva con:

```
PUT /api/sucursales/{id}/desactivar
PUT /api/sucursales/{id}/reactivar
```

Pero `src/services/sucursales.service.ts` usa `DELETE /sucursales/{id}` y
`POST /sucursales/{id}/reactivar`. Los mocks replican el contrato **real** del
backend. Corregir el servicio del frontend es parte de la primera tarea de
sucursales (ver `docs/development/next-task-branch-management.md`), no de esta
infraestructura.

---

## 6. Verificaciones locales

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # node --test (handlers MSW + utilidades)
npm run build       # build de producción (no requiere backend)
```

`npm test` ejecuta los handlers de MSW en Node (`src/mocks/node.ts`), por lo que
valida los contratos que verás en `dev:mock`.

---

## 7. Entrega de cambios

```bash
git fetch origin

# Crear rama desde la base correcta (consulta con el responsable si dudas:
# la rama de integración puede no ser `main`)
git switch -c feat/frontend-example

# Desarrollar y verificar
npm run lint && npm run typecheck && npm test && npm run build

git add <archivos-del-cambio>
git commit -m "feat(frontend): add example UI"

git push -u origin feat/frontend-example
```

Luego abre un Pull Request usando la plantilla e indica si el cambio está
**UI Ready** (funciona con mocks) o **Integrated** (validado contra el backend).
Solicita revisión al responsable.

---

## 8. Límites de responsabilidad

Puedes trabajar con normalidad en:

- Pantallas, layouts y componentes React.
- Estilos Material UI, formularios y UX.
- Responsive (desktop/tablet/móvil).
- Tests de frontend.
- Mocks compatibles con los contratos existentes.
- Documentación de frontend.

Coordina **antes** de tocar:

- Backend (`backend/`), migraciones Flyway y reglas de negocio.
- Permisos, roles, autenticación y configuración de seguridad.
- Contratos de API y tipos compartidos con el backend.
- Configuración de despliegue (Railway, CI/CD).

---

## 9. Responsive

- **Desktop / táctil**: experiencia prioritaria (el POS se opera en mostrador).
  Controles grandes (botones ≥48 px), densidad de tabla `small`.
- **Tablet**: mismo layout, drawer de navegación deslizable.
- **Móvil**: columnas apiladas; nunca sacrificar la experiencia de escritorio
  para conseguir un responsive superficial.
