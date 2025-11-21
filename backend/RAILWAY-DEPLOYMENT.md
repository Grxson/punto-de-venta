# 🚂 Despliegue en Railway - Punto de Venta

## 📋 Requisitos Previos

- Cuenta en [Railway.app](https://railway.app)
- Repositorio GitHub conectado
- Variables de entorno configuradas

---

## 🗄️ PASO 1: Configurar PostgreSQL en Railway

### 1.1 Crear Base de Datos PostgreSQL

1. **Ir a Railway Dashboard** → Click en "New Project"
2. **Seleccionar "Provision PostgreSQL"**
3. **Copiar las credenciales** que Railway genera automáticamente:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### 1.2 Conectarse a PostgreSQL desde Railway

Railway proporciona dos formas de conectarse:

#### Opción A: Usando Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Seleccionar proyecto
railway link

# Conectarse a PostgreSQL
railway connect postgres
```

#### Opción B: Usando Cliente PostgreSQL Local

```bash
# Usar las credenciales de Railway
psql -h [PGHOST] -U [PGUSER] -d [PGDATABASE] -p [PGPORT]
# Cuando pida contraseña, usar PGPASSWORD
```

### 1.3 Ejecutar Script SQL

Una vez conectado, ejecutar el script:

```bash
# Desde Railway CLI
railway connect postgres < src/main/resources/schema.sql

# O desde psql
\i /ruta/completa/al/schema.sql
```

**Verificar que las tablas se crearon:**

```sql
\dt
-- Debería mostrar todas las tablas
```

---

## 🚀 PASO 2: Configurar Backend en Railway

### 2.1 Crear Servicio Backend

1. **En Railway Dashboard** → Click en tu proyecto → "New Service"
2. **Seleccionar "GitHub Repo"**
3. **Seleccionar el repositorio:** `punto-de-venta`
4. **Configurar Root Directory:** `backend`

### 2.2 Variables de Entorno (Backend)

En Railway, ir a tu servicio backend → **Variables** → Añadir las siguientes:

```properties
# Perfil Spring
SPRING_PROFILES_ACTIVE=prod

# Base de Datos (copiar desde PostgreSQL service)
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}

# Seguridad
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[GENERAR_PASSWORD_SEGURO]

# CORS (URL de tu frontend cuando esté deployado)
CORS_ORIGINS=https://tuapp.railway.app,capacitor://localhost,http://localhost:8081,http://localhost:19006

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}

# Versión de la app
VERSION=1.0.0
```

### 2.3 Configurar Build

Railway detectará automáticamente que es un proyecto Maven:

**Verificar configuración:**
- Build Command: `./mvnw clean package -DskipTests`
- Start Command: `java -Dspring.profiles.active=prod -Dserver.port=$PORT -jar target/backend-*.jar`

### 2.4 Desplegar

1. **Railway desplegará automáticamente** al hacer push a `main` o `develop`
2. **Obtener URL pública:** Railway asignará una URL tipo `https://backend-production-xxxx.up.railway.app`
3. **Verificar health check:** `https://tu-url.railway.app/actuator/health`

---

## 📱 PASO 3: Preparar Frontend para Móviles/Escritorio

### 3.1 Instalar Capacitor

Capacitor permite empaquetar la app React Native para móviles y escritorio:

```bash
cd frontend

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor/electron  # Para apps de escritorio

# Inicializar Capacitor
npx cap init
```

Durante la inicialización, configurar:
- **App name:** Punto de Venta
- **App ID:** com.puntodeventa.app
- **Web directory:** build

### 3.2 Configurar API Backend

Crear archivo de configuración para las URLs:

**`frontend/src/config/api.ts`:**

```typescript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:8080/api',
  },
  staging: {
    apiUrl: 'https://backend-staging-xxxx.up.railway.app/api',
  },
  prod: {
    apiUrl: 'https://backend-production-xxxx.up.railway.app/api',
  },
};

const getEnvVars = () => {
  if (__DEV__) return ENV.dev;
  if (process.env.REACT_APP_ENV === 'staging') return ENV.staging;
  return ENV.prod;
};

export default getEnvVars();
```

### 3.3 Build y Empaquetado

#### Para Android:

```bash
# Generar APK
npx cap add android
npx cap sync android
npx cap open android  # Abre Android Studio

# En Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

#### Para iOS:

```bash
# Generar app para iOS (requiere macOS)
npx cap add ios
npx cap sync ios
npx cap open ios  # Abre Xcode

# En Xcode:
# Product → Archive → Distribute App
```

#### Para Escritorio (Electron):

```bash
# Instalar Electron
npm install @capacitor/electron

