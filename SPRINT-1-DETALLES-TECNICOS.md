# 🛠️ IMPLEMENTACIÓN SPRINT 1: DETALLES TÉCNICOS

**Objetivo**: Hacer que `CompraForm` registre correctamente cantidad y precio por ingrediente  
**Tiempo estimado**: 3-4 horas  
**Archivos a modificar**: CompraForm.tsx, SeleccionarIngredientes.tsx

---

## 📋 PASO 1: ESTRUCTURA DE DATOS (Frontend State)

### Actualizar interfaz `IngredienteSeleccionado` en CompraForm.tsx

**Actual:**
```typescript
interface IngredienteSeleccionado {
  ingredienteId: number;
  ingredienteNombre: string;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  cantidad: number;              // ← YA EXISTE
  precioUnitario: number;        // ← YA EXISTE
}
```

**Verificación**: ¿Tiene estos campos? Si sí, está bien.

---

## 📋 PASO 2: MODAL DE SELECCIÓN - REDISEÑAR `SeleccionarIngredientes.tsx`

### Cambio de flujo:

**ANTES (actual - INCOMPLETO):**
```
Usuario click "Agregar Ingrediente"
    ↓
Abre modal
    ├─ Busca ingrediente existente O Crea uno nuevo
    └─ Click "Agregar" → Se agrega a compra
    ↑ FALTA: No pregunta CANTIDAD ni PRECIO
```

**DESPUÉS (nuevo - COMPLETO):**
```
Usuario click "Agregar Ingrediente"
    ↓
Abre modal
    ├─ SECCIÓN 1: Seleccionar/Crear ingrediente
    │  ├─ Busca "Naranja" en autocomplete
    │  └─ Si no existe → Abre formulario de creación
    │     ├─ Nombre, Unidad, Factor
    │     └─ Click "Crear Ingrediente"
    │
    ├─ SECCIÓN 2: Detalles de la COMPRA de ese ingrediente
    │  ├─ ¿Cuánto compré? [30] (cantidad)
    │  ├─ ¿Unidad? [kg] (readonly, de ingrediente)
    │  ├─ ¿A qué precio? [$9.00] (precioUnitario)
    │  └─ Subtotal: 30 × $9.00 = $270
    │
    └─ Click "Agregar a Compra" → onSeleccionar()
```

---

## 🎨 DISEÑO DEL MODAL NUEVO

```
┌─────────────────────────────────────────────────────────────┐
│  AGREGAR INGREDIENTE A COMPRA                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SECCIÓN 1: SELECCIONAR INGREDIENTE                        │
│  ─────────────────────────────────────────────────         │
│  📝 Buscar ingrediente:                                   │
│  [████████ Naranja ▼]  ← Autocomplete                    │
│  (Si no aparece, scroll o escribe para crear)             │
│                                                             │
│  ─────────────────────────────────────────────────         │
│  ℹ️  Si deseas crear uno nuevo:                           │
│  [+ Crear Nuevo Ingrediente]  ← Expandible               │
│                                                             │
│                                                             │
│  SECCIÓN 2: DETALLES DE LA COMPRA                         │
│  ─────────────────────────────────────────────────         │
│  (Solo visible si ya seleccionó ingrediente)              │
│                                                             │
│  📊 Ingrediente seleccionado: Naranja Fresca             │
│  ℹ️  Factor: 1 kg = 500 ml                               │
│                                                             │
│  📦 Cantidad comprada:    [30      ]  kg                  │
│  💰 Precio unitario:      [$9.00  ]  $/kg                │
│                                                             │
│  ════════════════════════════════════════                 │
│  💵 Subtotal: $270.00                                    │
│                                                             │
│                                                             │
│  BOTONES:                                                │
│  [Cancelar]                [Agregar a Compra]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 IMPLEMENTACIÓN: Pseudocódigo

### Estado del componente:

```typescript
const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
const [detallesCompra, setDetallesCompra] = useState({
  cantidad: '',        // "30"
  precioUnitario: '',  // "9.00"
});

// Para ver Sección 2 (detalles compra)
const mostrarSeccion2 = ingredienteSeleccionado !== null;
```

### Flujo de selección:

```typescript
// Cuando selecciona un ingrediente (del autocomplete o después de crear)
const handleSeleccionarIngrediente = (ingrediente: Ingrediente) => {
  setIngredienteSeleccionado(ingrediente);
  setDetallesCompra({ cantidad: '', precioUnitario: '' }); // Reset campos
};

// Cuando hace click en "Agregar a Compra"
const handleAgregarACompra = () => {
  if (!ingredienteSeleccionado) return;
  if (!detallesCompra.cantidad.trim() || !detallesCompra.precioUnitario.trim()) {
    setError('Completa cantidad y precio');
    return;
  }

  const cantidad = parseFloat(detallesCompra.cantidad);
  const precioUnitario = parseFloat(detallesCompra.precioUnitario);
  
  // Esto es lo que se ENV A COMPRAFORM
  onSeleccionar({
    ingredienteId: ingredienteSeleccionado.id,
    ingredienteNombre: ingredienteSeleccionado.nombre,
    unidadId: ingredienteSeleccionado.unidadBaseId,
    unidadNombre: ingredienteSeleccionado.unidadBaseNombre,
    unidadAbreviatura: ingredienteSeleccionado.unidadBaseAbreviatura,
    cantidad: cantidad,              // ← IMPORTANTE
    precioUnitario: precioUnitario,  // ← IMPORTANTE
  });

  // Reset y cierra modal
  setAbrirDialogSeleccionar(false);
  setIngredienteSeleccionado(null);
  setDetallesCompra({ cantidad: '', precioUnitario: '' });
};
```

---

## 📊 PASO 3: TABLA EN `CompraForm.tsx`

### Mostrar lo que se agregó:

```typescript
// Dentro del Card de Ingredientes, después del botón "Agregar":

