/**
 * Componente para Tab 2: Corte General - MINIMALISTA CON MENÚS ANIDADOS
 * Tabla simple con detalles expandibles al hacer clic
 * Nivel 1: Categoría de gasto
 * Nivel 2: Proveedor dentro de cada categoría
 */

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Paper,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReportCalculations } from '../hooks';
import type { VentaDetalle, GastoDetallado, GastosPorCategoriaYProveedor } from '../types/reportTypes';

/** Props del corte general: ventas y gastos ya cargados por `AdminReports`. */
interface GeneralCutTabProps {
  /** Ventas individuales del rango seleccionado. */
  ventas: VentaDetalle[];
  /** Total de gastos del rango, en importe. */
  gastosDia: number;
  /** Rango de fechas activo, en formato `yyyy-MM-dd`. */
  dateRange: {
    /** Fecha inicial. */
    desde: string;
    /** Fecha final. */
    hasta: string;
  };
  /** Gastos del rango con categoría y proveedor resueltos, para el desglose anidado. */
  gastosDetallados?: GastoDetallado[];
}

/**
 * Oscurece el color de fondo de una fila al pasar el cursor.
 * @param bg - Color de fondo en hex; si no está en el mapa, se devuelve igual.
 * @returns El color oscurecido correspondiente, o el mismo si no hay equivalencia.
 */
function adjustBgHover(bg: string): string {
  const hexMap: Record<string, string> = {
    '#e8f5e9': '#d4edda',
    '#fff3cd': '#ffe8b6',
    '#f3e5f5': '#e1bee7',
    '#e3f2fd': '#bbdefb',
    '#ffebee': '#ffcdd2',
    '#f1f8f6': '#e8f5e9',
  };
  return hexMap[bg] || bg;
}

/** Props de una fila expandible del corte. */
interface ExpandableDataRowProps {
  /** Texto de la etiqueta a la izquierda. */
  label: string;
  /** Valor formateado a la derecha. */
  value: string;
  /** Color del valor; hereda el del tema si se omite. */
  color?: string;
  /** Color de fondo de la fila. */
  bg?: string;
  /** Sub-filas opcionales que se muestran al expandir. */
  details?: Array<{ label: string; value: string }>;
}

/**
 * Fila de totales expandible para el corte.
 * @remarks Sólo es clickeable cuando recibe `details`; en ese caso alterna su expansión.
 */
function ExpandableDataRow({ label, value, color, bg, details }: ExpandableDataRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = details && details.length > 0;

  return (
    <>
      {/* Fila principal (clickeable si tiene detalles) */}
      <Box
        onClick={() => hasDetails && setExpanded(!expanded)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: bg,
          cursor: hasDetails ? 'pointer' : 'default',
          userSelect: 'none',
          transition: 'background-color 0.2s ease',
          '&:hover': hasDetails ? { backgroundColor: bg ? adjustBgHover(bg) : 'grey.50' } : undefined,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          {label}
          {hasDetails && (
            <span style={{ fontSize: '12px', marginLeft: '4px', transition: 'transform 0.2s' }}>
              {expanded ? '▼' : '►'}
            </span>
          )}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: color || 'inherit' }}>
          {value}
        </Typography>
      </Box>

      {/* Filas expandidas (detalles de primer nivel) */}
      {hasDetails && expanded && (
        <>
          {details.map((detail, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 0.75,
                px: 3,
                borderBottom: idx === details.length - 1 ? 2 : 1,
                borderColor: idx === details.length - 1 ? 'divider' : 'grey.100',
                backgroundColor: 'grey.50',
                fontSize: '0.85rem',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 400 }}>
                {detail.label}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: color }}>
                {detail.value}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </>
  );
}

/** Props de la fila de gastos con desglose anidado. */
interface NestedGastoRowProps {
  /** Gastos agrupados por categoría y, dentro, por proveedor. */
  gastosPorCategoria: GastosPorCategoriaYProveedor[];
}

/**
 * Fila de gastos expandible de dos niveles: nivel 1 categoría, nivel 2 proveedor.
 * @remarks El segundo nivel abre un `Popper` con los gastos individuales del proveedor
 * y se cierra al hacer clic fuera.
 */
