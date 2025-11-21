import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.puntodeventa.app',
  appName: 'Punto de Venta',
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
