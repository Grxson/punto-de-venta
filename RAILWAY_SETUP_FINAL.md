# ⚠️ CONFIGURACIÓN FINAL REQUERIDA

## Estado Actual
- ✓ Servicios creados
- ✓ Código en GitHub (Grxson/punto-de-venta)
- ✗ **rootDirectory NO configurado** ← AQUÍ ESTÁ EL PROBLEMA

## Paso a Paso (CON CAPTURAS DE PANTALLA)

### URL del Dashboard
https://railway.com/project/74b2b2b6-c203-44c5-ab12-86d44534b935

### Configuración del BACKEND

**Paso 1**: En el dashboard, haz clic en el cuadro azul **"backend"**
```
┌─────────────────────────────────────────┐
│  Proyecto: punto de venta               │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  backend    │  │ frontend-web│      │
│  │  En línea   │  │  En línea   │      │
│  │  (clic)     │  │             │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

**Paso 2**: Ir a la pestaña **"Settings"** (no Build, no Deployments - SETTINGS)

**Paso 3**: Buscar la sección **"Source"** o **"Repository"**

**Paso 4**: Campo **"Root Directory"** (o Root Path / Build Path)
```
┌─ Configuración de Source ─────────────┐
│ Repository: Grxson/punto-de-venta      │
│ Branch: main                           │
│ Root Directory: [_____________]        │
│                  ↓ ESCRIBIR "backend"  │
└────────────────────────────────────────┘
```

**Paso 5**: Clic en **"Redeploy"** (botón rojo/naranja)

**Paso 6**: Esperar ~8 minutos. Ver los logs en la pestaña "Deployments".

---

### Configuración del FRONTEND-WEB

Repetir los mismos pasos pero:
- Clic en **"frontend-web"**
- Root Directory: **"frontend-web"**
- Clic en Redeploy
- Esperar ~8 minutos

---

## Verificación (CLI)

Después de configurar, ejecutar:

```bash
railway logs --service backend --tail 50
# Deberías ver: "Downloading Maven" y compilación Java

railway logs --service frontend-web --tail 50
# Deberías ver: "npm install" y "npm run build:prod"
```

Si ves:
✓ `[INFO] Building jar` (backend)
✓ `npm run build:prod` (frontend)
→ **Funciona correctamente**

Si ves:
✗ Caddy 404
✗ "Cannot find module"
→ rootDirectory todavía no configurado

---

## Si No Encuentras el Campo

Prueba en diferentes pestañas:
1. Settings → Source
2. Settings → Build
3. Deployments → Edit Configuration
4. (Si todo falla) Hacer clic en el ⋮ (tres puntos) → Settings

---

## URLs Finales (después de la corrección)

- Backend: https://backend-production-4bc3.up.railway.app/swagger-ui.html
- Frontend: https://frontend-web-production-05d0.up.railway.app
- DB: postgres.railway.internal:5432
