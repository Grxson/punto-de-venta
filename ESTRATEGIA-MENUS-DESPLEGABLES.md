# 🎯 ESTRATEGIA FINAL: Menús Desplegables en Tabla

## ✨ La Idea Perfecta

Mantener la **simplicidad de la tabla minimalista**, pero agregar **detalles específicos al hacer clic**:

```
╔═══════════════════════════════════════════════════════╗
║ CORTE DE CAJA                                         ║
║ del 04 de diciembre - al 04 de diciembre              ║
╚═══════════════════════════════════════════════════════╝

Total Ventas                                  $1,450.00
Efectivo                                      $1,345.00
Transferencia                                   $105.00

Gastos                                         -$106.00  ← Click aquí ↓
  [Expandido]
  ├── Salarios                                  -$80.00
  ├── Suministros                               -$20.00
  ├── Servicios                                  -$4.00
  └── Otros                                      -$2.00

Ganancia Neta                                  -$156.00
% Ganancia                                     -10.76%

Efectivo - Gastos                              -$261.00
Ventas Total - Gastos                          -$156.00
```

---

## 🎨 Concepto Visual

### Estado Contraído (Por defecto)
```
Gastos                                         -$106.00   [►]
```

### Al hacer clic (Expandido)
```
Gastos                                         -$106.00   [▼]
  Salarios                                      -$80.00
  Suministros                                   -$20.00
  Servicios                                      -$4.00
  Otros                                          -$2.00
  ────────────────────────────────────────────────────────
  Total                                        -$106.00
```

---

## 🔧 Implementación Técnica

### Componente: ExpandableDataRow

```tsx
interface ExpandableDataRowProps {
  label: string;
  value: string;
  color?: string;
  bg?: string;
  details?: Array<{ label: string; value: string }>;
}

function ExpandableDataRow({ 
  label, 
  value, 
  color, 
  bg, 
  details 
}: ExpandableDataRowProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!details || details.length === 0) {
    // Si no hay detalles, es una fila normal
    return <DataRow label={label} value={value} color={color} bg={bg} />;
  }

  return (
    <>
      {/* Fila principal (clickeable) */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: bg,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { backgroundColor: bg ? adjustColor(bg, 0.9) : 'grey.50' },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
          <span style={{ marginLeft: '8px', fontSize: '12px' }}>
            {expanded ? '▼' : '►'}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: color }}>
          {value}
        </Typography>
      </Box>

      {/* Filas expandidas (detalles) */}
      {expanded && (
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
              <Typography variant="caption">{detail.label}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {detail.value}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </>
  );
}
```

---

## 📊 Uso en GeneralCutTab

```tsx
export default function GeneralCutTab({ 
  ventas, 
  gastosDia, 
  dateRange,
  gastosDetallados  // ← Nuevo
}: GeneralCutTabProps) {
  const calculations = useReportCalculations();
  
  const totalVentas = calculations.calcularTotalVentas(ventas);
  const metodosPago = calculations.agruparMetodosPago(ventas);
  const ganancia = calculations.calcularGanancia(totalVentas, gastosDia);
  const netos = calculations.calcularNetos(metodosPago, totalVentas, gastosDia);
  
  // ✨ NUEVO: Agrupar gastos por categoría
  const gastosPorCategoria = gastosDetallados 
    ? calculations.agruparGastosPorCategoria(gastosDetallados)
    : [];

  return (
    <Card sx={{ maxWidth: '600px', mx: 'auto' }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
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
            label="Total Ventas"
            value={`$${totalVentas.toFixed(2)}`}
            color="#2e7d32"
            bg="#f1f8f6"
          />

          {/* Métodos de Pago */}
          {Object.entries(metodosPago).map(([metodo, monto]: [string, number]) => (
            <ExpandableDataRow
              key={metodo}
              label={metodo}
              value={`$${(monto as number).toFixed(2)}`}
            />
          ))}

          {/* ✨ GASTOS EXPANDIBLE */}
          <ExpandableDataRow
            label="Gastos"
            value={`-$${gastosDia.toFixed(2)}`}
            color="#856404"
            bg="#fff3cd"
            details={gastosPorCategoria.map(gasto => ({
              label: gasto.categoriaNombre,
              value: `-$${gasto.totalGastos.toFixed(2)}`
            }))}
          />

          {/* Ganancia Neta */}
          <ExpandableDataRow
            label="Ganancia Neta"
            value={`$${ganancia.neta.toFixed(2)}`}
            color={ganancia.esPositiva ? '#2e7d32' : '#d32f2f'}
            bg={ganancia.esPositiva ? '#e8f5e9' : '#ffebee'}
          />

          {/* % Ganancia */}
          <ExpandableDataRow
            label="% Ganancia"
            value={`${ganancia.porcentaje.toFixed(2)}%`}
            color={ganancia.esPositiva ? '#2e7d32' : '#d32f2f'}
          />

          {/* Efectivo - Gastos */}
          <ExpandableDataRow
            label="Efectivo - Gastos"
            value={`$${netos.efectivoMenosGastos.toFixed(2)}`}
            color={netos.efectivoMenosGastos >= 0 ? '#2e7d32' : '#d32f2f'}
          />

          {/* Ventas Total - Gastos */}
          <ExpandableDataRow
            label="Ventas Total - Gastos"
            value={`$${netos.ventasMenosGastos.toFixed(2)}`}
            color={netos.ventasMenosGastos >= 0 ? '#2e7d32' : '#d32f2f'}
            bg={netos.ventasMenosGastos >= 0 ? '#e8f5e9' : '#ffebee'}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
```

