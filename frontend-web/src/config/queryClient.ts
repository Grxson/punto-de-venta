import { QueryClient } from '@tanstack/react-query';

/**
 * OPTIMIZACIÓN PASO 2.5: Estrategia de caché de React Query
 *
 * El `QueryClient` se configura con una estrategia de caché según el tipo de
 * dato, para no servir datos rancios en el POS ni hacer peticiones de más a la
 * API:
 * - Datos estáticos (catálogos): 10 minutos, gcTime 30 min
 * - Datos semi-estáticos (productos, inventario): 5 minutos, gcTime 15 min
 * - Datos dinámicos (ventas, turnos activos): 30 segundos, gcTime 5 min
 * - Muy dinámicos (estadísticas): sin caché (0 seg)
 *
 * Este bloque fija los valores por defecto; cada hook puede apartarse de ellos
 * pasando su perfil de `queryDefaults` en `queryOptions`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para todas las queries
      staleTime: 5 * 60 * 1000, // 5 minutos - datos semi-estáticos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché (antes cacheTime)
      retry: 1, // Reintentar 1 vez en caso de error
      // En un POS el refocus es constante (el cajero salta entre ventanas de la
      // caja): refetch al volver a enfocar genera carga innecesaria.
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Refetch solo si los datos están stale
      refetchOnReconnect: true, // Refetch solo si los datos están stale
      // Deduplicación automática de peticiones: varias queries con la misma
      // clave comparten una única llamada a la API.
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
 * Perfiles de cacheabilidad por tipo de dato.
 * Usar en los hooks vía el parámetro `queryOptions` de `useQuery`.
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
