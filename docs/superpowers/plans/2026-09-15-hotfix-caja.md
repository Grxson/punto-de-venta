# Plan de implementación del hotfix de caja

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDO: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan la sintaxis de casillas (`- [ ]`) para dar seguimiento.

**Objetivo:** Eliminar cuatro fallos de caja: fallback WebSocket obsoleto, carrito persistente tras logout, refresh-token concurrente y doble envío de gastos.

**Arquitectura:** Mantener los cambios en la capa responsable. La configuración WebSocket reutilizará `API_CONFIG`; la limpieza de sesión y las primitivas de concurrencia vivirán en utilidades puras con pruebas Node; los formularios conservarán su UI y usarán un lock síncrono por instancia.

**Stack tecnológico:** React 18, TypeScript 5.3, Vite 5, Node 24 `node:test`.

**Especificación:** Reporte end-to-end proporcionado por el usuario en la conversación del 2026-09-15.

## Restricciones globales

- No añadir dependencias.
- No tocar `.gitignore` ni otros cambios preexistentes.
- No ampliar el alcance a los hallazgos P1/P2.
- No crear commits sin petición explícita.

---

### Tarea 1: Resolución de WebSocket

**Archivos:**
- Crear: `frontend-web/src/utils/websocketUrl.ts`
- Crear: `frontend-web/tests/websocket-url.test.mjs`
- Modificar: `frontend-web/src/services/websocket.service.ts`
- Modificar: `frontend-web/src/config/api.config.ts`
- Modificar: `frontend-web/.env.example`

**Interfaces:**
- Consume: `API_CONFIG.apiUrl`.
- Produce: `toWebSocketEndpoint(apiUrl: string): string`.

- [x] Escribir una prueba que derive `/ws` desde una URL API HTTPS y preserve el host configurado.
- [x] Ejecutar `node --test tests/websocket-url.test.mjs` y comprobar que falla porque la utilidad aún no existe.
- [x] Implementar `toWebSocketEndpoint`, usar `API_CONFIG.apiUrl` en el servicio y reemplazar fallbacks `-df01` por `-4bc3`.
- [x] Repetir la prueba y comprobar que pasa.

### Tarea 2: Limpieza de sesión y carrito

**Archivos:**
- Crear: `frontend-web/src/utils/clientSession.ts`
- Crear: `frontend-web/tests/client-session.test.mjs`
- Modificar: `frontend-web/src/hooks/useLogout.ts`

**Interfaces:**
- Produce: `clearClientSession(local: StorageLike, session: ClearableStorage): void`.

- [x] Escribir una prueba con almacenamientos en memoria que compruebe la eliminación de `cart` y datos de autenticación.
- [x] Ejecutar `node --test tests/client-session.test.mjs` y comprobar el fallo por módulo ausente.
- [x] Implementar la limpieza centralizada y usarla desde `useLogout`.
- [x] Repetir la prueba y comprobar que pasa.

### Tarea 3: Refresh-token single-flight

**Archivos:**
- Crear: `frontend-web/src/utils/concurrency.ts`
- Crear: `frontend-web/tests/concurrency.test.mjs`
- Modificar: `frontend-web/src/services/api.service.ts`

**Interfaces:**
- Produce: `createSingleFlight<T>(): (operation: () => Promise<T>) => Promise<T>`.

- [x] Escribir pruebas que lancen dos operaciones concurrentes y esperen una sola ejecución, y una nueva ejecución tras finalizar.
- [x] Ejecutar `node --test tests/concurrency.test.mjs` y comprobar el fallo por módulo ausente.
- [x] Implementar la primitiva y envolver todo el flujo de refresh en una única promesa compartida.
- [x] Repetir la prueba y comprobar que pasa.

### Tarea 4: Lock síncrono de envío de gastos

**Archivos:**
- Modificar: `frontend-web/src/utils/concurrency.ts`
- Modificar: `frontend-web/tests/concurrency.test.mjs`
- Modificar: `frontend-web/src/pages/pos/PosExpenses.tsx`
- Modificar: `frontend-web/src/pages/admin/AdminExpenses.tsx`

**Interfaces:**
- Produce: `acquireLock(lock: MutableBoolean): boolean` y `releaseLock(lock: MutableBoolean): void`.

- [x] Añadir una prueba que rechace la segunda adquisición y permita otra tras liberar.
- [x] Ejecutar la prueba y comprobar que falla por exports ausentes.
- [x] Añadir un `useRef(false)` por formulario, adquirir antes de cualquier await y liberar en `finally`.
- [x] Repetir las pruebas, ejecutar lint enfocado y `npm run build:prod`.

### Verificación final

- [x] Ejecutar `node --test tests/*.test.mjs`.
- [x] Ejecutar `npx eslint` sobre los archivos TypeScript/TSX modificados (el gate conserva errores preexistentes documentados).
- [x] Ejecutar `npm run build:prod` y comparar los avisos con la línea base.
- [x] Revisar `git diff --check`, `git diff` y `git status --short`.
