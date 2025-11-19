# Guía de Desarrollo - Punto de Venta

## Entorno de Desarrollo Configurado

### Backend (Java + Spring Boot)
- **Java**: 21 LTS
- **Spring Boot**: 3.5.7
- **Maven**: 3.9.11
- **Puerto**: 8080

### Frontend (React Native)
- **React Native**: 0.76.5
- **React**: 18.3.1
- **TypeScript**: 5.0.4
- **Node.js**: 24.11.1

## Comandos de Desarrollo

### Backend
```bash
cd backend

# Iniciar servidor de desarrollo
./mvnw spring-boot:run

# Compilar proyecto
./mvnw clean compile

# Crear JAR
./mvnw clean package

# Ejecutar tests
./mvnw test
```

**URLs Backend:**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Frontend

#### Iniciar Metro Bundler
```bash
cd frontend
npm start
```

#### Ejecutar en Android

**Opción 1: Con emulador (recomendado)**
```bash
# 1. Iniciar emulador
emulator -avd Medium_Phone_API_36.1 &

# 2. Verificar que esté conectado
adb devices

# 3. Ejecutar app (en otra terminal)
cd frontend
npm run android
```

**Opción 2: Con dispositivo físico**
```bash
# 1. Habilitar "Depuración USB" en tu teléfono Android
# 2. Conectar el dispositivo por USB
# 3. Verificar conexión
adb devices

# 4. Ejecutar app
cd frontend
npm run android
```

#### Ejecutar en iOS (solo macOS)
```bash
# 1. Instalar pods
cd frontend/ios
pod install
cd ..

# 2. Ejecutar app
npm run ios
```

## Solución de Problemas

### Error: "No connected devices"

**Causa**: No hay emulador o dispositivo Android conectado.

**Solución**:
```bash
# Listar emuladores disponibles
emulator -list-avds

# Iniciar emulador
emulator -avd Medium_Phone_API_36.1 &

# Verificar conexión
adb devices
```

### Error: KVM no disponible

**Causa**: Aceleración de hardware deshabilitada.

**Solución aplicada**:
1. Se removió el blacklist de KVM: `/etc/modprobe.d/blacklist-kvm.conf`
2. Se cargó el módulo KVM: `sudo modprobe kvm_intel`
3. Se agregó el usuario a grupos: `kvm` y `libvirt`

**Verificar KVM**:
```bash
ls -la /dev/kvm
groups | grep kvm
```

### Metro Bundler no inicia

**Solución**:
```bash
cd frontend
# Limpiar caché
npm start -- --reset-cache
```

### Build de Android falla

**Solución**:
```bash
cd frontend/android
./gradlew clean
cd ..
npm run android
```

## Estructura del Proyecto

```
punto-de-venta/
├── backend/              # API REST Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── frontend/             # App React Native
│   ├── android/         # Código nativo Android
│   ├── ios/             # Código nativo iOS
│   ├── App.tsx          # Componente principal
│   └── package.json
└── docs/                # Documentación del sistema
    ├── admin/           # Docs administrativas
    ├── datos/           # Modelo de datos
    └── diagramas/       # Flujos de proceso
```

## Próximos Pasos de Desarrollo

### Backend
1. [ ] Implementar entidades JPA según `docs/datos/modelo-datos.md`
2. [ ] Crear repositorios Spring Data JPA
3. [ ] Desarrollar servicios de negocio
4. [ ] Implementar controladores REST
5. [ ] Configurar Spring Security con JWT
6. [ ] Agregar validaciones con Bean Validation
7. [ ] Documentar endpoints con Swagger

### Frontend
1. [ ] Instalar React Navigation
2. [ ] Configurar Axios para API calls
3. [ ] Crear estructura de carpetas `src/`
4. [ ] Implementar gestión de estado (Redux/Context)
5. [ ] Desarrollar pantalla de Login
6. [ ] Crear componentes reutilizables
7. [ ] Implementar manejo de errores

## Dependencias Recomendadas

### Backend
```xml
<!-- Ya incluidas en pom.xml -->
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- Spring Boot Actuator
- Swagger/OpenAPI
```

### Frontend
```bash
# Navegación
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# HTTP Client
npm install axios

# Estado global
npm install @reduxjs/toolkit react-redux

# Formularios
npm install react-hook-form yup @hookform/resolvers

# UI Library (opcional)
npm install react-native-paper
# O
npm install @rneui/themed @rneui/base
```

## Tips de Desarrollo

### Hot Reload
- **Backend**: Spring Boot DevTools habilitado (recarga automática)
- **Frontend**: Metro bundler con Fast Refresh (recarga automática)

### Debugging

**Backend**:
- Logs en consola con `./mvnw spring-boot:run`
- Actuator endpoints: http://localhost:8080/actuator

**Frontend**:
- Developer Menu en Android: Shake device o `Ctrl+M`
- Developer Menu en iOS: `Cmd+D`
- Chrome DevTools: chrome://inspect

### Testing

**Backend**:
```bash
# Ejecutar todos los tests
./mvnw test

# Ejecutar test específico
./mvnw test -Dtest=NombreTest
```

**Frontend**:
```bash
# Ejecutar tests
npm test

# Con cobertura
npm test -- --coverage
```

## Recursos Útiles

- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Documentación del Proyecto](./docs/)
