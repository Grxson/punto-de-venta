# Implementación: Registro Múltiple de Gastos

## 📋 Resumen

Se implementó un sistema para registrar múltiples gastos en una sola sesión de formulario. Los usuarios pueden:
- Establecer una fecha y método de pago comunes
- Agregar múltiples líneas de gasto (categoría, monto, proveedor, concepto)
- Visualizar una tabla de gastos pendientes
- Registrar todos juntos con un solo clic

## 🏗️ Cambios Implementados

### Frontend: `frontend-web/src/pages/pos/PosExpenses.tsx`

#### 1. **Nueva Interfaz `GastoPendiente`**
```typescript
interface GastoPendiente {
  tempId: string; // ID temporal único para esta sesión
  categoriaGastoId: number;
  proveedorId?: number;
  monto: number;
  nota?: string;
}
```

#### 2. **Reorganización de Estado**
**Antes:**
```typescript
const [categoriaGastoId, setCategoriaGastoId] = useState<number | ''>('');
const [proveedorId, setProveedorId] = useState<number | ''>('');
const [monto, setMonto] = useState<string>('');
const [fecha, setFecha] = useState<Date | null>(new Date());
const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');
const [referencia, setReferencia] = useState<string>('');
const [nota, setNota] = useState<string>('');
```

**Después:**
```typescript
// Campos comunes para todos los gastos
const [fecha, setFecha] = useState<Date | null>(new Date());
const [metodoPagoId, setMetodoPagoId] = useState<number | ''>('');

// Campos por-gasto (entrada temporal)
const [categoriaGastoId, setCategoriaGastoId] = useState<number | ''>('');
const [proveedorId, setProveedorId] = useState<number | ''>('');
const [monto, setMonto] = useState<string>('');
const [nota, setNota] = useState<string>('');
const [referencia, setReferencia] = useState<string>('');

// Gastos pendientes para registrar
const [gastosPendientes, setGastosPendientes] = useState<GastoPendiente[]>([]);
```

#### 3. **Nuevos Métodos de Negocio**

**`handleAgregarGasto()`**
- Valida que categoría y monto estén presentes
- Valida que monto sea > 0
- Crea objeto `GastoPendiente` con ID temporal único
- Agrega a array `gastosPendientes`
- Limpia campos por-gasto para siguiente entrada

```typescript
const handleAgregarGasto = () => {
  if (!categoriaGastoId || !monto || parseFloat(monto) <= 0) {
    setError('La categoría y el monto son obligatorios y el monto debe ser mayor a 0.');
    return;
  }

  const nuevoGasto: GastoPendiente = {
    tempId: `gasto-${Date.now()}-${Math.random()}`,
    categoriaGastoId: categoriaGastoId as number,
    proveedorId: proveedorId ? (proveedorId as number) : undefined,
    monto: parseFloat(monto),
    nota: nota || undefined,
  };

  setGastosPendientes([...gastosPendientes, nuevoGasto]);
  // Limpiar campos
  setCategoriaGastoId('');
  setProveedorId('');
  setMonto('');
  setNota('');
};
```

**`handleRemoverGasto(tempId)`**
- Elimina gasto de la lista usando `tempId`

```typescript
const handleRemoverGasto = (tempId: string) => {
  setGastosPendientes(gastosPendientes.filter(g => g.tempId !== tempId));
};
```

#### 4. **`handleSubmit()` Refactorizado**

**Lógica para múltiples gastos:**
```typescript
// Crear todos los gastos en paralelo
const requestsPromises = gastosPendientes.map((gasto) => {
  const request: CrearGastoRequest = {
    categoriaGastoId: gasto.categoriaGastoId,
    proveedorId: gasto.proveedorId,
    sucursalId: sucursalId,
    monto: gasto.monto,
    fecha: fecha ? fecha.toISOString() : undefined,
    metodoPagoId: metodoPagoId ? (metodoPagoId as number) : undefined,
    nota: gasto.nota,
  };
  return apiService.post(API_ENDPOINTS.GASTOS, request);
});

const responses = await Promise.all(requestsPromises);

// Verificar si todos fueron exitosos
const allSuccess = responses.every(r => r.success);
const failedCount = responses.filter(r => !r.success).length;

if (allSuccess) {
  setSuccessMessage(`${gastosPendientes.length} gasto(s) registrado(s) con éxito.`);
  handleCloseDialog();
  loadData();
} else {
  setError(`${failedCount} de ${gastosPendientes.length} gasto(s) fallaron. Revisa los datos.`);
}
```

#### 5. **Interfaz actualizada en el Dialog**

**Estructura:**
1. Encabezado: Campos comunes (fecha, método de pago) en caja destacada
2. Formulario: Campos por-gasto (categoría, monto, proveedor, concepto)
3. Botón "+": "Agregar Gasto" debajo del campo Proveedor
4. Tabla: Gastos pendientes con opción de eliminar
5. Footer: Botón "REGISTRAR (N)" con contador

