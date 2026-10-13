/**
 * Patrón de ruta para los handlers de MSW.
 *
 * Se usa una expresión regular en vez de una ruta relativa porque los tests de
 * Node no disponen de `location` con la que resolver rutas relativas: el
 * patrón debe casar la URL completa sin importar el origen.
 *
 * @param pattern - Ruta posterior a `/api` (p. ej. `/sucursales/:id`→`/sucursales/(?<id>\\d+)`).
 * @returns Expresión regular que casa la ruta, con o sin query string.
 */
export const apiPath = (pattern: string): RegExp =>
  new RegExp(`/api${pattern}(?:\\?|$)`);
