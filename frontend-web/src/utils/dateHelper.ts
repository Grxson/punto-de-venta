/**
 * Utilidades para manejo de fechas en zona horaria local
 * Evita problemas con toISOString() que convierte a UTC
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria local
 * Evita problemas de desplazamiento de zona horaria
 */
export const getTodayLocalDate = (): string => {
  const today = new Date();
  return formatDateToLocal(today);
};

/**
 * Convierte una fecha a formato YYYY-MM-DD en zona horaria local
 * @param date - La fecha a convertir
 * @returns Cadena en formato YYYY-MM-DD
 */
export const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calcula una fecha con offset de días desde hoy
 * @param offsetDays - Número de días a sumar (positivo) o restar (negativo)
 * @returns Cadena en formato YYYY-MM-DD
 */
export const getDateWithOffset = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateToLocal(date);
};