**Visualización de tabla:**
```tsx
{!editingGasto && gastosPendientes.length > 0 && (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
      Gastos a Registrar ({gastosPendientes.length})
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell>Categoría</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Concepto</TableCell>
            <TableCell align="center">Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gastosPendientes.map((gasto) => (
            <TableRow key={gasto.tempId}>
              <TableCell>{categoria?.nombre}</TableCell>
              <TableCell align="right">${gasto.monto.toFixed(2)}</TableCell>
              <TableCell>{proveedor?.nombre || '-'}</TableCell>
              <TableCell>{gasto.nota || '-'}</TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoverGasto(gasto.tempId)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}
```

## 📊 Flujo de Datos

```
Usuario abre Dialog
    ↓
Selecciona Fecha y Método de Pago (comunes)
    ↓
Completa Categoría, Monto, Proveedor, Concepto (por-gasto)
    ↓
Toca "+" (handleAgregarGasto)
    ↓
Valida y agrega a gastosPendientes[]
    ↓
Limpia campos por-gasto
    ↓
Se muestra tabla con gasto agregado
    ↓
Repite para más gastos [Opcional]
    ↓
Toca "REGISTRAR (N)" (handleSubmit)
    ↓
Promise.all() crea N gastos en paralelo
    ↓
Cada gasto se registra en BD con fecha/metodoPagoId comunes
    ↓
Mensaje de éxito o error por gasto
```

## 🔄 Compatibilidad Hacia Atrás

**Modo Edición:** Al editar un gasto existente:
- Se desactiva el flujo de múltiples gastos
- Se muestra formulario completo (viejo)
- `handleSubmit()` detecta `editingGasto !== null` y ejecuta PUT

```typescript
if (editingGasto) {
  // Flujo antiguo: editar 1 gasto
  const response = await apiService.put(
    `${API_ENDPOINTS.GASTOS}/${editingGasto.id}`,
    request
  );
} else {
  // Flujo nuevo: múltiples gastos
  const responses = await Promise.all(requestsPromises);
}
```

## 🎯 Casos de Uso

### Caso 1: Registrar 3 gastos de hoy en efectivo
1. Toca "Registrar Gasto"
2. Selecciona hoy y "Efectivo"
3. Ingresa:
   - Categoría: Insumos, Monto: $150, Proveedor: La Bodega, Concepto: "Aceite"
4. Toca "+"
5. Ingresa:
   - Categoría: Servicios, Monto: $50, Proveedor: -, Concepto: "Internet"
6. Toca "+"
7. Ingresa:
   - Categoría: Utilidades, Monto: $200, Proveedor: CFEE, Concepto: "Luz"
8. Toca "+"
9. Toca "REGISTRAR (3)"
10. Recibe: "3 gasto(s) registrado(s) con éxito."

### Caso 2: Editar gasto existente
1. En tabla, toca icono "editar" en un gasto
2. Se abre Dialog en modo edición
3. Modifica campos
4. Toca "ACTUALIZAR"

## 🚀 Mejoras Futuras

1. **Eliminación masiva:** Opción para eliminar múltiples gastos de la tabla
2. **Plantillas:** Guardar combinaciones frecuentes (ej: "Insumos Diarios")
3. **Validaciones Avanzadas:** 
   - Validar presupuesto mensual por categoría
   - Alertar si gasto es inusualmente alto
4. **Importación:** Cargar gastos desde CSV/Excel
5. **Duplicación:** Botón para duplicar una línea (útil para gastos similares)
6. **Firma Digital:** Requerir firma para gastos > umbral

## 📝 Pruebas Manuales

### Prueba 1: Agregar y registrar 2 gastos
- ✅ Dialog abre sin errores
- ✅ Campos comunes visibles
- ✅ Botón "+" agrega fila correctamente
- ✅ Tabla muestra 2 gastos
- ✅ Eliminar funciona
- ✅ REGISTRAR (2) envía exitosamente
- ✅ Mensaje de éxito aparece
- ✅ Dialog cierra
- ✅ Tabla principal se actualiza

### Prueba 2: Validaciones
- ✅ No permite agregar sin categoría
- ✅ No permite monto <= 0
- ✅ No permite registrar sin gastos
- ✅ Error muestra correctamente

### Prueba 3: Edición de gasto existente
- ✅ Toque en "editar" abre Dialog en modo edición
- ✅ Campos se llenan con datos del gasto
- ✅ Botón "+" NO aparece
- ✅ Botón "ACTUALIZAR" funciona

## 🔧 Configuración

No requiere cambios en backend (usa endpoint POST existente).

Backend espera:
```json
{
  "categoriaGastoId": 1,
  "proveedorId": 2,
  "sucursalId": 5,
  "monto": 150.00,
  "fecha": "2025-12-02T00:00:00Z",
  "metodoPagoId": 3,
  "nota": "Aceite para cocina"
}
```

Cada gasto en lote lleva los mismos `fecha` y `metodoPagoId`.

---

**Implementado:** 2 de diciembre de 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** ✅ COMPLETADO

