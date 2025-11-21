# 🚀 Guía Rápida de Despliegue - Punto de Venta

Esta guía resume los pasos para desplegar el sistema completo en Railway (backend + PostgreSQL) y empaquetar el frontend para móviles/escritorio.

---

## 📋 Índice

1. [Backend en Railway](#-1-backend-en-railway)
2. [PostgreSQL en Railway](#-2-postgresql-en-railway)
3. [Frontend para Móviles/Escritorio](#-3-frontend-para-móvilesescritorio)
4. [Versionado](#-4-versionado)
5. [Testing](#-5-testing)

---

## 🚂 1. Backend en Railway

### Preparación Local

```bash
cd backend

# Build y verificación
./railway-deploy.sh
```

Este script:
- ✅ Limpia builds anteriores
- ✅ Compila el proyecto
- ✅ Genera el JAR
- ✅ Muestra instrucciones para Railway

### Deploy en Railway

1. **Crear Proyecto en Railway**: https://railway.app
2. **Conectar GitHub**: Seleccionar repositorio `punto-de-venta`
3. **Configurar Root Directory**: `backend`
4. **Variables de Entorno** (ver sección siguiente)
5. **Deploy automático** al push a `main`

### Variables de Entorno (Backend)

Configurar en Railway Dashboard → Backend Service → Variables:

```properties
SPRING_PROFILES_ACTIVE=prod
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/$${{Postgres.PGDATABASE}}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[generar_password_seguro]
CORS_ORIGINS=https://tuapp.railway.app,capacitor://localhost,http://localhost:8081
VERSION=1.0.0
```

### Verificación

```bash
# Health check
curl https://tu-backend.railway.app/actuator/health

# Version
curl https://tu-backend.railway.app/api/version
```

**Documentación completa**: [`RAILWAY-DEPLOYMENT.md`](backend/RAILWAY-DEPLOYMENT.md)

---

## 🗄️ 2. PostgreSQL en Railway

### Crear Base de Datos

1. **En Railway Dashboard**: Click en "Add Service" → "Database" → "PostgreSQL"
2. Railway creará automáticamente la base de datos con credenciales

### Ejecutar Schema SQL

#### Opción A: Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login y conectar
railway login
railway link

# Ejecutar schema
railway connect postgres < backend/src/main/resources/schema.sql
```

#### Opción B: Cliente PostgreSQL

```bash
# Conectar usando credenciales de Railway
psql -h [PGHOST] -U [PGUSER] -d [PGDATABASE] -p [PGPORT]

# Ejecutar schema
\i /ruta/completa/backend/src/main/resources/schema.sql

# Verificar
\dt
SELECT * FROM roles;
```

### Testing Local (Opcional)

Para probar PostgreSQL localmente antes de Railway:

```bash
cd backend
./setup-postgres-local.sh
```

Este script:
- ✅ Crea la base de datos local
- ✅ Ejecuta `schema.sql`
- ✅ Verifica que las tablas se crearon
- ✅ Muestra los datos iniciales

---

## 📱 3. Frontend para Móviles/Escritorio

### Setup Inicial

```bash
cd frontend

# Instalar Capacitor y dependencias
./setup-capacitor.sh
```

Este script instala:
- ✅ Capacitor Core y CLI
- ✅ Plataformas: Android, iOS, Electron
- ✅ Dependencias necesarias

### Configurar Backend URL

Después de desplegar en Railway, actualizar:

#### 1. `capacitor.config.ts`

```typescript
server: {
  url: 'https://tu-backend.railway.app', // ⬅️ Cambiar
}
```

#### 2. `src/config/api.config.ts`

```typescript
prod: {
  apiUrl: 'https://tu-backend.railway.app/api', // ⬅️ Cambiar
}
```

### Build para Android

```bash
# Agregar plataforma
npx cap add android

# Build y sincronizar
npm run build
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

En Android Studio:
- **Build → Build APK** para testing
- **Build → Generate Signed Bundle** para producción

### Build para iOS

```bash
# Agregar plataforma
npx cap add ios

# Instalar Pods
cd ios/App && pod install && cd ../..

# Build y sincronizar
npm run build
npx cap sync ios

# Abrir en Xcode
npx cap open ios
```

En Xcode:
- **Product → Archive** para generar IPA

### Build para Escritorio (Electron)

```bash
# Agregar Electron
npx cap add @capacitor-community/electron

# Build
npm run build
npx cap sync @capacitor-community/electron

# Empaquetar
cd electron
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

**Documentación completa**: [`MOBILE-DESKTOP-SETUP.md`](frontend/MOBILE-DESKTOP-SETUP.md)

---

## 🏷️ 4. Versionado

El proyecto usa **Semantic Versioning** (MAJOR.MINOR.PATCH).

### Cambiar Versión del Backend

Editar `backend/pom.xml`:

```xml
<properties>
    <app.version.major>1</app.version.major>
    <app.version.minor>1</app.version.minor>
    <app.version.patch>0</app.version.patch>
</properties>
```

### Cambiar Versión del Frontend

#### 1. `package.json`

```json
{
  "version": "1.1.0"
}
```

#### 2. Android (`android/app/build.gradle`)

```gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar
        versionName "1.1.0"
    }
}
```

#### 3. iOS (`ios/App/Info.plist`)

```xml
<key>CFBundleShortVersionString</key>
<string>1.1.0</string>
<key>CFBundleVersion</key>
<string>2</string>
```

### Commit y Tag

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main --tags
```

Railway desplegará automáticamente la nueva versión.

---

## 🧪 5. Testing

### Backend

```bash
cd backend

# Tests unitarios
./mvnw test

# Build completo
./mvnw clean package

# Ejecutar localmente
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend

```bash
cd frontend

# Tests
npm test

# Lint
npm run lint

# Ejecutar en desarrollo
npm start

# En otra terminal
npm run android  # O npm run ios
```

### Testing de Conectividad

Verificar que el frontend se conecta al backend:

```typescript
import apiService from './src/services/api.service';

// Test
const health = await apiService.checkHealth();
console.log('Backend health:', health); // true si está OK

const version = await apiService.getVersion();
console.log('Backend version:', version.data);
```

---

## 📊 Estructura del Proyecto

```
punto-de-venta/
├── backend/                          # Java 21 + Spring Boot 3.5.7
│   ├── src/main/
│   │   ├── java/.../backend/
│   │   │   ├── config/              # CORS, Security, OpenAPI
│   │   │   ├── controller/          # API Controllers
│   │   │   ├── dto/                 # Data Transfer Objects (Records)
│   │   │   ├── model/               # JPA Entities
│   │   │   ├── repository/          # Spring Data JPA
│   │   │   └── service/             # Business Logic
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── schema.sql           # PostgreSQL Schema
│   ├── pom.xml                      # Maven Dependencies
│   ├── railway.json                 # Railway Config
│   ├── Procfile                     # Railway Procfile
│   ├── railway-deploy.sh            # 🚀 Script de Deploy
│   ├── setup-postgres-local.sh      # 🐘 Setup PostgreSQL local
│   └── RAILWAY-DEPLOYMENT.md        # 📚 Guía Railway
│
├── frontend/                         # React Native 0.76.5
│   ├── src/
│   │   ├── config/
│   │   │   └── api.config.ts        # URLs Backend (dev/staging/prod)
│   │   └── services/
│   │       └── api.service.ts       # HTTP Client Service
│   ├── android/                     # Proyecto Android
│   ├── ios/                         # Proyecto iOS
│   ├── electron/                    # Proyecto Electron (Desktop)
│   ├── capacitor.config.ts          # Capacitor Config
│   ├── package.json                 # NPM Dependencies
│   ├── setup-capacitor.sh           # 📱 Setup Capacitor
│   └── MOBILE-DESKTOP-SETUP.md      # 📚 Guía Móviles/Desktop
│
└── docs/                            # Documentación
    ├── flujo-interno.md
    ├── admin/                       # Docs administrativas
    ├── datos/                       # Arquitectura de datos
    └── diagramas/                   # Flujos visuales
```

---

## 🔐 Seguridad

### Generar Passwords Seguros

```bash
# Para ADMIN_PASSWORD
openssl rand -base64 24

# Para JWT_SECRET (futuro)
openssl rand -base64 32
```

### Variables de Entorno

**NUNCA** commitear:
- Passwords
- API Keys
- Tokens
- Credenciales de BD

Usar variables de entorno en Railway y `.env` locales (gitignored).

---

## 🛠️ Troubleshooting

### Backend no conecta a PostgreSQL

**Solución:**
- Verificar variables `DB_*` en Railway
- Usar referencias: `${{Postgres.PGUSER}}`
- Verificar que PostgreSQL y Backend están en el mismo proyecto

### CORS Error en App

**Solución:**
- Agregar URL de la app a `CORS_ORIGINS` en Railway
- Verificar `CorsConfig.java`
- Para Capacitor: incluir `capacitor://localhost`

### Build de Android falla

**Solución:**
```bash
cd frontend/android
./gradlew clean
./gradlew assembleDebug
```

### App no conecta al Backend

**Solución:**
- Verificar URL en `capacitor.config.ts` y `api.config.ts`
- Usar HTTPS (Railway proporciona HTTPS automático)
- Verificar que el backend está corriendo en Railway

---

## 📚 Documentación Completa

- **Backend**: [`backend/RAILWAY-DEPLOYMENT.md`](backend/RAILWAY-DEPLOYMENT.md)
- **Frontend**: [`frontend/MOBILE-DESKTOP-SETUP.md`](frontend/MOBILE-DESKTOP-SETUP.md)
- **Desarrollo**: [`backend/DEVELOPMENT-GUIDE.md`](backend/DEVELOPMENT-GUIDE.md)
- **Java 21**: [`backend/JAVA21-UPGRADE.md`](backend/JAVA21-UPGRADE.md)

---

## 🎯 Checklist de Despliegue Completo

### Backend
- [ ] Build local exitoso (`./railway-deploy.sh`)
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas
- [ ] PostgreSQL provisionado
- [ ] `schema.sql` ejecutado
- [ ] Deploy exitoso
- [ ] Health check OK (`/actuator/health`)
- [ ] Version endpoint OK (`/api/version`)

### Frontend
- [ ] Capacitor instalado (`./setup-capacitor.sh`)
- [ ] URLs actualizadas (capacitor.config.ts, api.config.ts)
- [ ] Android APK generado
- [ ] iOS IPA generado (si aplica)
- [ ] Desktop executables generados (si aplica)
- [ ] Conectividad con Railway verificada

### General
- [ ] Versiones sincronizadas (backend y frontend)
- [ ] CORS configurado correctamente
- [ ] HTTPS funcionando
- [ ] Documentación actualizada
- [ ] Tag creado en Git

---

## 🚀 Comandos Rápidos

```bash
# Backend - Build y deploy
cd backend
./railway-deploy.sh

# Backend - PostgreSQL local
cd backend
./setup-postgres-local.sh

# Frontend - Setup inicial
cd frontend
./setup-capacitor.sh

# Frontend - Android
cd frontend
npx cap add android && npm run build && npx cap sync android && npx cap open android

# Frontend - iOS
cd frontend
npx cap add ios && cd ios/App && pod install && cd ../.. && npm run build && npx cap sync ios && npx cap open ios

# Frontend - Desktop
cd frontend
npx cap add @capacitor-community/electron && npm run build && npx cap sync @capacitor-community/electron
```

---

**Versión:** 1.0.0  
**Última actualización:** 21 de noviembre de 2025  
**Proyecto:** Punto de Venta - Sistema POS Multiplataforma