function NestedGastoRow({ gastosPorCategoria }: NestedGastoRowProps) {
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<{ [key: string]: boolean }>({});
  const popoverRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  if (gastosPorCategoria.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#fff3cd',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Gastos
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#856404' }}>
          $0.00
        </Typography>
      </Box>
    );
  }

  const totalGastosGenerales = gastosPorCategoria.reduce((sum, cat) => sum + cat.totalGastos, 0);

  return (
    <>
      {/* NIVEL 1: Fila principal de Gastos */}
      <Box
        onClick={() => setExpandedCategoria(expandedCategoria ? null : 'main')}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#fff3cd',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.2s ease',
          '&:hover': { backgroundColor: '#ffe8b6' },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
          Gastos
          <span style={{ fontSize: '12px', marginLeft: '4px' }}>
            {expandedCategoria ? '▼' : '►'}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#856404' }}>
          ${totalGastosGenerales.toFixed(2)}
        </Typography>
      </Box>

      {/* NIVEL 1 EXPANDIDO: Categorías */}
      {expandedCategoria && (
        <>
          {gastosPorCategoria.map((categoria, catIdx) => (
            <Box key={`cat-${catIdx}`}>
              {/* Fila de Categoría (expandible) */}
              <Box
                onClick={() =>
                  setExpandedCategoria(expandedCategoria === categoria.categoriaNombre ? 'main' : categoria.categoriaNombre)
                }
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  px: 3,
                  borderBottom: 1,
                  borderColor: 'grey.100',
                  backgroundColor: '#fff9e6',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { backgroundColor: '#fffae0' },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {categoria.categoriaNombre}
                  <span style={{ fontSize: '10px' }}>
                    {expandedCategoria === categoria.categoriaNombre ? '▼' : '►'}
                  </span>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#856404' }}>
                  ${categoria.totalGastos.toFixed(2)}
                </Typography>
              </Box>

              {/* NIVEL 2: Proveedores dentro de la categoría */}
              {expandedCategoria === categoria.categoriaNombre && (
                <>
                  {categoria.gastosDetallados.map((proveedor, provIdx) => {
                    const popoverKey = `${catIdx}-${provIdx}`;
                    const hasGastos = proveedor.gastosIndividuales && proveedor.gastosIndividuales.length > 0;
                    
                    return (
                      <Box key={`prov-${popoverKey}`}>
                        {/* Fila del Proveedor con Popover */}
                        <Box
                          ref={(el: HTMLElement | null) => {
                            if (el) {
                              popoverRefs.current[popoverKey] = el;
                            } else {
                              delete popoverRefs.current[popoverKey];
                            }
                          }}
                          onClick={() => hasGastos && setPopoverOpen(prev => ({ ...prev, [popoverKey]: !prev[popoverKey] }))}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.6,
                            px: 5,
                            borderBottom: provIdx === categoria.gastosDetallados.length - 1 ? 2 : 1,
                            borderColor:
                              provIdx === categoria.gastosDetallados.length - 1 ? 'divider' : 'grey.100',
                            backgroundColor: '#fffcf0',
                            fontSize: '0.75rem',
                            cursor: hasGastos ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease',
                            '&:hover': hasGastos ? { backgroundColor: '#fff8e6' } : undefined,
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 400, fontSize: '0.75rem' }}>
                            {proveedor.proveedorNombre}
                            {hasGastos && (
                              <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                                {popoverOpen[popoverKey] ? '▼' : '🔍'}
                              </span>
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 500, color: '#856404', fontSize: '0.75rem' }}
                          >
                            ${proveedor.monto.toFixed(2)}
                          </Typography>
                        </Box>

                        {/* Popover con detalles de gastos */}
                        {popoverOpen[popoverKey] && popoverRefs.current[popoverKey] && (
                          <Popper
                            open={true}
                            anchorEl={popoverRefs.current[popoverKey]}
                            placement="right-start"
                            sx={{ zIndex: 1300 }}
                            disablePortal={false}
                            modifiers={[
                              {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                  altAxis: true,
                                  altBoundary: true,
                                  tether: true,
                                  rootBoundary: 'document',
                                },
                              },
                            ]}
                          >
                            <ClickAwayListener onClickAway={() => setPopoverOpen(prev => ({ ...prev, [popoverKey]: false }))}>
                              <Paper
                                elevation={8}
                                sx={{
                                  p: 1.5,
                                  maxWidth: 350,
                                  ml: 1,
                                  backgroundColor: '#fafaf0',
                                  border: '1px solid #e8e8d8',
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.85rem' }}>
                                  {proveedor.proveedorNombre}
                                </Typography>
                                {proveedor.gastosIndividuales?.map((gasto, idx) => (
                                  <Box key={idx} sx={{ mb: 0.8, pb: 0.8, borderBottom: idx < (proveedor.gastosIndividuales?.length || 0) - 1 ? '1px solid #e8e8d8' : 'none' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                        {gasto.nota || 'Sin descripción'}
                                      </Typography>
                                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#d32f2f' }}>
                                        ${gasto.monto.toFixed(2)}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666', display: 'block', mt: 0.25 }}>
                                      {(() => {
                                        try {
                                          // El backend no normaliza la fecha del gasto: se acepta ISO, "yyyy-MM-dd HH:mm:ss" o sólo "yyyy-MM-dd"
                                          let parsedDate;
                                          if (gasto.fecha.includes('T')) {
                                            // Formato ISO: 2025-12-04T18:49:00
                                            parsedDate = new Date(gasto.fecha);
                                          } else if (gasto.fecha.includes(' ')) {
                                            // Formato: 2025-12-04 18:49:00
                                            parsedDate = parse(gasto.fecha, 'yyyy-MM-dd HH:mm:ss', new Date());
                                          } else {
                                            // Sólo fecha: 2025-12-04
                                            parsedDate = parse(gasto.fecha, 'yyyy-MM-dd', new Date());
                                          }
                                          
                                          if (isNaN(parsedDate.getTime())) {
                                            return 'Fecha inválida';
                                          }
                                          return format(parsedDate, 'dd MMM yyyy, HH:mm', { locale: es });
                                        } catch (error) {
                                          return 'Fecha inválida';
                                        }
                                      })()}
                                    </Typography>
                                  </Box>
                                ))}
                                <Box sx={{ mt: 1, pt: 1, borderTop: '2px solid #e8e8d8', display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    Total:
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#d32f2f' }}>
                                    -${proveedor.monto.toFixed(2)}
                                  </Typography>
                                </Box>
                              </Paper>
                            </ClickAwayListener>
                          </Popper>
                        )}
                      </Box>
                    );
                  })}
                </>
              )}
            </Box>
          ))}
        </>
      )}
    </>
  );
}

/**
 * Corte general del período seleccionado: venta total, métodos de pago, gastos y ganancia.
 * @remarks Se apoya en `useReportCalculations` para derivar todos los totales; si no
 * hay ventas en el rango muestra un aviso en vez de la tabla.
 */
export default function GeneralCutTab({
  ventas,
  gastosDia,
  dateRange,
  gastosDetallados = [],
}: GeneralCutTabProps) {
  const calculations = useReportCalculations();

  if (ventas.length === 0) {
    return <Alert severity="info">No hay ventas registradas en este período</Alert>;
  }

  const totalVentas = calculations.calcularTotalVentas(ventas);
  const metodosPago = calculations.agruparMetodosPago(ventas);
  const ganancia = calculations.calcularGanancia(totalVentas, gastosDia);
  const netos = calculations.calcularNetos(metodosPago, totalVentas, gastosDia);

  // ✨ Desglose anidado: sólo se calcula si hay gastos detallados en el rango
  const gastosPorCategoriaYProveedor = gastosDetallados.length > 0
    ? calculations.agruparGastosPorCategoriaYProveedor(gastosDetallados)
    : [];

  const colorGanancia = ganancia.esPositiva ? '#2e7d32' : '#d32f2f';
  const colorNeto = netos.ventasMenosGastos >= 0 ? '#2e7d32' : '#d32f2f';

  return (
    <Card sx={{ maxWidth: '600px', mx: 'auto', boxShadow: 'none', border: 1, borderColor: 'divider' }}>
      <CardContent sx={{ p: 0 }}>
        {/* Encabezado con el rango de fechas */}
        <Box sx={{ bg: 'grey.50', p: 2, borderBottom: 2, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            📅 Corte General
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parse(dateRange.desde, 'yyyy-MM-dd', new Date()), "'del' dd 'de' MMMM ", { locale: es })} -
            {format(parse(dateRange.hasta, 'yyyy-MM-dd', new Date()), " 'al' dd 'de' MMMM ", { locale: es })}
          </Typography>
        </Box>

        {/* Datos Esenciales */}
        <Box>
          {/* Total Ventas */}
          <ExpandableDataRow
            label="Venta Total"
            value={`$${totalVentas.toFixed(2)}`}
            color="#2e7d32"
            bg="#f1f8f6"
          />

          {/* Métodos de Pago */}
          {Object.entries(metodosPago).map(([metodo, monto]: [string, number]) => (
            <ExpandableDataRow key={metodo} label={metodo} value={`$${(monto as number).toFixed(2)}`} />
          ))}

          {/* ✨ GASTOS ANIDADO - Categoría > Proveedor */}
          <NestedGastoRow gastosPorCategoria={gastosPorCategoriaYProveedor} />

          {/* Ganancia Neta */}
          <ExpandableDataRow
            label="Ganancia Neta"
            value={`$${ganancia.neta.toFixed(2)}`}
            color={colorGanancia}
            bg={colorGanancia === '#2e7d32' ? '#e8f5e9' : '#ffebee'}
          />

          {/* % Ganancia */}
          <ExpandableDataRow
            label="% Ganancia"
            value={`${ganancia.porcentaje.toFixed(2)}%`}
            color={colorGanancia}
          />
          {/* Ventas Total - Gastos */}
          <ExpandableDataRow
            label="Ventas Tota - Gastos"
            value={`$${netos.ventasMenosGastos.toFixed(2)}`}
            color={colorNeto}
            bg={colorNeto === '#2e7d32' ? '#e8f5e9' : '#ffebee'}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
