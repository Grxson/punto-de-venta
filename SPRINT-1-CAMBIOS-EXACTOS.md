# 🛠️ CAMBIOS ESPECÍFICOS A REALIZAR - SPRINT 1

**Objetivo**: Implementar cantidad + precio en el flujo de compras  
**Archivos a modificar**: 2 (SeleccionarIngredientes.tsx, CompraForm.tsx)  
**Tiempo**: 3-4 horas

---

## ✅ ESTADO BACKEND (YA LISTO)

El backend **YA TIENE TODO**:

```java
✅ CompraItem.java:
   - cantidad: BigDecimal
   - precioUnitario: BigDecimal
   - subtotal: calculado automático

✅ CompraItemDTO.java:
   - cantidad: BigDecimal
   - precioUnitario: BigDecimal
   - subtotal: BigDecimal

✅ CompraService.crearCompra():
   - Guarda items con cantidad y precio
   - Calcula subtotal automático
   - Actualiza stock de ingredientes
```

**Solo falta**: El frontend mande estos datos.

---

## 📝 ARCHIVO 1: `SeleccionarIngredientes.tsx`

### ESTADO ACTUAL
El modal:
1. ✅ Crea ingrediente con factor
2. ❌ NO pide cantidad
3. ❌ NO pide precio
4. ❌ NO calcula subtotal
5. ❌ Devuelve ingredienteSeleccionado sin cantidad/precio

### CAMBIOS NECESARIOS

#### 1. Actualizar estado del componente (línea ~65-85)

**ANTES:**
```typescript
const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
const [cantidadIngrediente, setCantidadIngrediente] = useState<number>(1);
const [precioUnitario, setPrecioUnitario] = useState<number>(0);
```

**DESPUÉS** (agregar):
```typescript
const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);

// 🆕 Para los detalles de la COMPRA
const [compraDetalles, setCompraDetalles] = useState({
  cantidad: '',        // "30"
  precioUnitario: '',  // "9.00"
});
```

#### 2. Agregar nueva sección en JSX (DESPUÉS de crear ingrediente, ANTES del botón "Crear Ingrediente")

**Agregar ANTES del `</Dialog>` final:**

```tsx
{/* NUEVA SECCIÓN: DETALLES DE LA COMPRA */}
{ingredienteSeleccionado && (
  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
    <Box sx={{ fontWeight: 'bold', fontSize: '0.95rem', mb: 1.5, color: '#333' }}>
      📦 Detalles de esta compra:
    </Box>

    {/* Mostrar ingrediente seleccionado + factor */}
    <Box sx={{ fontSize: '0.85rem', color: '#666', mb: 2 }}>
      <strong>Ingrediente:</strong> {ingredienteSeleccionado.nombre}
      {ingredienteSeleccionado.factorConversion && (
        <Box sx={{ fontSize: '0.8rem', color: '#999', mt: 0.5 }}>
          ℹ️ Factor: {ingredienteSeleccionado.factorConversion}
        </Box>
      )}
    </Box>

    {/* Grid: Cantidad + Precio */}
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
      <TextField
        type="number"
        inputProps={{ step: '0.01', min: '0.01' }}
        placeholder="30"
        value={compraDetalles.cantidad}
        onChange={(e) =>
          setCompraDetalles((prev) => ({ ...prev, cantidad: e.target.value }))
        }
        size="small"
        label="Cantidad comprada"
        fullWidth
      />
      <TextField
        type="number"
        inputProps={{ step: '0.01', min: '0' }}
        placeholder="9.00"
        value={compraDetalles.precioUnitario}
        onChange={(e) =>
          setCompraDetalles((prev) => ({ ...prev, precioUnitario: e.target.value }))
        }
        size="small"
        label="Precio unitario"
        fullWidth
      />
    </Box>

    {/* Subtotal calculado */}
    {compraDetalles.cantidad && compraDetalles.precioUnitario && (
      <Box
        sx={{
          p: 1,
          backgroundColor: '#e8f5e9',
          borderRadius: 1,
          border: '1px solid #4caf50',
          mb: 2,
        }}
      >
        <Box sx={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: '600' }}>
          💰 Subtotal: ${(
            parseFloat(compraDetalles.cantidad) *
            parseFloat(compraDetalles.precioUnitario)
          ).toFixed(2)}
        </Box>
      </Box>
    )}

    {/* Helper text */}
    <Box sx={{ fontSize: '0.75rem', color: '#999' }}>
      Ejemplo: Compré 30 kg a $9.00/kg = $270
    </Box>
  </Box>
)}

{/* Actualizar DialogActions con 2 botones */}
<DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
  <Button
    onClick={() => {
      setAbrirDialogSeleccionar(false);
      setIngredienteSeleccionado(null);
      setCompraDetalles({ cantidad: '', precioUnitario: '' });
    }}
    variant="outlined"
  >
    Cancelar
  </Button>
  <Button
    onClick={handleAgregarIngredienteACompra}
    variant="contained"
    disabled={
      !ingredienteSeleccionado ||
      !compraDetalles.cantidad.trim() ||
      !compraDetalles.precioUnitario.trim()
    }
  >
    Agregar a Compra
  </Button>
</DialogActions>
```