---

## 📐 Cambios Necesarios

### 1. **reportTypes.ts** (+20 líneas)
```typescript
export interface GastoDetallado {
  id: number;
  monto: number;
  categoriaGastoNombre: string;
  descripcion: string;
  fecha: string;
}

export interface GastosPorCategoria {
  categoriaId?: number;
  categoriaNombre: string;
  totalGastos: number;
}
```

### 2. **useReportCalculations.ts** (+15 líneas)
```typescript
export function agruparGastosPorCategoria(
  gastos: GastoDetallado[]
): GastosPorCategoria[] {
  const agrupado = gastos.reduce((acc, gasto) => {
    const existente = acc.find(g => g.categoriaNombre === gasto.categoriaGastoNombre);
    if (existente) {
      existente.totalGastos += gasto.monto;
    } else {
      acc.push({
        categoriaNombre: gasto.categoriaGastoNombre,
        totalGastos: gasto.monto,
      });
    }
    return acc;
  }, [] as GastosPorCategoria[]);
  
  return agrupado.sort((a, b) => b.totalGastos - a.totalGastos);
}
```

### 3. **useReportData.ts** (+10 líneas)
```typescript
// Agregar carga de gastos
const gastosResponse = await apiService.get(
  `${API_ENDPOINTS.GASTOS_RANGO}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
);

return {
  // ... resto de datos
  gastosDetallados: gastosResponse.data || [],
};
```

### 4. **GeneralCutTab.tsx** (+60 líneas)
- Crear componente `ExpandableDataRow`
- Actualizar props para recibir `gastosDetallados`
- Usar componente en lugar de `DataRow` para gastos

### 5. **AdminReports.tsx** (+5 líneas)
- Pasar `gastosDetallados` a `GeneralCutTab`

---

## 🎯 Ventajas

✅ **Tabla sigue siendo minimalista** - Sin abarrotar información  
✅ **Acceso a detalles bajo demanda** - Click para expandir  
✅ **Mejor UX** - Progresión: Resumen → Detalles  
✅ **Mobile-friendly** - No hay scroll horizontal innecesario  
✅ **Elegante** - Triángulos ► ▼ para indicar expansión  
✅ **Escalable** - Se puede aplicar a otros datos (productos, etc)  

---

## 📊 Resultado Visual Final

### Contraído (Por defecto)
```
📅 Corte General
del 04 - al 04 diciembre

Total Ventas                    $1,450.00
Efectivo                        $1,345.00
Transferencia                   $105.00
Gastos                          -$106.00   ►
Ganancia Neta                   -$156.00
% Ganancia                      -10.76%
Efectivo - Gastos               -$261.00
Ventas Total - Gastos           -$156.00
```

### Con Gastos Expandidos
```
Total Ventas                    $1,450.00
Efectivo                        $1,345.00
Transferencia                   $105.00
Gastos                          -$106.00   ▼
  Salarios                       -$80.00
  Suministros                    -$20.00
  Servicios                       -$4.00
  Otros                           -$2.00
Ganancia Neta                   -$156.00
% Ganancia                      -10.76%
Efectivo - Gastos               -$261.00
Ventas Total - Gastos           -$156.00
```

---

## 🚀 Plan de Implementación (40 min)

1. ✅ Agregar tipos (reportTypes.ts) - 5 min
2. ✅ Agregar función (useReportCalculations) - 5 min
3. ✅ Cargar gastos (useReportData + AdminReports) - 10 min
4. ✅ Crear ExpandableDataRow (GeneralCutTab) - 15 min
5. ✅ Build y verificar - 5 min

**Total: ~40 minutos → Build exitoso**

---

## 📝 Medidas Finales

| Métrica | Valor |
|---------|-------|
| GeneralCutTab.tsx | 138 → ~200 líneas |
| ExpandableDataRow | Nuevo componente (30 líneas) |
| Build time | ~24-27s |
| Gzip size | ~283 kB (sin cambio) |
| **Status** | ✅ Listo para implementar |

---

## ✨ ¿Vamos?

Comenzamos:
1. ✅ Actualizar tipos
2. ✅ Agregar función de agrupación
3. ✅ Cargar datos de gastos
4. ✅ Crear componente ExpandableDataRow
5. ✅ Integrar en GeneralCutTab
6. ✅ Build exitoso

¿Confirmas? 🎯
