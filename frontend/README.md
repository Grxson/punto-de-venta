# Frontend - Punto de Venta

Aplicación móvil multiplataforma desarrollada con React Native para el sistema de punto de venta.

## Tecnologías

- **React Native**: 0.76.5
- **React**: 18.3.1
- **TypeScript**: 5.0.4
- **Node.js**: 18+ (recomendado 24+)

## Requisitos previos

### Para Android
- Android Studio
- Android SDK (API 34+)
- Emulador Android o dispositivo físico con modo desarrollador habilitado

### Para iOS (solo macOS)
- Xcode 15+
- CocoaPods
- Simulador iOS o dispositivo físico

# Primeros pasos

>**Nota**: Asegúrate de haber completado las instrucciones de [Configuración del entorno de React Native](https://reactnative.dev/docs/environment-setup) hasta el paso "Creating a new application" antes de continuar.

## Paso 1: Iniciar el servidor Metro

Primero debes iniciar **Metro**, el _bundler_ de JavaScript que se distribuye _junto con_ React Native.

Para iniciar Metro, ejecuta el siguiente comando desde la _raíz_ de tu proyecto React Native:

```bash
# con npm
npm start

# O con Yarn
yarn start
```

## Paso 2: Iniciar tu aplicación

Deja que Metro Bundler se ejecute en su _propia_ terminal. Abre una terminal _nueva_ desde la _raíz_ de tu proyecto React Native. Ejecuta el siguiente comando para iniciar tu app _Android_ o _iOS_:

### Para Android

```bash
# con npm
npm run android

# O con Yarn
yarn android
```

### Para iOS

```bash
# con npm
npm run ios

# O con Yarn
yarn ios
```

Si todo está configurado _correctamente_, deberías ver tu nueva app ejecutándose en el _Emulador de Android_ o el _Simulador de iOS_ en breve, siempre que hayas configurado bien tu emulador/simulador.

Esta es una forma de ejecutar tu app; también puedes ejecutarla directamente desde Android Studio y Xcode respectivamente.

## Paso 3: Modificar tu aplicación

Ahora que has ejecutado la app correctamente, vamos a modificarla.

1. Abre `App.tsx` en tu editor de texto preferido y edita algunas líneas.
2. Para **Android**: pulsa la tecla <kbd>R</kbd> dos veces o selecciona **"Reload"** en el **Menú de desarrollador** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (en Windows y Linux) o <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (en macOS)) para ver tus cambios.

   Para **iOS**: pulsa <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> en tu Simulador de iOS para recargar la app y ver tus cambios.

## ¡Felicidades! :tada:

Has ejecutado y modificado tu aplicación React Native correctamente. :partying_face:

## Estructura del proyecto

```
frontend/
├── android/              # Código nativo Android
├── ios/                  # Código nativo iOS
├── src/                  # Código fuente (por crear)
│   ├── components/       # Componentes reutilizables
│   ├── screens/          # Pantallas de la aplicación
│   ├── navigation/       # Configuración de navegación
│   ├── services/         # Servicios (API, autenticación)
│   ├── store/            # Estado global (Redux/Context)
│   ├── utils/            # Utilidades y helpers
│   └── types/            # Definiciones TypeScript
├── App.tsx               # Componente principal
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración TypeScript
```

## Integración con Backend

La aplicación consume la API REST del backend:
- **URL base (desarrollo)**: `http://localhost:8080`
- **URL base (producción)**: Por definir

## Próximos pasos

1. Configurar navegación (React Navigation)
2. Implementar servicios de API con Axios
3. Configurar gestión de estado (Redux Toolkit o Context API)
4. Crear pantallas según flujos en `../docs/diagramas/`
5. Implementar autenticación y manejo de sesión
6. Agregar componentes UI (botones, formularios, cards)
7. Configurar manejo de errores y validaciones

## Dependencias recomendadas

### Navegación
```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### HTTP Client
```bash
npm install axios
```

### Estado global
```bash
npm install @reduxjs/toolkit react-redux
# O usar Context API (incluido en React)
```

### Formularios y validación
```bash
npm install react-hook-form yup @hookform/resolvers
```

### UI Components
```bash
npm install react-native-paper
# O
npm install @rneui/themed @rneui/base
```

### ¿Y ahora qué?

- Si quieres agregar este nuevo código React Native a una aplicación existente, consulta la [guía de integración](https://reactnative.dev/docs/integration-with-existing-apps).
- Si tienes curiosidad por aprender más sobre React Native, consulta la [Introducción a React Native](https://reactnative.dev/docs/getting-started).

# Solución de problemas

Si no consigues que funcione, consulta la página de [Solución de problemas](https://reactnative.dev/docs/troubleshooting).

# Más información

Para aprender más sobre React Native, echa un vistazo a los siguientes recursos:

- [Sitio web de React Native](https://reactnative.dev) - aprende más sobre React Native.
- [Primeros pasos](https://reactnative.dev/docs/environment-setup) - una **descripción general** de React Native y cómo configurar tu entorno.
- [Aprende lo básico](https://reactnative.dev/docs/getting-started) - un **recorrido guiado** por lo **básico** de React Native.
- [Blog](https://reactnative.dev/blog) - lee las últimas **entradas** del **Blog** oficial de React Native.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - el **repositorio** de código abierto de React Native en GitHub.
