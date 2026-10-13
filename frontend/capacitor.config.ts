import { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuración de Capacitor para empaquetar esta app React Native como
 * aplicación nativa (Android/iOS) y, opcionalmente, de escritorio (Electron).
 *
 * Flujo móvil → web:
 * `server.url` está definido, por lo que el contenedor nativo no carga el
 * paquete local de `webDir`, sino que navega a esa URL remota. Eso permite
 * apuntar la app ya instalada al backend desplegado sin recompilar el
 * binario: basta cambiar `BACKEND_URL` y volver a ejecutar `npx cap sync`.
 * `allowNavigation` es la lista de orígenes que el contenedor tiene permiso
 * para cargar; sin ella el WebView bloquearía la navegación a Railway.
 */
const config: CapacitorConfig = {
  // Identificador único de la app; debe conservarse entre builds para no
  // perder el directorio de la aplicación ni las preferencias del usuario.
  appId: 'com.puntodeventa.app',
  appName: 'Punto de Venta',
  // Carpeta con el build web empaquetado en el binario nativo.
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    // Permitir navegación a Railway
    allowNavigation: ['*.railway.app', 'punto-de-venta-production-d424.up.railway.app'],
    // URL del backend en Railway (cambiar después del deploy)
    url: process.env.BACKEND_URL || 'http://localhost:8080',
    cleartext: true, // Solo para desarrollo local
  },
  plugins: {
    SplashScreen: {
      // Duración de la pantalla de bienvenida mientras carga el contenido.
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
  android: {
    buildOptions: {
      // Se dejan sin definir a propósito: la firma de release se configura en
      // `android/app/build.gradle` para no guardar el keystore en el repositorio.
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
