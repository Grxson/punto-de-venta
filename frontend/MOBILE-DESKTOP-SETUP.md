# 📱 Configuración para Apps Móviles y Escritorio

## 🎯 Objetivo

Preparar el frontend React Native para empaquetarlo en:
- 📱 **Android** (APK/AAB)
- 🍎 **iOS** (IPA)
- 💻 **Escritorio** (Windows/macOS/Linux usando Electron)

---

## 📋 Requisitos Previos

### Para Android:
- ✅ Android Studio instalado
- ✅ JDK 17 o superior
- ✅ Android SDK (API 34 recomendado)
- ✅ Variables de entorno configuradas (`ANDROID_HOME`)

### Para iOS:
- ✅ macOS con Xcode 15+
- ✅ CocoaPods instalado (`sudo gem install cocoapods`)
- ✅ Cuenta de Apple Developer (para distribución)

### Para Escritorio:
- ✅ Node.js 18+
- ✅ Electron Builder

---

## 🚀 PASO 1: Instalar Capacitor

Capacitor permite empaquetar React Native como app nativa:

```bash
cd frontend

# Instalar Capacitor Core y CLI
npm install @capacitor/core @capacitor/cli

# Instalar plataformas
npm install @capacitor/android @capacitor/ios

# Para escritorio (Electron)
npm install @capacitor-community/electron
```

---

## ⚙️ PASO 2: Inicializar Capacitor

```bash
# Inicializar Capacitor
npx cap init

# Configuración durante la inicialización:
# ✅ App name: Punto de Venta
# ✅ App ID: com.puntodeventa.app
# ✅ Web directory: build
```

Esto creará el archivo `capacitor.config.ts` (ya incluido en el proyecto).

---

## 🔧 PASO 3: Configurar Backend URL

### 3.1 Editar `capacitor.config.ts`

Después de desplegar el backend en Railway, actualizar la URL:

```typescript
server: {
  url: 'https://tu-backend-production.up.railway.app', // ⬅️ Cambiar esto
}
```

### 3.2 Configurar API en `src/config/api.config.ts`

Actualizar las URLs de staging y producción:

```typescript
staging: {
  apiUrl: 'https://backend-staging-xxxx.up.railway.app/api',
  // ...
},
prod: {
  apiUrl: 'https://backend-production-xxxx.up.railway.app/api', // ⬅️ Cambiar
  // ...
},
```

### 3.3 Variables de Entorno (.env)

Para evitar hardcodear URLs y permitir toggles de características usamos `react-native-config`.

1. Instalar dependencia (si no está):

```bash
npm install react-native-config
```

2. Crear archivos por ambiente (no se commitean los de producción):

```
.env.example
.env.development
.env.staging
.env.production
```

3. Copiar desde `.env.example` y ajustar valores:

```dotenv
API_URL_DEV=http://localhost:8080/api
API_URL_STAGING=https://backend-staging-xxxx.up.railway.app/api
API_URL_PROD=https://backend-production-xxxx.up.railway.app/api
API_TIMEOUT=30000
API_RETRIES=3
FEATURE_SHOW_EXPERIMENTAL=false
FEATURE_ENABLE_LOGGING=true
REACT_APP_ENV=development
```

4. Uso en código (ya integrado en `api.config.ts`):

```typescript
import Config from 'react-native-config';
console.log('API base:', Config.API_URL_DEV);
```

5. Seleccionar archivo de entorno al compilar (Android):

```bash
ENVFILE=.env.staging npx react-native run-android
```

6. Para iOS con Xcode puedes definir `ENVFILE` antes de `pod install` si usas scripts avanzados de build.

7. Mantén `.env.production` fuera del repo (usa variables seguras en CI/CD).

8. No pongas secretos extremadamente sensibles en el frontend (tokens a largo plazo, claves privadas); usa flujos de autenticación seguros.

---

## 📱 PASO 4: Build para Android

### 4.1 Agregar plataforma Android

```bash
npx cap add android
```

Esto creará la carpeta `android/` con el proyecto Android Studio.

### 4.2 Sincronizar archivos

```bash
# Build de React Native
npm run build

# Sincronizar con Capacitor
npx cap sync android
```

### 4.3 Abrir en Android Studio

```bash
npx cap open android
```

O manualmente: `File → Open → frontend/android`

### 4.4 Generar APK

En Android Studio:

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Esperar a que compile
3. APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4.5 Generar APK de Producción (Signed)

#### Crear Keystore:

```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias puntodeventa -keyalg RSA -keysize 2048 -validity 10000
```

#### Configurar `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=puntodeventa
MYAPP_RELEASE_STORE_PASSWORD=tu_password
MYAPP_RELEASE_KEY_PASSWORD=tu_password
```

#### Editar `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ...
        }
    }
}
```

#### Build:

```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

### 4.6 Actualizar Versión

Editar `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2        // Incrementar para cada release
        versionName "1.0.0"  // Versionado semántico
    }
}
```

---

## 🍎 PASO 5: Build para iOS

### 5.1 Agregar plataforma iOS

```bash
npx cap add ios
```

### 5.2 Instalar Pods

