import { useCallback } from 'react';

const STORAGE_KEY = 'punto_de_venta_reports_cache_v1';
const MAX_DAYS_IN_CACHE = 7;
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

/** Reporte persistido en el navegador junto con su marca de tiempo. */
interface StoredReport {
  /** Datos del reporte tal cual se recibieron de la API. */
  data: any;
  /** `Date.now()` al guardar; a partir de `MAX_DAYS_IN_CACHE` se descarta. */
  timestamp: number;
}

/**
 * Caché de reportes persistida en `localStorage`, distinta de la caché en memoria.
 * @remarks Permite que un corte se vea al instante tras reabrir la pantalla o
 * recargar la página, sin volver a golpear la API.
 */
export const useReportsLocalStorage = () => {
  /**
 * Lee todo el caché persistido en `localStorage`.
 * @remarks Si el JSON está corrupto se registra el error y se devuelve un Map vacío,
 * para que un caché inválido no impida abrir la pantalla de reportes.
 * @returns Mapa clave -> reporte almacenado.
 */
  const loadAll = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return new Map<string, StoredReport>();
      }

      const parsed: Record<string, StoredReport> = JSON.parse(stored);
      const map = new Map(Object.entries(parsed));
      return map;
    } catch (error) {
      console.error('❌ Error cargando localStorage:', error);
      return new Map<string, StoredReport>();
    }
  }, []);

  /**
 * Persiste el caché completo en `localStorage`.
 * @remarks Antes de escribir se purgan los reportes más antiguos si el payload
 * supera 5 MB, y si el navegador lanza `QuotaExceededError` se vacía la clave
 * entera: preferimos perder el caché a que la escritura falle en cada intento.
 * @param reports - Mapa de reportes a persistir.
 */
  const saveAll = useCallback((reports: Map<string, StoredReport>) => {
    try {
      const obj = Object.fromEntries(reports);
      const jsonStr = JSON.stringify(obj);
      const sizeInBytes = new Blob([jsonStr]).size;

      if (sizeInBytes > MAX_STORAGE_SIZE) {
        console.warn(`⚠️ Cache muy grande (${sizeInBytes} bytes). Limpiando...`);
        // Si es muy grande, limpiar reportes muy antiguos
        cleanOldReports(reports, MAX_DAYS_IN_CACHE - 2);
      }

      localStorage.setItem(STORAGE_KEY, jsonStr);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('❌ localStorage LLENO. Limpiando datos antiguos...');
        // Vaciar para liberar espacio
        localStorage.removeItem(STORAGE_KEY);
      } else {
        console.error('❌ Error guardando en localStorage:', error);
      }
    }
  }, []);

  /**
 * Elimina del mapa los reportes con más de N días de antigüedad.
 * @param reports - Mapa de reportes; se muta en el sitio.
 * @param maxDays - Antigüedad máxima tolerada, en días.
 * @returns El mismo mapa ya depurado.
 */
  const cleanOldReports = useCallback(
    (reports: Map<string, StoredReport>, maxDays: number) => {
      const cutoffTime = Date.now() - maxDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const [key, value] of reports.entries()) {
        if (value.timestamp < cutoffTime) {
          reports.delete(key);
          deletedCount++;
        }
      }

      return reports;
    },
    []
  );

  /**
 * Lee un reporte concreto y lo borra del almacenamiento si ya venció.
 * @param key - Clave del reporte, con el mismo formato que usa `getCacheKey`.
 * @returns Los datos del reporte, o `null` si no existe o expiró.
 */
  const loadReport = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: Record<string, StoredReport> = JSON.parse(stored);
      const report = parsed[key];

      if (!report) {
        return null;
      }

      const maxAge = MAX_DAYS_IN_CACHE * 24 * 60 * 60 * 1000;
      if (Date.now() - report.timestamp > maxAge) {
        // Eliminar del almacenamiento
        delete parsed[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return null;
      }

      return report.data;
    } catch (error) {
      console.error('❌ Error leyendo localStorage:', error);
      return null;
    }
  }, []);

  /**
 * Guarda un reporte concreto sin reescribir el resto del caché.
 * @param key - Clave del reporte.
 * @param data - Datos del reporte a persistir.
 */
  const saveReport = useCallback((key: string, data: any) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: Record<string, StoredReport> = stored ? JSON.parse(stored) : {};

      parsed[key] = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }, []);

  /**
 * Borra la clave completa del caché persistido.
 */
  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }, []);

  /**
 * Informa del estado del caché persistido, para depurar y controlar su tamaño.
 * @returns Cantidad de entradas, tamaño total en KB y antigüedad de cada una.
 */
  const getStats = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { totalItems: 0, sizeKB: 0, items: [] };

      const parsed: Record<string, StoredReport> = JSON.parse(stored);
      const sizeInBytes = new Blob([stored]).size;
      const items = Object.entries(parsed).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ageInHours: (Date.now() - value.timestamp) / (1000 * 60 * 60),
      }));

      return {
        totalItems: Object.keys(parsed).length,
        sizeKB: (sizeInBytes / 1024).toFixed(2),
        items,
      };
    } catch (error) {
      console.error('❌ Error obteniendo stats:', error);
      return { totalItems: 0, sizeKB: 0, items: [] };
    }
  }, []);

  return {
    loadAll,
    saveAll,
    loadReport,
    saveReport,
    cleanOldReports,
    clearAll,
    getStats,
  };
};
