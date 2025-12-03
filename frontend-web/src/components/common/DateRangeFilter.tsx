import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Today,
  DateRange as DateRangeIcon,
  CalendarMonth,
  History,
} from '@mui/icons-material';
import type { DateRangeValue } from '../../types/dateRange.types';

import type { ReactNode } from 'react';

// Re-exportar el tipo para compatibilidad
export type { DateRangeValue };

interface DateRangeFilterProps {
  onChange: (range: DateRangeValue) => void;
  initialRange?: DateRangeValue;
  showLabel?: boolean;
  label?: string;
  children?: ReactNode;
}

// Función para obtener el inicio de la semana (lunes)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el inicio
  return new Date(d.setDate(diff));
};

// Función para obtener el fin de la semana (domingo)
const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

// Función para formatear fecha a YYYY-MM-DD en zona horaria local
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtener rangos predefinidos
const getPresetRanges = () => {
  const today = new Date();
  
  // Hoy
  const todayStr = formatDate(today);
  
  // Esta semana
  const thisWeekStart = getStartOfWeek(today);
  const thisWeekEnd = getEndOfWeek(today);
  
  // Semana pasada
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStart = getStartOfWeek(lastWeekEnd);
  
  // Este mes
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Mes pasado
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  return {
    hoy: { desde: todayStr, hasta: todayStr },
    estaSemana: { desde: formatDate(thisWeekStart), hasta: formatDate(thisWeekEnd) },
    semanaPasada: { desde: formatDate(lastWeekStart), hasta: formatDate(lastWeekEnd) },
    esteMes: { desde: formatDate(thisMonthStart), hasta: formatDate(thisMonthEnd) },
    mesPasado: { desde: formatDate(lastMonthStart), hasta: formatDate(lastMonthEnd) },
  };
};

type PresetKey = 'hoy' | 'estaSemana' | 'semanaPasada' | 'esteMes' | 'mesPasado' | 'personalizado';

export default function DateRangeFilter({ 
  onChange, 
  initialRange,
  showLabel = true,
  label = 'Filtrar por fecha',
  children
}: DateRangeFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const presets = getPresetRanges();
  
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('hoy');
  const [customRange, setCustomRange] = useState<DateRangeValue>(
    initialRange || presets.hoy
  );

  // Detectar qué preset coincide con el rango actual
  const detectPreset = (range: DateRangeValue): PresetKey => {
    if (range.desde === presets.hoy.desde && range.hasta === presets.hoy.hasta) return 'hoy';
    if (range.desde === presets.estaSemana.desde && range.hasta === presets.estaSemana.hasta) return 'estaSemana';
    if (range.desde === presets.semanaPasada.desde && range.hasta === presets.semanaPasada.hasta) return 'semanaPasada';
    if (range.desde === presets.esteMes.desde && range.hasta === presets.esteMes.hasta) return 'esteMes';
    if (range.desde === presets.mesPasado.desde && range.hasta === presets.mesPasado.hasta) return 'mesPasado';
    return 'personalizado';
  };

  useEffect(() => {
    if (initialRange) {
      setCustomRange(initialRange);
      setSelectedPreset(detectPreset(initialRange));
    }
  }, [initialRange]);

  const handlePresetClick = (preset: PresetKey) => {
    setSelectedPreset(preset);
    if (preset !== 'personalizado') {
      const range = presets[preset];
      setCustomRange(range);
      console.log('Preset seleccionado:', preset, range);
      onChange(range);
    }
  };

  const handleCustomDateChange = (field: 'desde' | 'hasta', value: string) => {
    const newRange = { ...customRange, [field]: value };
    setCustomRange(newRange);
    setSelectedPreset('personalizado');
    
    // Solo notificar si ambas fechas son válidas
    if (newRange.desde && newRange.hasta && newRange.desde <= newRange.hasta) {
      onChange(newRange);
    }
  };

  const presetButtons = [
    { key: 'hoy' as PresetKey, label: 'Hoy', icon: <Today fontSize="small" /> },
    { key: 'estaSemana' as PresetKey, label: isMobile ? 'Semana' : 'Esta Semana', icon: <DateRangeIcon fontSize="small" /> },
    { key: 'semanaPasada' as PresetKey, label: isMobile ? 'Sem. Pasada' : 'Semana Pasada', icon: <History fontSize="small" /> },
    { key: 'esteMes' as PresetKey, label: isMobile ? 'Mes' : 'Este Mes', icon: <CalendarMonth fontSize="small" /> },
    { key: 'mesPasado' as PresetKey, label: isMobile ? 'Mes Pasado' : 'Mes Pasado', icon: <CalendarMonth fontSize="small" /> },
  ];

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {showLabel && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          {/* Botones de presets */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1, 
            mb: 2,
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {presetButtons.map((preset) => (
              <Chip
                key={preset.key}
                icon={preset.icon}
                label={preset.label}
                onClick={() => handlePresetClick(preset.key)}
                color={selectedPreset === preset.key ? 'primary' : 'default'}
                variant={selectedPreset === preset.key ? 'filled' : 'outlined'}
                sx={{ 
                  fontWeight: selectedPreset === preset.key ? 'bold' : 'normal',
                  '&:hover': { 
                    backgroundColor: selectedPreset === preset.key 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover 
                  }
                }}
              />
            ))}
          </Box>

          {/* Campos de fecha personalizados */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2, 
            alignItems: isMobile ? 'stretch' : 'center' 
          }}>
            <TextField
              label="Desde"
              type="date"
              size="small"
              value={customRange.desde}
              onChange={(e) => handleCustomDateChange('desde', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: isMobile ? '100%' : 160 }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={customRange.hasta}
              onChange={(e) => handleCustomDateChange('hasta', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: customRange.desde }}
              sx={{ minWidth: isMobile ? '100%' : 160 }}
            />
            {selectedPreset === 'personalizado' && (
              <Chip 
                label="Rango personalizado" 
                color="secondary" 
                size="small"
                sx={{ alignSelf: 'center' }}
              />
            )}
          </Box>
        </Box>
        {/* Children: paginador de días u otros controles */}
        {children && (
          <Box sx={{ minWidth: 220, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: { xs: 2, md: 0 } }}>
            {children}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

