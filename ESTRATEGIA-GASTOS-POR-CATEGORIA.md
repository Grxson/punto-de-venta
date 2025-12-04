# 🎯 NUEVA ESTRATEGIA: Ver Gastos por Categoría

## 📊 Lo que el usuario quiere

"Además de cuánto dinero estamos ganando/perdiendo, quiero ver **en qué se gastó ese dinero**"

Es decir:
```
Corte General
├── Total Ventas: $1,450.00
├── Gastos TOTAL: -$106.00  ← Lo que ya hay
│
└── 📋 DESGLOSE DE GASTOS:
    ├── Salarios: -$80.00      ← NUEVO: Ver por categoría
    ├── Suministros: -$20.00   ← NUEVO
    └── Otros: -$6.00          ← NUEVO
```

---

## 🏗️ Plan Completo (OPCIÓN 4 MEJORADA)

### Estructura Final

```
📅 CORTE DE CAJA
del 04 de diciembre - al 04 de diciembre

╔════════════════════════════════════════╗
║ RESUMEN EJECUTIVO                      ║
╚════════════════════════════════════════╝

Total Ventas                    $1,450.00  [Verde]
├── Efectivo                    $1,345.00
├── Transferencia               $105.00

Gastos TOTAL                    -$106.00   [Amarillo]

Ganancia Neta                   -$156.00   [Rojo]
% Ganancia                      -10.76%    [Rojo]

Efectivo - Gastos               -$261.00
Ventas Total - Gastos           -$156.00

╔════════════════════════════════════════╗
║ ▼ DESGLOSE DE GASTOS (Nuevo Acordeón)  ║
╚════════════════════════════════════════╝

Salarios                        -$80.00
Suministros                     -$20.00
Servicios                       -$4.00
Otros                           -$2.00

────────────────────────────────────────
Total Gastos                    -$106.00

╔════════════════════════════════════════╗
║ ▶ DETALLES POR PRODUCTO               ║
╚════════════════════════════════════════╝

Verde Mediano       26  ×  $40.00  = $1,040.00
Naranja Mediano     23  ×  $40.00  = $920.00
...
```

---

## 🔧 Cambios Técnicos Necesarios

### Frontend - NUEVA INTERFAZ

#### 1. **Actualizar reportTypes.ts**

```typescript
// Agregar tipo para gastos por categoría
export interface GastosPorCategoria {
  categoriaId: number;
  categoriaNombre: string;
  totalGastos: number;
}

export interface GastoDetallado {
  id: number;
  categoriaGastoNombre: string;
  monto: number;
  descripcion: string;
  fecha: string;
}
```

#### 2. **Actualizar useReportCalculations.ts**

```typescript
// Agregar función para agrupar gastos por categoría
export function agruparGastosPorCategoria(gastos: GastoDetallado[]): GastosPorCategoria[] {
  const agrupado = gastos.reduce((acc, gasto) => {
    const categoria = acc.find(g => g.categoriaNombre === gasto.categoriaGastoNombre);
    if (categoria) {
      categoria.totalGastos += gasto.monto;
    } else {
      acc.push({
        categoriaId: gasto.id,
        categoriaNombre: gasto.categoriaGastoNombre,
        totalGastos: gasto.monto,
      });
    }
    return acc;
  }, [] as GastosPorCategoria[]);
  
  return agrupado.sort((a, b) => b.totalGastos - a.totalGastos);
}
```

#### 3. **Actualizar useReportData.ts**

```typescript
// Agregar carga de gastos detallados
async function loadGastos(desdeISO: string, hastaISO: string) {
  return await apiService.get(
    `/api/finanzas/gastos/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
  );
}
```

#### 4. **Actualizar GeneralCutTab.tsx**

```tsx
// Agregar:
// - Estado para gastos detallados
// - Nuevo Acordeón "Desglose de Gastos"
// - Mapeo de categorías de gastos

