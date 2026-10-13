/**
 * Rango de fechas seleccionado por el usuario, en formato YYYY-MM-DD.
 * Viaja como parámetros `desde` y `hasta` hacia los endpoints de reportes.
 */
export type DateRangeValue = {
  desde: string;
  hasta: string;
};
