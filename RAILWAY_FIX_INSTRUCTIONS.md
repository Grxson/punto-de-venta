# 🚀 Despliegue en Railway - Corrección Final Requerida

**Estado**: Servicios desplegados pero rootDirectory no configurado. Se necesitan 2 pasos manuales.

**Dashboard**: https://railway.com/project/74b2b2b6-c203-44c5-ab12-86d44534b935

---

## Paso 1: Configurar el Servicio Backend

1. Ir al dashboard → Hacer clic en el servicio **backend**
2. Ir a **Settings** → **Source**
3. Buscar el campo **Root Directory**
4. Establecer en: `backend`
5. Hacer clic en **Redeploy**
6. Esperar ~5 min a que termine la compilación

**IDs de los servicios**:
- Backend: `fe8ffbba-d4b7-49b3-b23c-2035a9cc1ad7`
- Repo: `Grxson/punto-de-venta`
- Rama: `main`

---

## Paso 2: Configurar el Servicio Frontend-web

1. Ir al dashboard → Hacer clic en el servicio **frontend-web**
2. Ir a **Settings** → **Source**
3. Buscar el campo **Root Directory**
4. Establecer en: `frontend-web`
5. Hacer clic en **Redeploy**
6. Esperar ~5 min a que termine la compilación

**IDs de los servicios**:
- Frontend-web: `4bc5fbed-17e1-43b7-b45f-f6c43a8252dd`
- Repo: `Grxson/punto-de-venta`
- Rama: `main`

---

## Resultado Esperado Tras la Corrección

✅ Compilación del backend: Maven compile → Spring Boot JAR  
✅ Compilación del frontend: npm install → Vite build → serve dist/  
✅ Ambos tendrán dominios asignados por Railway  
✅ PostgreSQL enlazado automáticamente vía DATABASE_URL  

---

## Dominios

- Backend: https://backend-production-4bc3.up.railway.app
- Frontend: https://frontend-web-production-05d0.up.railway.app
- Postgres: postgres.railway.internal:5432

---

## Si Aún Hay Problemas

Revisar los logs:
```bash
railway logs --service backend --tail 200
railway logs --service frontend-web --tail 200
```

Revisar las variables:
```bash
railway variable list --service backend
railway variable list --service frontend-web
```