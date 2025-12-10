/**
 * Utilidades para formateo de strings
 * Especialmente para nombres de productos
 */

/**
 * Limpia el nombre del producto removiendo la categoría entre corchetes
 * Ejemplo: "[DULCES] Molletes - Dulce" → "Molletes - Dulce"
 * 
 * @param nombre - Nombre del producto con posible categoría
 * @returns Nombre sin categoría
 */
export const limpiarNombreProducto = (nombre: string): string => {
  if (!nombre) return '';
  
  // Si contiene [CATEGORIA] al inicio, removerlo
  return nombre.replace(/^\s*\[.*?\]\s*/g, '').trim();
};

/**
 * Limpia el nombreVariante removiendo el prefijo "- " si existe
 * Ejemplo: "- Mediano" → "Mediano"
 * 
 * @param nombreVariante - Nombre de la variante con posible prefijo
 * @returns Nombre sin prefijo
 */
export const limpiarNombreVariante = (nombreVariante: string | null | undefined): string => {
  if (!nombreVariante) return '';
  return nombreVariante.replace(/^\s*-\s*/, '').trim();
};

/**
 * Trunca un string a un máximo de caracteres
 * 
 * @param texto - Texto a truncar
 * @param max - Máximo de caracteres
 * @param sufijo - Sufijo a agregar si se trunca (default: '...')
 * @returns Texto truncado
 */
export const truncarTexto = (texto: string, max: number, sufijo: string = '...'): string => {
  if (!texto || texto.length <= max) return texto;
  return texto.substring(0, max) + sufijo;
};

/**
 * Capitaliza la primera letra de cada palabra
 * 
 * @param texto - Texto a capitalizar
 * @returns Texto capitalizado
 */
export const capitalizarPalabras = (texto: string): string => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
};

/**
 * Formatea un número como moneda (USD)
 * 
 * @param cantidad - Número a formatear
 * @returns String formateado como moneda
 */
export const formatearMoneda = (cantidad: number): string => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cantidad);
};
