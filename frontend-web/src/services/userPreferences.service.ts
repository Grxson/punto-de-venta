/**
 * Servicio para gestionar preferencias de usuario en localStorage
 */

const STORAGE_KEY_PREFIX = 'puntodeventa_prefs_';

class UserPreferencesService {
  private getStorageKey(key: string): string {
    return `${STORAGE_KEY_PREFIX}${key}`;
  }

  /**
   * Guarda una preferencia de usuario
   */
  setPreference(key: string, value: any): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error al guardar preferencia ${key}:`, error);
    }
  }

  /**
   * Obtiene una preferencia de usuario
   */
  getPreference<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const storageKey = this.getStorageKey(key);
      const item = localStorage.getItem(storageKey);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error al leer preferencia ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Elimina una preferencia específica
   */
  removePreference(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn(`Error al eliminar preferencia ${key}:`, error);
    }
  }

  /**
   * Guarda la última ruta visitada
   */
  setLastRoute(route: string): void {
    this.setPreference('lastRoute', route);
  }

  /**
   * Obtiene la última ruta visitada
   */
  getLastRoute(): string | undefined {
    return this.getPreference<string>('lastRoute');
  }

  /**
   * Guarda el índice de la pestaña activa en AdminInventory
   */
  setAdminInventoryTab(tabIndex: number): void {
    this.setPreference('adminInventoryTab', tabIndex);
  }

  /**
   * Obtiene el índice de la pestaña activa en AdminInventory
   */
  getAdminInventoryTab(): number {
    return this.getPreference<number>('adminInventoryTab', 0) ?? 0;
  }

  /**
   * Guarda la categoría seleccionada en POS
   */
  setPosSelectedCategory(categoryId: number | null): void {
    this.setPreference('posSelectedCategory', categoryId);
  }

  /**
   * Obtiene la categoría seleccionada en POS
   */
  getPosSelectedCategory(): number | null {
    const value = this.getPreference<number | null>('posSelectedCategory', null);
    return value ?? null;
  }

  /**
   * Limpia todas las preferencias del usuario
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error al limpiar preferencias:', error);
    }
  }
}

export const userPreferencesService = new UserPreferencesService();