export interface GeneralCutTabProps {
  ventas: VentaDetalle[];
  gastosDia: number;
  dateRange: { desde: string; hasta: string };
  gastosDetallados?: GastoDetallado[];  // ← NUEVO
}
```

---

## 📋 IMPLEMENTACIÓN PASO A PASO

### FASE 1: Backend Verificación (YA EXISTE)

✅ Endpoint `/api/finanzas/gastos/rango` - Ya existe
✅ GastoDTO con categoría - Ya existe
✅ Búsqueda por rango de fechas - Ya existe

**No hay cambios en backend** (reutilizamos lo que existe)

### FASE 2: Frontend - Actualizar Tipos (10 min)

1. Agregar interfaces en `reportTypes.ts`
2. Verificar que `GastoDTO` tiene `categoriaGastoNombre`

### FASE 3: Frontend - Actualizar Hooks (15 min)

1. Agregar función `agruparGastosPorCategoria` en `useReportCalculations`
2. Cargar gastos en `useReportData` desde `/api/finanzas/gastos/rango`

### FASE 4: Frontend - Actualizar Componente (25 min)

1. Actualizar props de `GeneralCutTab`
2. Recibir `gastosDetallados` del padre
3. Agregar nuevo Acordeón "Desglose de Gastos"
4. Mapear gastos por categoría

### FASE 5: Frontend - Integrar en AdminReports (10 min)

1. Cargar gastos detallados en `useEffect`
2. Pasar `gastosDetallados` a `GeneralCutTab`
3. Build y verificar

---

## 🎨 Vista del Acordeón de Gastos

```tsx
{/* Acordeón: Desglose de Gastos */}
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      💰 DESGLOSE DE GASTOS
    </Typography>
  </AccordionSummary>
  <AccordionDetails>
    <Box>
      {gastosPorCategoria.map((gasto) => (
        <Box
          key={gasto.categoriaId}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 0.75,
            px: 1.5,
            borderBottom: 1,
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="body2">{gasto.categoriaNombre}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            -${gasto.totalGastos.toFixed(2)}
          </Typography>
        </Box>
      ))}
      
      {/* Total de gastos */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          py: 0.75,
          px: 1.5,
          backgroundColor: '#fff3cd',
          fontWeight: 700,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
          Total Gastos
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
          -${gastosDetallados.reduce((sum, g) => sum + g.monto, 0).toFixed(2)}
        </Typography>
      </Box>
    </Box>
  </AccordionDetails>
</Accordion>
```

---

## 📐 Medidas Finales

| Componente | Cambio |
|-----------|--------|
| reportTypes.ts | +20 líneas (nuevas interfaces) |
| useReportCalculations.ts | +15 líneas (función agrupar) |
| useReportData.ts | +10 líneas (cargar gastos) |
| GeneralCutTab.tsx | +50 líneas (acordeón de gastos) |
| AdminReports.tsx | +5 líneas (pasar props) |
| **Total** | **+100 líneas (~1 hora)** |

---

## 🎯 Resultado Final

### GeneralCutTab tendrá:

1. ✅ **Resumen Ejecutivo** (18 líneas) - Lo que ya existe
2. ✅ **Desglose de Gastos** (45 líneas) - NUEVO - Por categoría
3. ✅ **Detalles por Producto** (25 líneas) - Acordeón colapsable
4. ✅ **Botón Generar Corte** (5 líneas) - Opcional

**Total: ~190 líneas** (vs 138 actuales sin gastos)

---

## ✨ Ventajas

✅ Usuario ve exactamente dónde se fue el dinero  
✅ Identificar categorías de gasto alto/bajo  
✅ Facilita auditoría y análisis  
✅ Usa datos que YA existen en backend  
✅ Sin cambios en backend  
✅ Modular y escalable  

---

## 🚀 ¿Vamos con esto?

**Plan resumido**:
1. Actualizar tipos (reportTypes.ts) - 5 min
2. Agregar función agrupar (useReportCalculations) - 5 min
3. Cargar datos (useReportData + AdminReports) - 10 min
4. Crear acordeón (GeneralCutTab) - 20 min
5. Build y verificar - 5 min

**Total: ~45 minutos → Build exitoso**

¿Confirmamos? 🎯
