import { useCallback } from 'react';

const STORAGE_KEY = 'punto_de_venta_reports_cache_v1';
const MAX_DAYS_IN_CACHE = 7;
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface StoredReport {
  data: any;
  timestamp: number;
}

export const useReportsLocalStorage = () => {
  /**
   * Cargar TODO el caché de localStorage
   */
  const loadAll = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('📦 localStorage: Sin datos previos');
        return new Map<string, StoredReport>();
      }

      const parsed: Record<string, StoredReport> = JSON.parse(stored);
      const map = new Map(Object.entries(parsed));
      console.log(`📦 localStorage: Cargados ${map.size} items`);
      return map;
    } catch (error) {
      console.error('❌ Error cargando localStorage:', error);
      return new Map<string, StoredReport>();
    }
  }, []);

  /**
   * Guardar caché en localStorage
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
      console.log(`💾 localStorage: Guardados ${reports.size} items (${(sizeInBytes / 1024).toFixed(2)} KB)`);
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
   * Limpiar reportes más antiguos que N días
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

      console.log(`🗑️ localStorage: Limpiados ${deletedCount} items antiguos (> ${maxDays} días)`);
      return reports;
    },
    []
  );

  /**
   * Cargar un reporte específico
   */
  const loadReport = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: Record<string, StoredReport> = JSON.parse(stored);
      const report = parsed[key];

      if (!report) {
        console.log(`📦 localStorage MISS: ${key}`);
        return null;
      }

      // Verificar si no ha expirado (7 días)
      const maxAge = MAX_DAYS_IN_CACHE * 24 * 60 * 60 * 1000;
      if (Date.now() - report.timestamp > maxAge) {
        console.log(`⏰ localStorage EXPIRADO: ${key}`);
        // Eliminar del almacenamiento
        delete parsed[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return null;
      }

      console.log(`✅ localStorage HIT: ${key}`);
      return report.data;
    } catch (error) {
      console.error('❌ Error leyendo localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Guardar un reporte específico
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
      console.log(`💾 localStorage: Guardado ${key}`);
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }, []);

  /**
   * Vaciar TODO el localStorage
   */
  const clearAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ localStorage: Completamente limpio');
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }, []);

  /**
   * Obtener estadísticas
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