# Inicializar
npx cap add electron

# Build
npm run build  # Build de React Native
npx cap sync electron
npx cap open electron

# Empaquetar
cd electron
npm run build  # Genera ejecutables
```

---

## 🔐 PASO 4: Seguridad y Variables de Entorno

### 4.1 Variables Requeridas en Railway (Backend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Perfil de Spring Boot | `prod` |
| `DB_USERNAME` | Usuario PostgreSQL | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `${{Postgres.PGPASSWORD}}` |
| `SPRING_DATASOURCE_URL` | URL completa de la BD | `jdbc:postgresql://...` |
| `ADMIN_USERNAME` | Usuario admin | `admin` |
| `ADMIN_PASSWORD` | Password admin | `[seguro]` |
| `CORS_ORIGINS` | Orígenes permitidos | `https://app.railway.app,...` |
| `JWT_SECRET` | Secret para JWT | `[generar aleatorio]` |

### 4.2 Generar Secrets Seguros

```bash
# JWT Secret (256 bits)
openssl rand -base64 32

# Admin Password
openssl rand -base64 24
```

---

## 📊 PASO 5: Verificación Post-Despliegue

### 5.1 Healthcheck Backend

```bash
curl https://tu-backend.railway.app/actuator/health
# Respuesta esperada: {"status":"UP"}
```

### 5.2 Verificar API

```bash
# Endpoint de versión (público)
curl https://tu-backend.railway.app/api/version

# Debería retornar:
{
  "version": "1.0.0",
  "build": "...",
  "buildTime": "...",
  "profile": "prod"
}
```

### 5.3 Verificar Base de Datos

```bash
# Conectarse a PostgreSQL
railway connect postgres

# Verificar tablas
\dt

# Verificar datos iniciales
SELECT * FROM roles;
SELECT * FROM metodos_pago;
SELECT * FROM categorias_productos;
```

---

## 🔄 PASO 6: CI/CD y Versionado

### 6.1 Flujo de Despliegue

```
develop → merge → main → Railway auto-deploy
```

### 6.2 Cambiar Versión

Antes de cada release:

```bash
# Editar pom.xml
<app.version.major>1</app.version.major>
<app.version.minor>1</app.version.minor>
<app.version.patch>0</app.version.patch>

# Commit y push
git add pom.xml
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

Railway detectará el cambio y desplegará automáticamente.

---

## 📱 PASO 7: Configurar Apps (Móvil/Escritorio)

### 7.1 Capacitor Config

**`capacitor.config.ts`:**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.puntodeventa.app',
  appName: 'Punto de Venta',
  webDir: 'build',
  server: {
    // Permitir conexión a Railway
    allowNavigation: ['*.railway.app'],
    // URL del backend
    url: 'https://tu-backend.railway.app',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
    },
  },
};

export default config;
```

### 7.2 App Versioning

**Android (`android/app/build.gradle`):**

```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

**iOS (`ios/App/Info.plist`):**

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

---

## 🛠️ Troubleshooting

### Error: "Connection refused" en Railway

**Solución:**
- Verificar que el backend usa `server.port=$PORT`
- Railway asigna el puerto dinámicamente

### Error: CORS en producción

**Solución:**
- Añadir URL de Railway a `CORS_ORIGINS`
- Verificar que `CorsConfig.java` lee la variable correctamente

### Error: Base de datos no se conecta

**Solución:**
- Verificar variables `DB_*` en Railway
- Usar referencias: `${{Postgres.PGUSER}}`
- Verificar que PostgreSQL está en el mismo proyecto

### App móvil no conecta al backend

**Solución:**
- Verificar URL en `capacitor.config.ts`
- Añadir `capacitor://localhost` a CORS
- Verificar que la app usa HTTPS (Railway)

---

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Spring Boot on Railway](https://railway.app/starters/spring-boot)
- [React Native + Capacitor](https://capacitorjs.com/docs/guides/react-native)

---

## 🎯 Checklist de Despliegue

- [ ] PostgreSQL desplegado en Railway
- [ ] Script SQL ejecutado
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado
- [ ] Health check funcionando (`/actuator/health`)
- [ ] API version funcionando (`/api/version`)
- [ ] CORS configurado para apps
- [ ] Frontend con Capacitor instalado
- [ ] `capacitor.config.ts` configurado con URL de Railway
- [ ] APK/IPA generados
- [ ] Apps probadas contra Railway

---

**Versión:** 1.0.0  
**Última actualización:** 21 de noviembre de 2025
