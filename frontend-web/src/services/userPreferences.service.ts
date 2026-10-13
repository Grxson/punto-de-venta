/**
 * Servicio para gestionar preferencias de usuario en localStorage
 */

const STORAGE_KEY_PREFIX = 'puntodeventa_prefs_';

class UserPreferencesService {
  /**
   * Construye la clave real de `localStorage` a partir de la clave lógica.
   *
   * @param key - Clave lógica de la preferencia.
   * @returns La clave prefijada usada en `localStorage`.
   */
  private getStorageKey(key: string): string {
    return `${STORAGE_KEY_PREFIX}${key}`;
  }

  /**
   * Guarda una preferencia de usuario.
   *
   * @param key - Clave lógica de la preferencia (se prefija internamente).
   * @param value - Valor serializable a JSON.
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
   * Obtiene una preferencia de usuario.
   *
   * @param key - Clave lógica de la preferencia.
   * @param defaultValue - Valor a devolver si no existe o no se puede leer.
   * @returns El valor guardado, o `defaultValue`.
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
   * Elimina una preferencia concreta.
   *
   * @param key - Clave lógica de la preferencia.
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
   * Guarda la última ruta visitada.
   *
   * @param route - Ruta (`pathname`) a recordar.
   */
  setLastRoute(route: string): void {
    this.setPreference('lastRoute', route);
  }

  /**
   * Obtiene la última ruta visitada.
   *
   * @returns La ruta guardada, o `undefined` si no hay ninguna.
   */
  getLastRoute(): string | undefined {
    return this.getPreference<string>('lastRoute');
  }

  /**
   * Guarda el índice de la pestaña activa en AdminInventory.
   *
   * @param tabIndex - Índice de la pestaña.
   */
  setAdminInventoryTab(tabIndex: number): void {
    this.setPreference('adminInventoryTab', tabIndex);
  }

  /**
   * Obtiene el índice de la pestaña activa en AdminInventory.
   *
   * @returns El índice guardado, o `0` si no hay ninguno.
   */
  getAdminInventoryTab(): number {
    return this.getPreference<number>('adminInventoryTab', 0) ?? 0;
  }

  /**
   * Guarda la categoría seleccionada en el POS.
   *
   * @param categoryId - ID de la categoría, o `null` si no hay selección.
   */
  setPosSelectedCategory(categoryId: number | null): void {
    this.setPreference('posSelectedCategory', categoryId);
  }

  /**
   * Obtiene la categoría seleccionada en el POS.
   *
   * @returns El ID de la categoría, o `null` si no hay selección.
   */
  getPosSelectedCategory(): number | null {
    const value = this.getPreference<number | null>('posSelectedCategory', null);
    return value ?? null;
  }

  /**
   * Guarda la subcategoría seleccionada.
   *
   * @param subcategoryId - ID de la subcategoría, o `null` si no hay selección.
   */
  setPosSubcategoryId(subcategoryId: number | null): void {
    this.setPreference('posSubcategoryId', subcategoryId);
  }

  /**
   * Obtiene la subcategoría seleccionada.
   *
   * @returns El ID de la subcategoría, o `null` si no hay selección.
   */
  getPosSubcategoryId(): number | null {
    const value = this.getPreference<number | null>('posSubcategoryId', null);
    return value ?? null;
  }

  /**
   * Guarda la subcategoría seleccionada en Desayunos (obsoleto; usar `setPosSubcategoryId`).
   *
   * @param subcategoryId - ID de la subcategoría como texto, o `null`.
   */
  setPosDesayunosSubcategory(subcategoryId: string | null): void {
    this.setPreference('posDesayunosSubcategory', subcategoryId);
  }

  /**
   * Obtiene la subcategoría seleccionada en Desayunos (obsoleto; usar `getPosSubcategoryId`).
   *
   * @returns El ID de la subcategoría como texto, o `null`.
   */
  getPosDesayunosSubcategory(): string | null {
    const value = this.getPreference<string | null>('posDesayunosSubcategory', null);
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

