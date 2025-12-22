# 📦 Análisis: Módulo de Compras - QUÉ LE FALTA

## 1. ESTADO ACTUAL ✅

El sistema **SÍ registra correctamente el precio total** de la compra en:
- ✅ `CompraForm.tsx`: Calcula `totalCompra = ingredientes.reduce(...precioTotal)`
- ✅ `SeleccionarIngredientes.tsx`: Permite ingresar `precioTotal` por ingrediente
- ✅ Backend DTO: `CrearCompraRequest` incluye `precioTotal` por item
- ✅ Mostrar total: Card con "Total Compra: $X.XX"

---

## 2. LO QUE LE FALTA ❌

### A. **MOSTRAR EL PRECIO TOTAL ANTES DE CONFIRMAR** (Crítico)

**Problema:**
- El modal `SeleccionarIngredientes` no muestra un subtotal de la compra mientras se está armando
- El usuario agrega ingredientes a ciegas sin ver cuánto va a gastar

**Solución:**
Agregar a `SeleccionarIngredientes.tsx`:
```tsx
// Al final de la tabla de ingredientes seleccionados
<Box sx={{ p: 2, backgroundColor: '#f9f9f9', fontWeight: 'bold', fontSize: '1.1rem' }}>
  Total parcial: ${ingredientesSeleccionados.reduce((sum, i) => sum + i.precioTotal, 0).toFixed(2)}
</Box>
```

---

### B. **EDITAR PRECIO TOTAL DE UN INGREDIENTE YA AGREGADO** (Crítico)

**Problema:**
- Una vez agregado un ingrediente, **NO se puede editar** su `precioTotal`
- Si te equivocaste en el precio, tienes que eliminarlo y volver a agregarlo

**Solución:**
En la tabla de `ingredientesSeleccionados` en `SeleccionarIngredientes.tsx`:
```tsx
<TableCell>
  <TextField
    type="number"
    size="small"
    value={item.precioTotal}
    onChange={(e) => {
      const nuevos = [...ingredientesSeleccionados];
      nuevos[index].precioTotal = parseFloat(e.target.value) || 0;
      setIngredientesSeleccionados(nuevos);
    }}
    inputProps={{ step: '0.01' }}
  />
</TableCell>
```

---

### C. **CALCULAR PRECIO UNITARIO AUTOMÁTICAMENTE** (Mejora)

**Problema:**
- El usuario ingresa `precioTotal` pero no sabe qué `precioUnitario` es
- En la tabla final se calcula: `precioTotal / cantidad` pero es solo display

**Solución:**
Agregar campos en `SeleccionarIngredientes.tsx`:
```tsx
const [precioUnitario, setPrecioUnitario] = useState<number>(0);

// Cuando cambia cantidad o precioUnitario, recalcular precioTotal
useEffect(() => {
  setPrecioTotal(cantidad * precioUnitario);
}, [cantidad, precioUnitario]);

// En el formulario de agregación:
<TextField
  label="Precio Unitario"
  type="number"
  value={precioUnitario}
  onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
  inputProps={{ step: '0.01' }}
/>
```

---

### D. **NO GENERA INGREDIENTES AUTOMÁTICAMENTE** (Falta lógica de negocio)

**Problema actual:**
- Creas una compra (ej: 1 kg de harina por $50)
- **NO se crea automáticamente** que tienes 1 kg de harina en inventario
- No hay relación entre "Compra registrada" → "Ingrediente disponible en cocina"

**Pregunta clave:**
¿Cómo debería funcionar?

**Opción 1: Automático inmediato**
```
Usuario confirma compra
  ↓
Backend recibe compra + ingredientes
  ↓
Backend crea automáticamente movimiento de inventario
  ↓
Ingrediente aparece en AdminIngredientes con cantidad inicial
```

**Opción 2: Confirmación en dos pasos**
```
Paso 1: Registrar Compra (estado: "pendiente")
  ↓
Paso 2: "Recibir Compra" (cuando llega el delivery)
  ↓
Recién ahí se genera el inventario
```

**Opción 3: Semi-automático**
```
Registrar compra (estado: "recibida")
  ↓
Modal de confirmación: "¿Registrar X kg de harina en inventario?"
  ↓
Genera automáticamente si el usuario confirma
```

---

### E. **FALTA ESTADO DE COMPRA** (Importante)

**Problema:**
- Las compras NO tienen estado visible en `CompraForm`
- Backend tiene: `'pendiente' | 'recibida' | 'cancelada' | 'rechazada'`
- Pero el formulario **no permite cambiar el estado**

**Solución:**
Agregar en `CompraForm.tsx`:
```tsx
<FormControl fullWidth size="small">
  <InputLabel>Estado</InputLabel>
  <Select
    value={estado}
    onChange={(e) => setEstado(e.target.value)}
    label="Estado"
  >
    <MenuItem value="pendiente">Pendiente</MenuItem>
    <MenuItem value="recibida">Recibida</MenuItem>
    <MenuItem value="cancelada">Cancelada</MenuItem>
    <MenuItem value="rechazada">Rechazada</MenuItem>
  </Select>
</FormControl>
```

---

### F. **FALTA NÚMERO DE FACTURA** (Buena práctica)

**Problema:**
- Backend soporta `numeroFactura` pero el formulario no lo captura
- Sin factura no hay forma de auditar la compra