#### 3. Nueva función: `handleAgregarIngredienteACompra()`

**Agregar después de `handleCrearIngrediente()`:**

```typescript
/**
 * Agregar ingrediente a la compra con cantidad y precio
 */
const handleAgregarIngredienteACompra = () => {
  if (!ingredienteSeleccionado) {
    setError('Selecciona un ingrediente');
    return;
  }

  if (!compraDetalles.cantidad.trim() || !compraDetalles.precioUnitario.trim()) {
    setError('Completa cantidad y precio');
    return;
  }

  const cantidad = parseFloat(compraDetalles.cantidad);
  const precioUnitario = parseFloat(compraDetalles.precioUnitario);

  // Esto es lo que se enviará al parent (CompraForm)
  onSeleccionar({
    ingredienteId: ingredienteSeleccionado.id as number,
    ingredienteNombre: ingredienteSeleccionado.nombre,
    unidadId: ingredienteSeleccionado.unidadBaseId as number,
    unidadNombre: ingredienteSeleccionado.unidadBaseNombre || '',
    unidadAbreviatura: ingredienteSeleccionado.unidadBaseAbreviatura || '',
    cantidad: cantidad,              // ← IMPORTANTE: Se envía ahora
    precioUnitario: precioUnitario,  // ← IMPORTANTE: Se envía ahora
  });

  // Resetear y cerrar
  setAbrirDialogSeleccionar(false);
  setIngredienteSeleccionado(null);
  setCompraDetalles({ cantidad: '', precioUnitario: '' });
  setError(null);
};
```

---

## 📝 ARCHIVO 2: `CompraForm.tsx`

### ESTADO ACTUAL
Muestra tabla básica sin cantidad ni precio.

### CAMBIOS NECESARIOS

#### 1. Actualizar la tabla de ingredientes (línea ~180-200 aprox)

**REEMPLAZAR la tabla actual con:**

```tsx
{ingredientes.length === 0 ? (
  <Alert severity="info">No hay ingredientes en esta compra. Agrega al menos uno.</Alert>
) : (
  <>
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
          <TableRow>
            <TableCell><strong>Ingrediente</strong></TableCell>
            <TableCell align="right"><strong>Cantidad</strong></TableCell>
            <TableCell align="center"><strong>Unidad</strong></TableCell>
            <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
            <TableCell align="right"><strong>Subtotal</strong></TableCell>
            <TableCell align="center" width={50}><strong>Acción</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ingredientes.map((item) => (
            <TableRow key={item.ingredienteId}>
              <TableCell>{item.ingredienteNombre}</TableCell>
              <TableCell align="right">{item.cantidad.toFixed(2)}</TableCell>
              <TableCell align="center">{item.unidadAbreviatura}</TableCell>
              <TableCell align="right">${item.precioUnitario.toFixed(2)}</TableCell>
              <TableCell align="right">
                ${(item.cantidad * item.precioUnitario).toFixed(2)}
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  color="error"
                  onClick={() => eliminarIngrediente(item.ingredienteId)}
                >
                  <Delete fontSize="small" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* TOTAL */}
    <Box
      sx={{
        p: 2,
        backgroundColor: '#f9f9f9',
        borderRadius: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        fontSize: '1.2rem',
        fontWeight: 'bold',
      }}
    >
      💰 Total Compra: $
      {ingredientes
        .reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
        .toFixed(2)}
    </Box>
  </>
)}
```

#### 2. Actualizar la función `handleGuardar()` (línea ~120-150 aprox)

**BUSCAR y REEMPLAZAR la sección `requestData`:**

**ANTES:**
```typescript
const requestData = {
  proveedorId: proveedorSeleccionado.id,
  fecha: `${fecha}T00:00:00`,
  items: ingredientes.map((i) => ({
    ingredienteId: i.ingredienteId,
    cantidad: i.cantidad,
    unidadId: i.unidadId,
    precioUnitario: i.precioUnitario,
  })),
  observaciones,
};
```

**DESPUÉS** (verifica que incluya los 4 campos):
```typescript
const requestData = {
  proveedorId: proveedorSeleccionado.id,
  fecha: `${fecha}T00:00:00`,
  items: ingredientes.map((i) => ({
    ingredienteId: i.ingredienteId,
    cantidad: i.cantidad,           // ← Debe estar
    unidadId: i.unidadId,
    precioUnitario: i.precioUnitario, // ← Debe estar
  })),
  observaciones,
};
```

---

## ✅ CHECKLIST DE CAMBIOS

