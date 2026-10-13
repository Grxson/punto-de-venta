/**
 * Re-exportación segura de los componentes de Recharts.
 * Este módulo aísla los imports de recharts para evitar dependencias circulares;
 * Vite resuelve los límites entre módulos correctamente.
 */

// Re-exportación directa: los límites de módulo los maneja Vite
export * from 'recharts';
