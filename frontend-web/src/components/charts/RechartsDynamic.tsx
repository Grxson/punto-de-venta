/**
 * Wrapper dinámico para Recharts
 * Soluciona el error: "can't access lexical declaration 'React' before initialization"
 * Este archivo permite lazy-loading de recharts para evitar conflictos de importación circular
 */

import { lazy, Suspense, ReactNode } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Lazy load cada componente de recharts
export const PieChart = lazy(() => import('recharts').then(m => ({ default: m.PieChart })));
export const Pie = lazy(() => import('recharts').then(m => ({ default: m.Pie })));
export const BarChart = lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
export const Bar = lazy(() => import('recharts').then(m => ({ default: m.Bar })));
export const XAxis = lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
export const YAxis = lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
export const CartesianGrid = lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
export const Tooltip = lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));
export const Legend = lazy(() => import('recharts').then(m => ({ default: m.Legend })));
export const ResponsiveContainer = lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
export const Cell = lazy(() => import('recharts').then(m => ({ default: m.Cell })));
export const LineChart = lazy(() => import('recharts').then(m => ({ default: m.LineChart })));
export const Line = lazy(() => import('recharts').then(m => ({ default: m.Line })));
export const AreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
export const Area = lazy(() => import('recharts').then(m => ({ default: m.Area })));

/**
 * Wrapper para suspense boundary - muestra loading mientras carga recharts
 */
export const ChartSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense
    fallback={
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={300}
      >
        <CircularProgress />
      </Box>
    }
  >
    {children}
  </Suspense>
);
