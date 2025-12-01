import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración del QueryClient de React Query
 * 
 * Estrategia de caché por tipo de dato:
 * - Datos estáticos (catálogos): 10 minutos
 * - Datos semi-estáticos (productos, inventario): 5 minutos
 * - Datos dinámicos (ventas, turnos activos): 30 segundos
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para todas las queries
      staleTime: 5 * 60 * 1000, // 5 minutos - datos semi-estáticos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché (antes cacheTime)
      retry: 1, // Reintentar 1 vez en caso de error
      refetchOnWindowFocus: false, // No refetch automático al volver a la ventana
      refetchOnMount: true, // Refetch al montar el componente si datos stale
      refetchOnReconnect: true, // Refetch al reconectar
    },
    mutations: {
      // Configuración por defecto para todas las mutations
      retry: 0, // No reintentar mutations automáticamente
    },
  },
});

/**
 * Tiempos de staleTime recomendados por tipo de dato:
 * 
 * ESTÁTICOS (10 min):
 * - categorias-productos
 * - categorias-gastos
 * - metodos-pago
 * - roles
 * - permisos
 * - sucursales
 * - unidades
 * 
 * SEMI-ESTÁTICOS (5 min):
 * - productos
 * - proveedores
 * - ingredientes
 * - recetas
 * 
 * DINÁMICOS (30 seg):
 * - inventario
 * - turnos-activos
 * - cajas-activas
 * - ventas-recientes
 * 
 * MUY DINÁMICOS (sin caché / 0 seg):
 * - estadisticas-tiempo-real
 * - notificaciones
 */