{ingredientes.length === 0 ? (
  <Alert severity="info">No hay ingredientes en esta compra. Agrega al menos uno.</Alert>
) : (
  <>
    <TableContainer component={Paper}>
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
      Total Compra: $
      {ingredientes
        .reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0)
        .toFixed(2)}
    </Box>
  </>
)}
```

---

## 🔗 PASO 4: INTEGRACIÓN CON BACKEND

### Request que se enviará:

```typescript
// En CompraForm.handleGuardar():

const requestData = {
  proveedorId: proveedorSeleccionado.id,
  fecha: `${fecha}T00:00:00`,
  items: ingredientes.map((i) => ({
    ingredienteId: i.ingredienteId,
    cantidad: i.cantidad,                    // ← IMPORTANTE
    unidadId: i.unidadId,
    precioUnitario: i.precioUnitario,        // ← IMPORTANTE
  })),
  observaciones,
};

await comprasService.crear(requestData);
```

### Backend recibe (CompraController):

```java
@PostMapping
public ResponseEntity<CompraDTO> crear(@Valid @RequestBody CrearCompraRequest request) {
  // request.items contiene:
  // - ingredienteId
  // - cantidad
  // - unidadId
  // - precioUnitario
  CompraDTO creada = compraService.crear(request);
  return ResponseEntity.status(HttpStatus.CREATED).body(creada);
}
```

### Service guarda en BD:

```java
for (CompraItemRequest itemReq : request.items()) {
  CompraItem item = new CompraItem();
  item.setIngrediente(...);
  item.setCantidad(itemReq.cantidad());           // ← GUARDA
  item.setUnidad(...);
  item.setPrecioUnitario(itemReq.precioUnitario()); // ← GUARDA
  item.setSubtotal(
    itemReq.cantidad().multiply(new BigDecimal(itemReq.precioUnitario()))
  );
  compraItemRepository.save(item);
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend:

- [ ] `SeleccionarIngredientes.tsx`:
  - [ ] Estado: `detallesCompra` con `cantidad` y `precioUnitario`
  - [ ] Sección 2 visible solo si ingrediente seleccionado
  - [ ] TextField cantidad con `type="number"`
  - [ ] TextField precio unitario con `type="number"`
  - [ ] Subtotal calculado dinámicamente
  - [ ] Validación: ambos campos required
  - [ ] `onSeleccionar()` incluye `cantidad` y `precioUnitario`

- [ ] `CompraForm.tsx`:
  - [ ] Tabla con columnas: Ingrediente, Cantidad, Unidad, Precio Unit., Subtotal, Acción
  - [ ] Botón "Eliminar" funcional
  - [ ] Total calculado correctamente
  - [ ] `handleGuardar()` envía `cantidad` y `precioUnitario` al backend

### Backend:

- [ ] `CompraItem.java`: Tiene `cantidad` y `precioUnitario`
- [ ] `CompraItemDTO.java`: Tiene `cantidad` y `precioUnitario`
- [ ] `CompraService.crear()`: Guarda correctamente
- [ ] BD: Tabla `compra_items` tiene columnas `cantidad` y `precio_unitario`

### Testing:

- [ ] Test 1: Crear compra sin ingredientes → Error
- [ ] Test 2: Crear compra con 1 ingrediente → OK, total correcto
- [ ] Test 3: Crear compra con 3 ingredientes → OK, suma correcta
- [ ] Test 4: Verificar BD: `SELECT * FROM compra_items WHERE compra_id = 1`
- [ ] Test 5: GET `/api/compras/1` devuelve items con precio

---

## 🚀 COMANDO PARA TESTEAR

```bash
# 1. Iniciar backend
cd backend && ./start.sh

# 2. En otra terminal, iniciar frontend
cd frontend-web && npm start

# 3. En navegador, ir a http://localhost:5173/admin/compras

# 4. Nueva compra:
#    - Proveedor: cualquiera
#    - Fecha: hoy
#    - Agregar Ingrediente:
#      ├─ Busca "Naranja" (o crea si no existe)
#      ├─ Cantidad: 30
#      ├─ Precio: 9.00
#      └─ Agregar a compra
#    - Guardar compra

# 5. Verificar en BD:
#    docker exec postgres psql -U punto_dev -d punto_venta -c \
#      "SELECT id, ingrediente_id, cantidad, precio_unitario FROM compra_items"
```

---

## 📝 RESUMEN

La clave es que el modal debe permitir capturar **cantidad** y **precio unitario** DESPUÉS de seleccionar el ingrediente, no ANTES. Esto permite:

1. ✅ Crear el ingrediente una sola vez (reusable)
2. ✅ Usar ese ingrediente en múltiples compras
3. ✅ Registrar el precio de CADA compra (historial)
4. ✅ Calcular subtotales correctamente

Así, cuando después crees una RECETA, el sistema sabrá:
- Ingrediente "Naranja" cuesta $9.00/kg (de esta compra)
- Si usas 0.5 kg en receta → $4.50 por unidad
- Si vendes 100 unidades → gasta 50 kg → $450 en naranja

---

