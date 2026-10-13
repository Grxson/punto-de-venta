/**
 * Barrel de los hooks de reportes.
 * Evita que `AdminReports.tsx` importe los hooks uno por uno.
 */

export { useReportData } from './useReportData';
export { useReportCalculations } from './useReportCalculations';