/**
 * Charts component - Lazy loaded to prevent circular dependencies with Recharts
 * This entire component is loaded only when needed
 */

import { Box, Typography } from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface PieData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface BarData {
  name: string;
  ingreso: number;
  cantidad: number;
  [key: string]: any;
}

export const DashboardPieChart = ({ data }: { data: PieData[] }) => {
  return (
    <Box sx={{ flex: 1, minHeight: 350 }}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => <span style={{ fontSize: '14px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">No hay datos para mostrar</Typography>
        </Box>
      )}
    </Box>
  );
};

export const DashboardBarChart = ({ data }: { data: BarData[] }) => {
  return (
    <Box sx={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Bar dataKey="ingreso" fill="#1976d2" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default {
  DashboardPieChart,
  DashboardBarChart,
};
