# Hotfix de caja Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar cuatro fallos de caja: fallback WebSocket obsoleto, carrito persistente tras logout, refresh-token concurrente y doble envío de gastos.

**Architecture:** Mantener los cambios en la capa responsable. La configuración WebSocket reutilizará `API_CONFIG`; la limpieza de sesión y las primitivas de concurrencia vivirán en utilidades puras con pruebas Node; los formularios conservarán su UI y usarán un lock síncrono por instancia.

**Tech Stack:** React 18, TypeScript 5.3, Vite 5, Node 24 `node:test`.

**Spec:** Reporte end-to-end proporcionado por el usuario en la conversación del 2026-09-15.

## Global Constraints

- No añadir dependencias.
- No tocar `.gitignore` ni otros cambios preexistentes.
- No ampliar el alcance a los hallazgos P1/P2.
- No crear commits sin petición explícita.

---

### Task 1: Resolución de WebSocket

**Files:**
- Create: `frontend-web/src/utils/websocketUrl.ts`
- Create: `frontend-web/tests/websocket-url.test.mjs`
- Modify: `frontend-web/src/services/websocket.service.ts`
- Modify: `frontend-web/src/config/api.config.ts`
- Modify: `frontend-web/.env.example`

**Interfaces:**
- Consumes: `API_CONFIG.apiUrl`.
- Produces: `toWebSocketEndpoint(apiUrl: string): string`.

- [x] Escribir una prueba que derive `/ws` desde una URL API HTTPS y preserve el host configurado.
- [x] Ejecutar `node --test tests/websocket-url.test.mjs` y comprobar que falla porque la utilidad aún no existe.
- [x] Implementar `toWebSocketEndpoint`, usar `API_CONFIG.apiUrl` en el servicio y reemplazar fallbacks `-df01` por `-4bc3`.
- [x] Repetir la prueba y comprobar que pasa.

### Task 2: Limpieza de sesión y carrito

**Files:**
- Create: `frontend-web/src/utils/clientSession.ts`
- Create: `frontend-web/tests/client-session.test.mjs`
- Modify: `frontend-web/src/hooks/useLogout.ts`

**Interfaces:**
- Produces: `clearClientSession(local: StorageLike, session: ClearableStorage): void`.

- [x] Escribir una prueba con almacenamientos en memoria que compruebe la eliminación de `cart` y datos de autenticación.
- [x] Ejecutar `node --test tests/client-session.test.mjs` y comprobar el fallo por módulo ausente.
- [x] Implementar la limpieza centralizada y usarla desde `useLogout`.
- [x] Repetir la prueba y comprobar que pasa.

### Task 3: Refresh-token single-flight

**Files:**
- Create: `frontend-web/src/utils/concurrency.ts`
- Create: `frontend-web/tests/concurrency.test.mjs`
- Modify: `frontend-web/src/services/api.service.ts`

**Interfaces:**
- Produces: `createSingleFlight<T>(): (operation: () => Promise<T>) => Promise<T>`.

- [x] Escribir pruebas que lancen dos operaciones concurrentes y esperen una sola ejecución, y una nueva ejecución tras finalizar.
- [x] Ejecutar `node --test tests/concurrency.test.mjs` y comprobar el fallo por módulo ausente.
- [x] Implementar la primitiva y envolver todo el flujo de refresh en una única promesa compartida.
- [x] Repetir la prueba y comprobar que pasa.

### Task 4: Lock síncrono de envío de gastos

**Files:**
- Modify: `frontend-web/src/utils/concurrency.ts`
- Modify: `frontend-web/tests/concurrency.test.mjs`
- Modify: `frontend-web/src/pages/pos/PosExpenses.tsx`
- Modify: `frontend-web/src/pages/admin/AdminExpenses.tsx`

**Interfaces:**
- Produces: `acquireLock(lock: MutableBoolean): boolean` y `releaseLock(lock: MutableBoolean): void`.

- [x] Añadir una prueba que rechace la segunda adquisición y permita otra tras liberar.
- [x] Ejecutar la prueba y comprobar que falla por exports ausentes.
- [x] Añadir un `useRef(false)` por formulario, adquirir antes de cualquier await y liberar en `finally`.
- [x] Repetir las pruebas, ejecutar lint enfocado y `npm run build:prod`.

### Final verification

- [x] Ejecutar `node --test tests/*.test.mjs`.
- [x] Ejecutar `npx eslint` sobre los archivos TypeScript/TSX modificados (el gate conserva errores preexistentes documentados).
- [x] Ejecutar `npm run build:prod` y comparar los avisos con el baseline.
- [x] Revisar `git diff --check`, `git diff` y `git status --short`.