**Solución:**
Agregar en `CompraForm.tsx`:
```tsx
<TextField
  label="Número de Factura"
  placeholder="Ej: INV-2025-0001"
  value={numeroFactura}
  onChange={(e) => setNumeroFactura(e.target.value)}
  fullWidth
/>
```

---

## 3. FLUJO PROPUESTO (RECOMENDACIÓN) 🚀

### **Flujo de Compra Completo:**

```
1. NUEVA COMPRA
   ├─ Seleccionar proveedor
   ├─ Fecha de compra
   ├─ Agregar ingredientes (con precios)
   │  ├─ Ver subtotal mientras agregas
   │  ├─ Poder editar precios antes de confirmar
   │  └─ Calcular precios unitarios automáticamente
   ├─ Número de factura (opcional)
   ├─ Observaciones
   └─ Crear → Estado: "pendiente"

2. RECIBIR COMPRA (Nuevo flujo)
   ├─ Listar compras en estado "pendiente"
   ├─ Seleccionar una compra
   ├─ Confirmar: "Marcar como recibida"
   │  └─ Genera automáticamente:
   │     ├─ Movimiento de inventario (entrada)
   │     ├─ Disponibilidad de ingredientes en cocina
   │     └─ Se registra fecha/hora de recepción
   └─ Compra pasa a estado "recibida"

3. EDITABILIDAD
   ├─ Compra "pendiente" → Editable (cambiar ingredientes/precios)
   ├─ Compra "recibida" → Ver only (generó inventario)
   └─ Compra "cancelada/rechazada" → Ver only
```

---

## 4. PRIORIDAD DE IMPLEMENTACIÓN 🎯

| Prioridad | Tarea | Dificultad | Tiempo |
|-----------|-------|-----------|--------|
| 🔴 **CRÍTICA** | Mostrar subtotal mientras agregas ingredientes | Baja | 15 min |
| 🔴 **CRÍTICA** | Permitir editar `precioTotal` de ingredientes agregados | Media | 20 min |
| 🟠 **ALTA** | Generar inventario automático al confirmar compra | Alta | 2-3 horas |
| 🟠 **ALTA** | Campo de estado en el formulario | Baja | 15 min |
| 🟡 **MEDIA** | Campo de número de factura | Baja | 10 min |
| 🟡 **MEDIA** | Calcular precio unitario automáticamente | Media | 20 min |

---

## 5. DIAGRAMA DE ESTADO ⚙️

```
┌─────────────────────────────────────────────────────────┐
│                    COMPRA CREADA                        │
│                  Estado: PENDIENTE                      │
│                                                         │
│  [EDITAR]           [RECIBIR]          [CANCELAR]      │
│     ↓                   ↓                   ↓           │
│  Editar datos       Llega el      Rechazar compra      │
│  Cambiar precios    delivery              ↓            │
│     ↓                   ↓            Estado:CANCELADA   │
│  PENDIENTE      RECIBIDA                               │
│                   ↓                                     │
│            [Generar inventario]                        │
│            [Marcar ingredientes                        │
│             como disponibles]                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. CÓDIGO ACTUAL VS PROPUESTO 📝

### Actual (CompraForm):
```tsx
const totalCompra = ingredientes.reduce((sum, item) => sum + item.precioTotal, 0);

// Solo muestra al final
<Box>Total Compra: ${totalCompra.toFixed(2)}</Box>
```

### Propuesto (SeleccionarIngredientes):
```tsx
const totalParcial = ingredientesSeleccionados.reduce((sum, item) => sum + item.precioTotal, 0);

// En tiempo real
<Card sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
  <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
    Total parcial: ${totalParcial.toFixed(2)}
  </Box>
  <Box sx={{ fontSize: '0.9rem', color: '#666' }}>
    {ingredientesSeleccionados.length} ingredientes
  </Box>
</Card>

// Y tabla editable
<TableBody>
  {ingredientesSeleccionados.map((item, idx) => (
    <TableRow key={idx}>
      <TableCell>{item.ingredienteNombre}</TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={item.cantidad}
          onChange={(e) => {
            const nuevos = [...ingredientesSeleccionados];
            nuevos[idx].cantidad = parseFloat(e.target.value) || 0;
            setIngredientesSeleccionados(nuevos);
          }}
        />
      </TableCell>
      <TableCell>{item.unidadAbreviatura}</TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={item.precioTotal}
          onChange={(e) => {
            const nuevos = [...ingredientesSeleccionados];
            nuevos[idx].precioTotal = parseFloat(e.target.value) || 0;
            setIngredientesSeleccionados(nuevos);
          }}
          inputProps={{ step: '0.01' }}
        />
      </TableCell>
      <TableCell align="right">
        ${(item.precioTotal / item.cantidad).toFixed(2)}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

## 7. PRÓXIMOS PASOS RECOMENDADOS 🚀

1. **Implementar lo CRÍTICO primero** (subtotal + editable)
2. **Crear endpoint de "recibir compra"** en backend
3. **Agregar pantalla de recepción** de compras
4. **Generar inventario automáticamente** al recibir
5. **Auditar el flujo completo** (compra → inventario → recetas)

---

## 8. CONCLUSIÓN

**El sistema registra precios correctamente, pero tiene problemas de UX:**
- ❌ No ves el total mientras agregas
- ❌ No puedes corregir precios sin eliminar
- ❌ No genera inventario automáticamente
- ❌ Falta estado visible
- ❌ Falta número de factura

**Con los cambios propuestos el flujo será:**
✅ Compra registrada → Inventario generado → Ingredientes disponibles para recetas
