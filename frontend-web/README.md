# Frontend Web - Punto de Venta

Aplicación web React para punto de venta y panel administrativo, empaquetada con Electron para Windows.

## 🚀 Características

- **POS (Punto de Venta)**: Interfaz táctil optimizada para tablet Windows
- **Panel Administrativo**: Reportes, inventario y finanzas
- **Electron**: Empaquetado como aplicación de escritorio para Windows
- **Material-UI**: Componentes optimizados para táctil

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus configuraciones
```

## 🚀 Desarrollo

### Desarrollo Web

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Desarrollo con Electron

```bash
# Iniciar Vite y Electron simultáneamente
npm run electron:dev
```

## 📦 Build

### Build Web

```bash
# Build para producción
npm run build
```

Los archivos se generan en `dist/`

### Build Electron

```bash
# Build de Electron (requiere build web primero)
npm run build:electron

# Generar instalador Windows
npm run dist
```

El instalador se genera en `release/`

## 📁 Estructura del Proyecto

```
frontend-web/
├── electron/           # Configuración Electron
│   └── main.js        # Proceso principal Electron
├── src/
│   ├── config/        # Configuración (API, etc.)
│   ├── services/     # Servicios (API, etc.)
│   ├── layouts/       # Layouts (POS, Admin)
│   ├── pages/         # Páginas
│   │   ├── pos/       # Páginas POS
│   │   ├── admin/     # Páginas Admin
│   │   └── auth/      # Autenticación
│   └── App.tsx        # Componente principal
├── public/            # Archivos estáticos
└── package.json
```

## 🎨 Rutas

- `/pos` - Punto de venta (selección de productos)
- `/pos/cart` - Carrito de compras
- `/pos/payment` - Proceso de pago
- `/admin` - Dashboard administrativo
- `/admin/reports` - Reportes
- `/admin/inventory` - Inventario
- `/admin/finances` - Finanzas
- `/login` - Inicio de sesión

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL_DEV=http://localhost:8080/api
VITE_API_URL_STAGING=https://tu-staging.railway.app/api
VITE_API_URL_PROD=https://tu-prod.railway.app/api
```

## 📱 Optimización Táctil

La aplicación está optimizada para uso táctil:
- Botones grandes (mínimo 48x48px)
- Espaciado generoso
- Fuentes legibles (16px+)
- Feedback visual claro

## 🚢 Despliegue

### Web en Railway

1. Build: `npm run build`
2. Subir carpeta `dist/` a Railway
3. Configurar variables de entorno

### Electron (Windows)

1. Build: `npm run dist`
2. Distribuir archivo `.exe` desde `release/`

## 📚 Próximos Pasos

- [ ] Implementar autenticación completa
- [ ] Estado global del carrito (Context/Redux)
- [ ] Integración completa con backend
- [ ] Funcionalidad de pago
- [ ] Reportes y gráficos
- [ ] Gestión de inventario
- [ ] Modo offline (PWA)

## 🤝 Contribuir

Ver documentación en `docs/FRONTEND-STRATEGY.md`
