# ⚠️ CONFIGURACIÓN FINAL REQUERIDA

## Estado Actual
- ✓ Servicios creados
- ✓ Código en GitHub (Grxson/punto-de-venta)
- ✗ **rootDirectory NO configurado** ← AQUÍ ESTÁ EL PROBLEMA

## Paso a Paso (CON SCREENSHOTS)

### Dashboard URL
https://railway.com/project/74b2b2b6-c203-44c5-ab12-86d44534b935

### BACKEND Configuration

**Step 1**: En dashboard, haz click en cuadro azul **"backend"**
```
┌─────────────────────────────────────────┐
│  Project: punto de venta                │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  backend    │  │ frontend-web│      │
│  │  Online     │  │  Online     │      │
│  │  (click)    │  │             │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────┘
```

**Step 2**: Ir a pestaña **"Settings"** (no Build, no Deployments - SETTINGS)

**Step 3**: Buscar sección **"Source"** o **"Repository"**

**Step 4**: Campo **"Root Directory"** (o Root Path / Build Path)
```
┌─ Source Settings ────────────────────┐
│ Repository: Grxson/punto-de-venta    │
│ Branch: main                         │
│ Root Directory: [_____________]      │
│                  ↓ ESCRIBIR "backend" │
└──────────────────────────────────────┘
```

**Step 5**: Click **"Redeploy"** (botón rojo/naranja)

**Step 6**: Esperar ~8 minutos. Ver logs en "Deployments" tab.

---

### FRONTEND-WEB Configuration

Repetir los mismos pasos pero:
- Click en **"frontend-web"**
- Root Directory: **"frontend-web"**
- Click Redeploy
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
4. (Si todo falla) Hacer click en el ⋮ (tres puntos) → Settings

---

## URLs Finales (después de fix)

- Backend: https://backend-production-df01.up.railway.app/swagger-ui.html
- Frontend: https://frontend-web-production-05d0.up.railway.app
- DB: postgres.railway.internal:5432

