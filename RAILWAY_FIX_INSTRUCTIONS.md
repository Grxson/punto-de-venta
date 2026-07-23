# 🚀 Railway Deployment - Final Fix Required

**Status**: Services deployed but rootDirectory not configured. Need 2 manual steps.

**Dashboard**: https://railway.com/project/74b2b2b6-c203-44c5-ab12-86d44534b935

---

## Step 1: Configure Backend Service

1. Go to dashboard → Click **backend** service
2. Go to **Settings** → **Source**
3. Look for **Root Directory** field
4. Set to: `backend`
5. Click **Redeploy**
6. Wait ~5 min for build to complete

**Service IDs**:
- Backend: `fe8ffbba-d4b7-49b3-b23c-2035a9cc1ad7`
- Repo: `Grxson/punto-de-venta`
- Branch: `main`

---

## Step 2: Configure Frontend-web Service

1. Go to dashboard → Click **frontend-web** service
2. Go to **Settings** → **Source**
3. Look for **Root Directory** field
4. Set to: `frontend-web`
5. Click **Redeploy**
6. Wait ~5 min for build to complete

**Service IDs**:
- Frontend-web: `4bc5fbed-17e1-43b7-b45f-f6c43a8252dd`
- Repo: `Grxson/punto-de-venta`
- Branch: `main`

---

## Expected Result After Fix

✅ Backend build: Maven compile → Spring Boot JAR  
✅ Frontend build: npm install → Vite build → serve dist/  
✅ Both will have Railway-assigned domains  
✅ PostgreSQL auto-linked via DATABASE_URL  

---

## Domains

- Backend: https://backend-production-df01.up.railway.app
- Frontend: https://frontend-web-production-05d0.up.railway.app
- Postgres: postgres.railway.internal:5432

---

## If Still Issues

Check logs:
```bash
railway logs --service backend --tail 200
railway logs --service frontend-web --tail 200
```

Check variables:
```bash
railway variable list --service backend
railway variable list --service frontend-web
```
