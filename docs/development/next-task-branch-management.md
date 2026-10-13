# Tarea preparada: `feat(frontend): implement branch management UI`

> Lista para crear como Issue y asignar al colaborador de frontend. No forma
> parte del PR de infraestructura. Confirmar el alcance funcional antes de
> publicarla.

**Título:** `feat(frontend): implement branch management UI`

**Labels sugeridos:** `frontend`

## Objetivo

Construir la interfaz completa de administración de sucursales
(Organization + Branch) usando la infraestructura de mocks (`dev:mock`) y
dejarla lista para conectarse al backend real sin reescrituras.

Punto de partida ya existente en el PR de infraestructura: la pantalla
demostrativa `frontend-web/src/pages/admin/AdminSucursales.tsx` (solo lectura,
búsqueda y filtro de estado).

## Rutas o pantallas

- `/admin/sucursales` (ya enrutada y en el menú lateral de `AdminLayout`).

## Diseño esperado

- Listado en `Table` (densidad `small`) con columnas: nombre, dirección,
  teléfono, estado.
- Búsqueda por nombre/dirección y filtro por estado (todas / activas / inactivas).
- Diálogo de alta/edición (`react-hook-form` + MUI, consistente con el resto del
  admin).
- Confirmación antes de desactivar/reactivar.
- Responsive: tabla usable en desktop; en móvil, columnas apiladas.

## Contratos utilizados

- `GET /api/sucursales?activo=true|false` → `Sucursal[]`
- `GET /api/sucursales/{id}` → `Sucursal` (404 si no existe)
- `POST /api/sucursales` → `Sucursal` (201; 400 con `validationErrors`)
- `PUT /api/sucursales/{id}` → `Sucursal`
- `PUT /api/sucursales/{id}/desactivar` → `Sucursal`
- `PUT /api/sucursales/{id}/reactivar` → `Sucursal`
- Tipos: `frontend-web/src/types/sucursal.types.ts`

## Fixtures disponibles

- `frontend-web/src/mocks/handlers/sucursales.handlers.ts`
- `frontend-web/src/mocks/fixtures/sucursales.ts` (3 activas, 2 inactivas)
- Escenarios: `__MOCKS__.scenario('empty' | 'error' | 'unauthorized')`

## Acciones permitidas

Listar, buscar, filtrar, crear, editar y cambiar estado (desactivar/reactivar).
No modificar el backend ni los contratos.

## Estados de interfaz

- [ ] Carga (skeleton o spinner)
- [ ] Vacío (sin resultados de filtro)
- [ ] Error (mensaje comprensible; incluye 403/500)
- [ ] Éxito (listado y confirmaciones)

## Criterios de aceptación

- [ ] La pantalla funciona en `npm run dev:mock` con los fixtures existentes.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pasan.
- [ ] Estados de carga, vacío y error verificados con los escenarios de MSW.
- [ ] Formulario con validaciones (nombre y dirección obligatorios).
- [ ] Se corrige la discrepancia de verbos en `sucursales.service.ts`
      (`DELETE`→`PUT /{id}/desactivar`, `POST`→`PUT /{id}/reactivar`).
- [ ] PR marcado como **UI Ready** o **Integrated** según se valide o no contra
      el backend.

## Fuera de alcance

- Cambios en `backend/`, migraciones o `SecurityConfig`.
- Nuevos endpoints o modificaciones de contrato.
- Otros módulos del panel administrativo.
