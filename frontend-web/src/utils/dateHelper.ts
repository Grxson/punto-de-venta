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

/**
 * Convierte una fecha en formato YYYY-MM-DD a ISO local (yyyy-MM-ddTHH:mm:ss) SIN conversión a UTC
 * ⚠️ CRÍTICO: El backend espera fechas en zona horaria local, NO UTC
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2025-12-18")
 * @param hora - Hora en formato HH:mm:ss (ej: "00:00:00" o "23:59:59")
 * @returns Cadena en formato yyyy-MM-ddTHH:mm:ss (zona horaria local)
 */
export const toLocalISOString = (dateString: string, hora: string): string => {
  return `${dateString}T${hora}`;
};
