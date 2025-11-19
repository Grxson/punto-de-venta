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

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

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

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
