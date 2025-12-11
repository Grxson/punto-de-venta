import { QueryClient } from '@tanstack/react-query';

/**
 * OPTIMIZACIÓN PASO 2.5: React Query Caching Strategy
 * 
 * Configuración avanzada del QueryClient con estrategia de caché por tipo de dato:
 * - Datos estáticos (catálogos): 10 minutos, gcTime 30 min
 * - Datos semi-estáticos (productos, inventario): 5 minutos, gcTime 15 min
 * - Datos dinámicos (ventas, turnos activos): 30 segundos, gcTime 5 min
 * - Muy dinámicos (estadísticas): sin caché (0 seg)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para todas las queries
      staleTime: 5 * 60 * 1000, // 5 minutos - datos semi-estáticos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché (antes cacheTime)
      retry: 1, // Reintentar 1 vez en caso de error
      refetchOnWindowFocus: false, // No refetch automático al volver a la ventana
      refetchOnMount: 'stale', // Refetch solo si datos están stale
      refetchOnReconnect: 'stale', // Refetch solo si datos están stale
      // NUEVA OPTIMIZACIÓN: Request deduplication automática
      networkMode: 'always', // Permitir queries sin conexión
    },
    mutations: {
      // Configuración por defecto para todas las mutations
      retry: 1, // Reintentar 1 vez en errores de red
      networkMode: 'always',
    },
  },
});

/**
 * Configuración específica por tipo de query
 * Usar en los hooks con el parámetro queryOptions
 */
export const queryDefaults = {
  // ESTÁTICOS (10 min): Datos que casi nunca cambian
  static: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  },
  // SEMI-ESTÁTICOS (5 min): Datos que cambian ocasionalmente
  semiStatic: {
    staleTime: 5 * 60 * 1000, // 5 minutos (default)
    gcTime: 15 * 60 * 1000, // 15 minutos
  },
  // DINÁMICOS (30 seg): Datos que cambian frecuentemente
  dynamic: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },
  // MUY DINÁMICOS (sin caché): Datos en tiempo real
  realtime: {
    staleTime: 0, // Siempre stale
    gcTime: 1 * 60 * 1000, // 1 minuto máximo
  },
};

/**
 * Categorización de queries por tipo
 * 
 * ESTÁTICOS (categorias-productos, roles, permisos, sucursales, unidades):
 * - categorias-productos
 * - categorias-gastos
 * - metodos-pago
 * - roles
 * - permisos
 * - sucursales
 * - unidades
 * 
 * SEMI-ESTÁTICOS (productos, proveedores, ingredientes, recetas):
 * - productos (con variantes)
 * - proveedores
 * - ingredientes
 * - recetas
 * - clientes
 * 
 * DINÁMICOS (inventario, turnos activos, cajas activas):
 * - inventario (stock)
 * - turnos-activos
 * - cajas-activas
 * - ventas-recientes
 * - gastos-recientes
 * 
 * MUY DINÁMICOS (estadísticas en tiempo real):
 * - estadisticas-tiempo-real
 * - notificaciones
 * - conexión-websocket
 */