```bash
cd ios/App
pod install
cd ../..
```

### 5.3 Sincronizar

```bash
npm run build
npx cap sync ios
```

### 5.4 Abrir en Xcode

```bash
npx cap open ios
```

### 5.5 Generar IPA

En Xcode:

1. **Seleccionar dispositivo:** Generic iOS Device
2. **Product → Archive**
3. **Distribute App**
4. **Seleccionar método:**
   - **Development**: Testing interno
   - **Ad Hoc**: Testing con UDID registrados
   - **App Store**: Publicación en App Store

### 5.6 Actualizar Versión

Editar `ios/App/Info.plist`:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

---

## 💻 PASO 6: Build para Escritorio (Electron)

### 6.1 Instalar Electron Capacitor

```bash
npm install @capacitor-community/electron
```

### 6.2 Inicializar Electron

```bash
npx cap add @capacitor-community/electron
```

### 6.3 Build

```bash
# Build de React Native
npm run build

# Sincronizar
npx cap sync @capacitor-community/electron

# Abrir
npx cap open @capacitor-community/electron
```

### 6.4 Empaquetar Ejecutables

Editar `electron/package.json`:

```json
{
  "scripts": {
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  }
}
```

#### Generar ejecutable:

```bash
cd electron

# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Los ejecutables se generan en `electron/dist/`.

---

## 🔄 PASO 7: Versionado y Release

### 7.1 Sistema de Versionado

Usar **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de bugs

### 7.2 Antes de cada Release

1. **Actualizar versión en `package.json`:**

```json
{
  "version": "1.1.0"
}
```

2. **Actualizar versionCode/versionName en Android:**

```gradle
versionCode 2
versionName "1.1.0"
```

3. **Actualizar CFBundleVersion en iOS:**

```xml
<key>CFBundleShortVersionString</key>
<string>1.1.0</string>
<key>CFBundleVersion</key>
<string>2</string>
```

4. **Commit y tag:**

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin develop --tags
```

---

## 🧪 PASO 8: Testing

### 8.1 Test en Desarrollo

```bash
# Android
npm run android

# iOS
npm run ios
```

### 8.2 Test de Conectividad con Backend

Verificar que la app puede conectarse al backend de Railway:

```typescript
import apiService from './services/api.service';

// Test de health
const isHealthy = await apiService.checkHealth();
console.log('Backend healthy:', isHealthy);

// Test de versión
const version = await apiService.getVersion();
console.log('Backend version:', version.data);
```

---

## 📦 PASO 9: Distribución

### Android:
- **Google Play Store**: Subir AAB
- **Distribución directa**: Compartir APK

### iOS:
- **App Store**: Subir vía Xcode o Transporter
- **TestFlight**: Para testing beta

### Escritorio:
- **Distribución directa**: Compartir ejecutables
- **Auto-updater**: Configurar Electron Builder con actualización automática

---

## 🔐 Seguridad

### HTTPS Obligatorio en Producción

El backend en Railway usa HTTPS, asegúrate de:

```typescript
// capacitor.config.ts
server: {
  url: 'https://tu-backend.up.railway.app', // ✅ HTTPS
}
```

### Almacenamiento Seguro

Para tokens y datos sensibles, usar:

```bash
npm install react-native-encrypted-storage
```

```typescript
import EncryptedStorage from 'react-native-encrypted-storage';

// Guardar token
await EncryptedStorage.setItem('auth_token', token);

// Leer token
const token = await EncryptedStorage.getItem('auth_token');
```

---

## 🛠️ Troubleshooting

### Error: "Cleartext traffic not permitted"

**Android** bloquea HTTP por defecto. Soluciones:

1. **Usar HTTPS** (recomendado)
2. **Desarrollo local**: Editar `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### Error: "Network request failed"

Verificar:
- ✅ Backend URL correcta en `capacitor.config.ts`
- ✅ CORS configurado en backend
- ✅ Internet disponible
- ✅ Backend en Railway corriendo

### Error: Build de Android falla

```bash
# Limpiar build
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug
```

### Error: Pods not installed (iOS)

```bash
cd ios/App
pod deintegrate
pod install
```

---

## 📚 Recursos

- [Capacitor Docs](https://capacitorjs.com/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Android Publishing](https://developer.android.com/studio/publish)
- [iOS Distribution](https://developer.apple.com/distribute/)
- [Electron Builder](https://www.electron.build/)

---

## ✅ Checklist Final

- [ ] Capacitor instalado e inicializado
- [ ] `capacitor.config.ts` configurado con URL de Railway
- [ ] `api.config.ts` con URLs correctas
- [ ] Android agregado (`npx cap add android`)
- [ ] iOS agregado (`npx cap add ios`)
- [ ] Electron agregado (opcional)
- [ ] Build de prueba exitoso
- [ ] Conectividad con Railway verificada
- [ ] Keystore creado (Android)
- [ ] APK/IPA generado
- [ ] Versiones actualizadas en todas las plataformas
- [ ] HTTPS configurado
- [ ] Almacenamiento seguro implementado

---

**Versión:** 1.0.0  
**Última actualización:** 21 de noviembre de 2025
