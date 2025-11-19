# Frontend - Punto de Venta

Aplicación multiplataforma desarrollada con React Native para el sistema de punto de venta.

## Tecnologías (Planeadas)

- **React Native**: Framework multiplataforma
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación entre pantallas
- **Axios**: Consumo de API REST
- **React Query**: Gestión de estado y caché
- **AsyncStorage**: Almacenamiento local

## Plataformas soportadas

- Android
- iOS
- Web (opcional con React Native Web)

## Estructura del Proyecto (Propuesta)

```
frontend/
├── src/
│   ├── screens/          # Pantallas principales
│   ├── components/       # Componentes reutilizables
│   ├── navigation/       # Configuración de navegación
│   ├── services/         # Comunicación con la API
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilidades
│   ├── constants/        # Constantes
│   ├── types/            # Tipos TypeScript
│   └── assets/           # Imágenes, iconos, fuentes
├── App.tsx               # Punto de entrada
└── package.json          # Dependencias npm
```

## Inicialización

_Pendiente: El proyecto será inicializado con React Native CLI o Expo._

## Próximos pasos

1. Decidir entre React Native CLI o Expo
2. Inicializar proyecto con TypeScript
3. Configurar navegación
4. Diseñar pantallas según flujos en `docs/diagramas/`
5. Implementar servicios para consumir API
6. Configurar autenticación
7. Desarrollar componentes de UI
8. Integrar con hardware (impresoras, lectores)

## Documentación del proyecto

Consulta la documentación completa en el directorio `docs/` del repositorio principal:
- Flujos de UI: `docs/diagramas/`
- Operación diaria: `docs/admin/operacion.md`
- Seguridad: `docs/admin/seguridad.md`