### SeleccionarIngredientes.tsx
- [ ] Agregar estado `compraDetalles` con `cantidad` y `precioUnitario`
- [ ] Agregar nueva sección visible cuando `ingredienteSeleccionado !== null`
- [ ] 2 TextField: cantidad y precio unitario
- [ ] Mostrar subtotal calculado dinámicamente
- [ ] Nueva función `handleAgregarIngredienteACompra()`
- [ ] Botón "Agregar a Compra" que valida ambos campos
- [ ] `onSeleccionar()` recibe cantidad y precioUnitario

### CompraForm.tsx
- [ ] Tabla con columnas: Ingrediente, Cantidad, Unidad, Precio Unit., Subtotal, Acción
- [ ] Calcular subtotal por línea: `cantidad × precioUnitario`
- [ ] Mostrar total compra al pie de tabla
- [ ] Validar que `ingredientes.length > 0` antes de guardar
- [ ] `requestData.items` envía `cantidad` y `precioUnitario`

### Validaciones
- [ ] No permitir cantidad = 0 o vacío
- [ ] No permitir precio negativo
- [ ] Total compra > 0
- [ ] Mensaje de error claro si faltan campos

---

## 🧪 TEST MANUAL (Después de cambios)

### Test 1: Crear compra simple
```
1. Ir a http://localhost:5173/admin/compras
2. Nuevo → Proveedor: "Frutas México"
3. Agregar Ingrediente:
   ├─ Busca "Naranja Fresca"
   ├─ Cantidad: [30]
   ├─ Precio: [$9.00]
   ├─ Verifica subtotal: $270.00 ✅
   └─ Click "Agregar a Compra"
4. Tabla muestra: Naranja | 30 | kg | $9.00 | $270.00
5. Total: $270.00
6. Guardar
7. Verificar en BD:
   SELECT * FROM compra_items WHERE compra_id = (SELECT MAX(id) FROM compras);
   ✅ Debe mostrar: cantidad=30, precio_unitario=9.00, subtotal=270.00
```

### Test 2: Crear compra con múltiples ingredientes
```
1. Nueva Compra
2. Agregar:
   ├─ Naranja: 30 kg @ $9.00
   ├─ Vaso: 500 pza @ $1.04
   └─ Tapa: 500 pza @ $0.60
3. Tabla:
   ├─ Naranja | 30 | kg | $9.00 | $270.00
   ├─ Vaso | 500 | pza | $1.04 | $520.00
   └─ Tapa | 500 | pza | $0.60 | $300.00
4. Total: $1,090.00 ✅
5. Guardar + Verificar BD
```

### Test 3: Crear ingrediente con factor + usar en compra
```
1. Modal Agregar Ingrediente
2. Crear nuevo:
   ├─ Nombre: "Jugo de Naranja"
   ├─ Unidad: litro
   ├─ Factor: 1 kg = 500 ml ✅
   └─ Click "Crear Ingrediente"
3. Aparece en modal para seleccionar
4. Cantidad: 10, Precio: $5.00
5. Click "Agregar a Compra"
6. BD verifica: ingredientes.factor_conversion = "1 kg = 500 ml" ✅
```

---

## 🎯 RESULTADO ESPERADO

### Antes (ahora):
```
Modal: Crea ingrediente, pero no pregunta cuánto se compró ❌
Compra: Se crea sin cantidad/precio ❌
BD: compra_items.cantidad = NULL ❌
```

### Después (Sprint 1 completado):
```
Modal: 
├─ Crea ingrediente ✅
└─ Pide cantidad + precio ✅

Tabla CompraForm:
├─ Muestra ingrediente ✅
├─ Muestra cantidad ✅
├─ Muestra precio ✅
├─ Calcula subtotal ✅
└─ Suma total ✅

BD:
├─ compra_items.cantidad = 30 ✅
├─ compra_items.precio_unitario = 9.00 ✅
├─ compra_items.subtotal = 270.00 ✅
└─ Permite calcular costo de recetas ✅
```

---

## 📊 IMPACTO FINAL

**Capacidades desbloqueadas:**
1. ✅ Saber exactamente qué costo unitario tiene cada ingrediente
2. ✅ Crear recetas con costo calculado automáticamente
3. ✅ Descontar stock en ventas (próxima fase)
4. ✅ Reportes precisos de costo vs ingresos
5. ✅ Análisis de margen de ganancia por producto

**Ejemplo:**
```
Compra hoy: 30 kg Naranja @ $9.00/kg = $270.00 ✅
Receta mañana: Jugo Medio = 0.5 kg Naranja = $4.50 ✅
Venta: 100 unidades = 50 kg = $450 en naranja ✅
Ingresos: 100 × $36.50 = $3,650 ✅
Ganancia neta: $3,650 - $450 (otros) = $3,200 ✅
```

---

