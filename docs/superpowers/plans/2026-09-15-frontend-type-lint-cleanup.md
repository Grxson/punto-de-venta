# Plan de implementación de limpieza de tipos y lint del frontend

> **Para trabajadores agénticos:** SUB-SKILL REQUERIDO: usa superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan la sintaxis de casillas (`- [ ]`) para dar seguimiento.

**Objetivo:** Dejar el frontend sin errores de TypeScript ni ESLint y reparar el comando de verificación Node sin cambiar comportamiento de negocio.

**Arquitectura:** Corregir los contratos en la capa que posee cada dato, normalizar los valores de MUI Select en el borde de UI y configurar cada entorno de lint explícitamente. Los gates existentes (`tsc`, ESLint, verify, pruebas y build) sirven como regresiones en rojo/verde.

**Stack tecnológico:** React 18, TypeScript 5.3, MUI 5, React Query 5, Vite 5, ESLint 9, Node 24.

**Especificación:** Diagnóstico reproducido en la conversación del 2026-09-15: 19 errores TypeScript, 389 errores ESLint y `npm run verify` roto por CommonJS bajo ESM.

## Restricciones globales

- Preservar el hotfix de caja y todos los cambios preexistentes.
- No modificar `.gitignore`.
- No añadir dependencias.
- No desactivar reglas funcionales como Rules of Hooks.
- Alinear reglas de tipos relajadas con `tsconfig.app.json` sin presentar warnings de estilo como errores de compilación.
- No crear commits.

---

### Tarea 1: Configuración TypeScript ejecutable

**Archivos:**
- Modificar: `frontend-web/tsconfig.app.json`
- Modificar: `frontend-web/tsconfig.node.json`

**Interfaces:**
- Produces: `npx tsc -b` ejecutable con incremental metadata en `node_modules/.tmp`.

- [x] Confirmar que `npx tsc -p tsconfig.app.json --noEmit` falla con TS5069.
- [x] Añadir `incremental: true` junto a cada `tsBuildInfoFile`.
- [x] Ejecutar `npx tsc -b --pretty false`; debe avanzar a los errores de código y no volver a emitir TS5069.

### Tarea 2: Valores MUI Select coherentes

**Archivos:**
- Modificar: `frontend-web/src/components/admin/UsuarioForm.tsx`
- Modificar: `frontend-web/src/components/admin/UsuariosTable.tsx`

**Interfaces:**
- `UsuarioFormData.rolId` y `sucursalId`: strings en UI, convertidos con `Number` al DTO.
- Filtros y selects de tabla: strings en MUI, convertidos a boolean/number para lógica y callbacks.

- [x] Usar el typecheck rojo que reporta cuatro TS2322.
- [x] Normalizar defaults, opciones y valores de Select a strings.
- [x] Eliminar imports no usados encontrados por lint.
- [x] Ejecutar `npx tsc -b --pretty false` y confirmar que los cuatro TS2322 desaparecen.

### Tarea 3: Contratos de dominio y API

**Archivos:**
- Modificar: `frontend-web/src/types/categorias.types.ts`
- Modificar: `frontend-web/src/pages/admin/AdminRecipes.tsx`
- Modificar: `frontend-web/src/services/ingredientes.service.ts`
- Modificar: `frontend-web/src/pages/pos/PosExpenses.tsx`

**Interfaces:**
- `CategoriaProducto.orden?: number`.
- `RecetaIngrediente.costoTotal?: number`.
- Productos de recetas consumidos desde `ApiResponse.data`.
- Payload de validación reconocido mediante type guard desde `unknown`.
- Un solo tipo `Proveedor` visible en PosExpenses.

- [x] Usar los diez errores TS2353/TS2339/TS2440 existentes como prueba roja.
- [x] Corregir cada contrato en su tipo propietario y eliminar la ambigüedad de respuesta.
- [x] Ejecutar `npx tsc -b --pretty false`; esos diez errores deben desaparecer.

### Tarea 4: Entorno Vite y retornos de efectos

**Archivos:**
- Modificar: `frontend-web/src/components/ErrorBoundary.tsx`
- Modificar: `frontend-web/src/config/queryClient.ts`
- Modificar: `frontend-web/src/hooks/useServiceWorker.ts`
- Modificar: `frontend-web/src/pages/pos/PosHome.tsx`

**Interfaces:**
- Consume `import.meta.env.DEV`, opciones React Query v5 válidas y callbacks de efectos con retorno explícito.

- [x] Usar los cuatro errores TS2591/TS2322/TS7030 como prueba roja.
- [x] Sustituir `process.env`, usar `true` para refetch-if-stale y retornar `undefined` en salidas tempranas.
- [x] Ejecutar `npx tsc -b --pretty false`; debe terminar con código 0.

### Tarea 5: ESLint por entorno y verificador Node

**Archivos:**
- Modificar: `frontend-web/eslint.config.js`
- Modificar: `frontend-web/verify-build.js`

**Interfaces:**
- Scripts CJS reciben globals Node/CommonJS.
- `public/env-config.js` recibe globals browser.
- Reglas deliberadamente relajadas en tsconfig dejan de ser errores ESLint.
- `npm run verify` ejecuta el verificador como módulo ESM.

- [x] Confirmar `npm run lint` con 389 errores y `npm run verify` con `require is not defined`.
- [x] Configurar ignores para scripts legacy de reparación, overrides Node/browser y severidad coherente para any/unused/empty/useless-catch.
- [x] Convertir el verificador CommonJS a ESM sin cambiar el script público.
- [x] Ejecutar `npm run lint -- --max-warnings 999` y `npm run verify`; ambos deben terminar con código 0.

### Verificación final

- [x] Ejecutar `npx tsc -b --pretty false`.
- [x] Ejecutar `npm run lint -- --max-warnings 999`.
- [x] Ejecutar `node --test tests/*.test.mjs`.
- [x] Ejecutar `npm run build:prod`.
- [x] Ejecutar `npm run verify`.
- [x] Ejecutar `git diff --check` y revisar `git status --short`.
