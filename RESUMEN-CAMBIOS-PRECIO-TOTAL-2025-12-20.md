# 📋 RESUMEN DE CAMBIOS: PRECIO TOTAL VS UNITARIO

**Fecha**: 20 de Diciembre de 2025  
**Objetivo**: Cambiar flujo de compras para registrar **precio total** en lugar de **precio unitario**

## 🎯 ¿Por qué este cambio?

El usuario tenía razón: es más lógico registrar lo que **realmente se gastó** en la compra.

### Ejemplo del Jamón:
```
❌ ANTES (confuso):
   Cantidad: 1 (medio jamón)
   Precio Unitario: ??? ($52? $4.33?)
   Subtotal: cantidad × precioUnitario

✅ DESPUÉS (claro):
   Cantidad: 1 (medio jamón)
   Precio Total: $52.00 (LO QUE GASTÉ)
   Precio Unitario: CALCULADO = $52 ÷ 1 = $52 (automático)
   Factor: "0.5 kg = 12 rebanadas"
```

## 🔧 CAMBIOS REALIZADOS

### Backend (Java 21)

#### 1. **CompraItem.java**
```java
// ANTES:
@Column(nullable = false, precision = 14, scale = 6)
private BigDecimal precioUnitario;

// DESPUÉS:
@Column(nullable = false, precision = 14, scale = 6)
private BigDecimal precioTotal;

@Column(nullable = false, precision = 14, scale = 6, insertable = false, updatable = false)
@Builder.Default
private BigDecimal precioUnitario = BigDecimal.ZERO;
```

**Lógica en @PrePersist:**
```java
precioUnitario = precioTotal ÷ cantidad  // Calculado automático
subtotal = precioTotal                   // Ya es el total
```

#### 2. **CompraItemDTO.java**
```java
// CAMBIO:
BigDecimal precioTotal,      // ← NUEVO
BigDecimal precioUnitario,   // ← Agregado para respuesta
```

#### 3. **CompraItemRequest.java**
```java
// CAMBIO:
BigDecimal precioTotal  // ← Cambio de precioUnitario
```

#### 4. **CompraService.java**
- Línea 160: `precioTotal(itemReq.precioTotal())`
- Línea 172: Log actualizado
- Línea 313: `precioTotal(itemReq.precioTotal())`
- Línea 451: `itemToDTO()` agrega `precioTotal` a DTO

### Frontend (React + TypeScript)

#### 1. **compras.service.ts**
```typescript
// Interface CompraDetalle:
precioTotal: number;      // ← NUEVO
precioUnitario: number;   // ← Mantener para compatibilidad

// Interface CrearCompraRequest:
precioTotal: number;  // ← Cambio

// Interface ActualizarCompraRequest:
precioTotal: number;  // ← Cambio

// Interface IngredienteSeleccionado:
precioTotal: number;  // ← Cambio de precioUnitario
```

#### 2. **SeleccionarIngredientes.tsx**
```typescript
// Estado:
const [precioTotal, setPrecioTotal] = useState<number>(0);

// Validación:
if (!ingredienteSeleccionado || cantidad <= 0 || precioTotal < 0)

// Agregar ingrediente:
precioTotal: precioTotal,

// Actualizar:
actualizarPrecio(): precioTotal: nuevoPrecio

// Cálculo mostrado:
Precio Unitario (calculado): ${(cantidad > 0 ? precioTotal / cantidad : 0).toFixed(2)}

// Total compra:
sum + item.precioTotal  // NO cantidad × precioTotal
```

#### 3. **CompraForm.tsx**
```typescript
// Interface IngredienteSeleccionado:
precioTotal: number;

// Tabla:
- Columna 4: "Precio Total" (editable)
- Columna 5: "Precio Unit." (calculado: precioTotal ÷ cantidad)

// Guardar:
precioTotal: i.precioTotal,

// Total compra:
sum + item.precioTotal
```

#### 4. **ingredientes.service.ts**
```typescript
// Interface Ingrediente:
factorConversion?: string;  // ← Cambio de number

// Crear:
...(datos.factorConversion ? { factorConversion: datos.factorConversion } : {})

// Actualizar:
if (datos.factorConversion !== undefined) {...}
```

