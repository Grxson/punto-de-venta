/**
 * Admin Reports Charts - Lazy loaded to prevent circular dependencies with Recharts
 */

import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface SalesChartData {
  name: string;
  valor: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface ProductChartData {
  name: string;
  nameShort: string;
  ventas: number;
  ingresos: number;
}

export const SalesVsGastosChart = ({ data }: { data: SalesChartData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
      <Legend />
      <Bar dataKey="valor" fill="#1976d2" />
    </BarChart>
  </ResponsiveContainer>
);

export const Top5ProductosPieChart = ({ data }: { data: PieChartData[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
    </PieChart>
  </ResponsiveContainer>
);

export const Top5ProductosPorUnidadesChart = ({ data }: { data: ProductChartData[] }) => (
  <Box
    sx={{
      width: '100%',
      height: { xs: 400, sm: 450, md: 500, lg: 550 },
      minHeight: 400,
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="nameShort"
          angle={-45}
          textAnchor="end"
          height={140}
          interval={0}
          tick={{ fontSize: 12 }}
          label={{
            value: 'Productos',
            position: 'insideBottom',
            offset: -5,
            style: { textAnchor: 'middle', fontSize: 14 },
          }}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#2e7d32"
          label={{
            value: 'Unidades Vendidas',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12 },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#1976d2"
          label={{
            value: 'Ingresos ($)',
            angle: 90,
            position: 'insideRight',
            style: { textAnchor: 'middle', fontSize: 12 },
          }}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'ventas') {
              return [`${value} unidades`, 'Unidades Vendidas'];
            }
            return [`$${value.toFixed(2)}`, 'Ingresos'];
          }}
          labelFormatter={(label) => {
            const fullName = data.find((d) => d.nameShort === label)?.name;
            return fullName || label;
          }}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            if (value === 'ventas') return 'Unidades Vendidas';
            if (value === 'ingresos') return 'Ingresos ($)';
            return value;
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="ventas"
          fill="#2e7d32"
          name="Unidades Vendidas"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="ingresos"
          fill="#1976d2"
          name="Ingresos ($)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </Box>
);

export default {
  SalesVsGastosChart,
  Top5ProductosPieChart,
  Top5ProductosPorUnidadesChart,
};