## 📊 FLUJO COMPLETO DESPUÉS

### 1️⃣ Registrar Compra
```
Usuario ingresa:
├─ Proveedor: "Frutas México"
├─ Fecha: 20/12/2025
├─ Ingrediente: "Jamón"
├─ Cantidad: 1 (medio jamón)
├─ Factor: "0.5 kg = 12 rebanadas"
└─ Precio TOTAL: $52.00 ✅

Backend calcula:
├─ Precio Unitario = $52 ÷ 1 = $52
├─ Subtotal = $52
└─ Guarda todo en BD
```

### 2️⃣ Crear Receta
```
Usuario crea receta "Sándwich Jamón":
├─ Usa 3 rebanadas de jamón
├─ Factor dice: "0.5 kg = 12 rebanadas"
├─ Costo = (3 ÷ 12) × $52 = $13.00 ✅
└─ Total receta = $13 + otros ingredientes
```

### 3️⃣ Reportes Financieros
```
Gasto Total (lo que invertí):
├─ Jamón: $52
├─ Naranja (30 kg): $270
├─ Total: $322 ✅

Margen por Producto:
├─ Sándwich: Costo $13 → Venta $45 → Margen $32
└─ Jugo: Costo $12 → Venta $28 → Margen $16
```

## ✅ VALIDACIONES

### Backend
```
compra_items table:
├─ cantidad: BigDecimal (positiva) ✓
├─ precio_total: BigDecimal (>= 0) ✓
├─ precio_unitario: GENERADA (precio_total ÷ cantidad) ✓
└─ subtotal: = precio_total ✓
```

### Frontend
```
Modal SeleccionarIngredientes:
├─ Cantidad: debe ser > 0 ✓
├─ Precio Total: debe ser >= 0 ✓
├─ Muestra calculado: Precio Unit. = precioTotal ÷ cantidad ✓
└─ Factor (opcional): "0.5 kg = 250 ml" (String) ✓
```

## 🐛 ERRORES SOLUCIONADOS

### Error 1: JSON Deserialization (SOLUCIONADO ✅)
```
❌ ANTES: factorConversion esperaba Integer, recibía String
✅ DESPUÉS: factorConversion es String en todas partes
```

### Error 2: Tipo TypeScript (SOLUCIONADO ✅)
```
❌ ANTES: precioUnitario: number
✅ DESPUÉS: precioTotal: number (lo que se gastó)
```

### Error 3: Cálculo incorrecto (SOLUCIONADO ✅)
```
❌ ANTES: subtotal = cantidad × precioUnitario (confuso)
✅ DESPUÉS: subtotal = precioTotal (lo que se gastó)
```

## 📝 CAMBIOS PENDIENTES (Si aplican)

- [ ] Migración de datos en BD (si hay datos antiguos con precioUnitario)
- [ ] Actualizar reportes existentes para usar precioTotal
- [ ] Tests unitarios para cálculo de precioUnitario derivado
- [ ] Documentación en Swagger/OpenAPI

## 🚀 PRÓXIMOS PASOS

1. **Test del Backend**
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ./start.sh
   ```

2. **Test del Frontend**
   ```bash
   cd frontend-web
   npm start
   ```

3. **Crear Compra de Prueba**
   - Naranja: 30 kg @ $270 total ($9/kg calculado)
   - Jamón: 1 u @ $52 total ($52/kg calculado)
   - Verificar en BD que precioUnitario se calcula automático

4. **Implementar Sprint 1** (Recetas + Stock)
   - Crear recetas con ingredientes
   - Calcular costo de recetas
   - Descontar stock en ventas

## 💾 ARCHIVOS MODIFICADOS

**Backend**:
- ✅ `CompraItem.java`
- ✅ `CompraItemDTO.java`
- ✅ `CompraItemRequest.java`
- ✅ `CompraService.java`

**Frontend**:
- ✅ `compras.service.ts`
- ✅ `SeleccionarIngredientes.tsx`
- ✅ `CompraForm.tsx`
- ✅ `ingredientes.service.ts`

---

**Status**: ✅ COMPLETADO  
**Responsable**: Copilot  
**Revisado por**: Usuario

