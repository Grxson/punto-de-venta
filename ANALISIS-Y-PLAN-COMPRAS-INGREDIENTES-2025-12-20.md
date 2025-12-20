# 📊 ANÁLISIS: Estado Actual vs Planeado + PLAN ESTRUCTURADO
**Fecha**: 20 de Diciembre 2025  
**Objetivo**: Implementar correctamente el flujo COMPRAS → INGREDIENTES → RECETAS → VENTAS

---

## 🔍 ANÁLISIS: LO QUE LLEVAMOS vs LO PLANEADO

### ✅ LO QUE YA EXISTE (Backend - 100% implementado)

**Modelos & BD:**
- ✅ `Compra.java` - Entidad para registro de compras
- ✅ `CompraItem.java` - Ítems de la compra (materia prima comprada)
- ✅ `Ingrediente.java` - Ahora con `factorConversion` como **String flexible**
- ✅ `Unidad.java` - kg, litro, ml, gramo, pza, paquete, rebanada, etc.
- ✅ Tabla `compras` en BD
- ✅ Tabla `compra_items` en BD
- ✅ Tabla `ingredientes` con columna `factor_conversion` (STRING, no INTEGER)

**Endpoints API:**
- ✅ `POST /api/compras` - Crear compra con ítems
- ✅ `GET /api/compras` - Listar compras
- ✅ `GET /api/compras/{id}` - Obtener detalle compra
- ✅ `PUT /api/compras/{id}` - Actualizar compra
- ✅ `DELETE /api/compras/{id}` - Eliminar compra
- ✅ `POST /api/ingredientes` - Crear ingrediente (recibe `factorConversion` como String)
- ✅ `GET /api/unidades` - Listar todas las unidades disponibles

**Servicios:**
- ✅ `CompraService.crear()` - Procesa creación de compra
- ✅ `IngredienteService.crear()` - Procesa creación de ingrediente
- ✅ `UnidadRepository.findAll()` - Obtiene unidades

**Mapper:**
- ✅ `InventarioMapper.toIngredienteDTO()` - Convierte a DTO

---

### ✅ LO QUE PARCIALMENTE EXISTE (Frontend - 60% implementado)

**Componentes existentes:**
- ✅ `AdminCompras.tsx` - Listado de compras (básico)
- ✅ `CompraForm.tsx` - Formulario para crear/editar compra
- ✅ `SeleccionarIngredientes.tsx` - Modal inteligente para crear ingredientes

**Lo que funciona:**
- ✅ Seleccionar proveedor
- ✅ Fecha de compra
- ✅ Agregar ingredientes (que YA existen)
- ✅ Crear ingrediente nuevoen el modal
- ✅ Mostrar tabla de ingredientes en compra

**Lo que NO funciona completamente:**
- ❌ Cantidad comprada por ingrediente en la compra (FALTA)
- ❌ Precio unitario de compra en la compra (FALTA)
- ❌ Subtotal por línea de compra (FALTA)
- ❌ Persistencia del flujo completo (PARCIAL)

---

### ❌ PROBLEMA CRÍTICO IDENTIFICADO

**En el modal `SeleccionarIngredientes.tsx`:**

El flujo actual permite:
1. Crear ingrediente con `factorConversion` = "0.5 kg = 250 ml" ✓
2. PERO no vincula ese ingrediente a la COMPRA actual

**Resultado:**
- ✓ Ingrediente se crea en BD
- ✗ La compra NO registra CUÁNTO se compró
- ✗ La compra NO registra A QUÉ PRECIO

**Ejemplo:**
```
Usuario abre "Nueva Compra"
├─ Proveedor: Frutas México
├─ Fecha: 2025-12-20
├─ Click "Agregar Ingrediente"
│  ├─ Crea "Naranja Fresca" con factor "1 kg = 500 ml"
│  └─ Ingrediente se guarda en BD ✓
├─ Pero en la compra:
│  ├─ ¿Cuántos kg? → NO REGISTRA
│  ├─ ¿Precio? → NO REGISTRA
│  └─ ¿Total? → NO CALCULA
└─ RESULTADO: Compra incompleta ❌
```

---

### 🎯 OBJETIVO FINAL (Flujo deseado)

```
PASO 1: REGISTRAR COMPRA
┌─────────────────────────────────────────────────────────────┐
Usuario abre "Nueva Compra"
├─ Proveedor: "Frutas México"
├─ Fecha: 2025-12-20
└─ Click "Agregar Ingrediente":
   ├─ Busca "Naranja":
   │  ├─ Si NO existe → Crea inline:
   │  │  ├─ Nombre: Naranja Fresca
   │  │  ├─ Unidad: kg
   │  │  ├─ Factor: 1 kg = 500 ml (referencial)
   │  │  └─ → Se crea en BD
   │  └─ Si existe → Selecciona
   │
   ├─ AQUÍ ESTÁ LA COMPRA (lo que FALTA):
   │  ├─ ¿Cuánto compré? [30] kg
   │  ├─ ¿A qué precio? [$9.00] por kg
   │  └─ Subtotal: 30 × $9.00 = $270
   │
   └─ Confirma → Se guarda en BD:
      ├─ compra_items.ingrediente_id = Naranja
      ├─ compra_items.cantidad = 30
      ├─ compra_items.unidad_id = 1 (kg)
      ├─ compra_items.precio_unitario = 9.00
      └─ compra_items.subtotal = 270.00

PASO 2: CREAR RECETA (USA EL INGREDIENTE COMPRADO)
┌─────────────────────────────────────────────────────────────┐
Usuario abre "AdminRecetas"
├─ Producto: "Jugo Naranja Medio"
├─ Agrega ingrediente: "Naranja"
│  ├─ Cantidad: 0.5
│  ├─ Unidad: kg
│  └─ Costo se calcula automático: 0.5 × $9.00 = $4.50
├─ Agrega ingredientes más... (vaso, tapa, popote)
└─ Precio de venta: $36.50
   └─ Margen: $36.50 - $6.20 = $30.30

PASO 3: VENDER
┌─────────────────────────────────────────────────────────────┐
Vendo 50 "Jugo Naranja Medio"
├─ Sistema calcula:
│  ├─ Naranja: 50 × 0.5 kg = 25 kg consumida
│  ├─ Costo: 25 kg × $9.00/kg = $225
│  └─ Stock actualizado: 30 - 25 = 5 kg
├─ Ingresos: 50 × $36.50 = $1,825
└─ Ganancia: $1,825 - $225 (otros costos) = $1,600
```

---

## 📋 PLAN ESTRUCTURADO: 3 SPRINTS

### 🔴 SPRINT 1: Completar el FLUJO DE COMPRAS (3-4 horas)

**Objetivo**: Hacer que la compra registre cantidad y precio por ingrediente

#### BACKEND CHANGES (30 min)

**1. Verificar DTO `CompraItemDTO`:**
```java
// File: backend/.../dto/CompraItemDTO.java
public record CompraItemDTO(
    Long ingredienteId,        // ✅ Ya existe
    String ingredienteNombre,  // ✅ Ya existe
    Long unidadId,             // ✅ Ya existe
    String unidadNombre,       // ✅ Ya existe
    String unidadAbreviatura,  // ✅ Ya existe
    
    // ESTO DEBE EXISTIR:
    BigDecimal cantidad,       // ¿Cuánto compré?
    BigDecimal precioUnitario, // ¿A qué precio?
    // precioUnitario * cantidad = subtotal
) {}
```

**Action**: Verificar que `CompraItemDTO` tiene estos campos. Si faltan, agregar.

**2. Service `CompraService`:**
```java
// En CompraService.crear():
// Debe guardar CompraItem con:
// - ingrediente_id
// - cantidad (cantidad que se compró)
// - unidad_id
// - precio_unitario
// - subtotal (calculado: cantidad × precio_unitario)

// Verificar que CompraItem.java tenga:
@Column(name = "cantidad", precision = 12, scale = 3)
private BigDecimal cantidad;

@Column(name = "precio_unitario", precision = 14, scale = 6)
private BigDecimal precioUnitario;
```

**Action**: Verificar existencia. Si faltan campos, agregailorlos.

---

#### FRONTEND CHANGES (2-3 horas)

**1. Actualizar `SeleccionarIngredientes.tsx`:**

El modal debe permitir DOS cosas:

**OPCIÓN A: Crear ingrediente desde cero**
```tsx
// Sección para CREAR nuevo ingrediente:
┌─────────────────────────────────────────────────────┐
│  Crear Nuevo Ingrediente                           │
│  (para agregar a esta compra)                      │
├─────────────────────────────────────────────────────┤
│  Nombre: [Naranja Fresca]                          │
│  Unidad: [kg]                                      │
│  Factor: [1 kg = 500 ml]                           │
│  Costo Base: [$9.00]                               │
└─────────────────────────────────────────────────────┘
```

**OPCIÓN B: Seleccionar existente y AGREGAR CANTIDAD**
```tsx
// Después de seleccionar/crear:
┌─────────────────────────────────────────────────────┐
│  Detalles de Compra                                │
├─────────────────────────────────────────────────────┤
│  Ingrediente: Naranja Fresca                       │
│  Cantidad: [30]                                    │
│  Unidad: [kg]                                      │
│  Precio Unit: [$9.00]                              │
│  ─────────────────────────────────────────         │
│  Subtotal: $270.00                                 │
│  [Agregar a Compra] [Cancelar]                     │
└─────────────────────────────────────────────────────┘
```

**2. Actualizar `CompraForm.tsx`:**

Mostrar tabla con los ingredientes agregados:
```tsx
┌─────────────────────────────────────────────────────┐
│ INGREDIENTES EN ESTA COMPRA                        │
├──────────────┬────────┬───────┬───────┬─────────────┤
│ Ingrediente  │ Cant.  │ Unit. │ Precio│ Subtotal    │
├──────────────┼────────┼───────┼───────┼─────────────┤
│ Naranja      │ 30.00  │ kg    │ $9.00 │ $270.00    │
│ Vaso 16L     │ 500    │ pza   │ $1.04 │ $520.00    │
│ Tapa 16L     │ 500    │ pza   │ $0.60 │ $300.00    │
│ Popote       │ 1000   │ pza   │ $0.06 │ $60.00     │
├──────────────┼────────┼───────┼───────┼─────────────┤
│ TOTAL COMPRA │        │       │       │ $1,150.00  │
└──────────────┴────────┴───────┴───────┴─────────────┘
```

---

### 🟡 SPRINT 2: Factor de Conversión + Costo Base (2-3 horas)

**Objetivo**: Garantizar que `factorConversion` se guarde y se use correctamente

#### BACKEND STATUS (DONE TODAY)

- ✅ `Ingrediente.java`: `factorConversion` ahora es `String`
- ✅ `IngredienteDTO.java`: `factorConversion` ahora es `String`
- ✅ `IngredienteService.crear()`: Acepta y guarda `factorConversion` como String
- ✅ Compilación: ✅ Backend compila sin errores
- ✅ Empaquetado: ✅ JAR generado

**Verificación pendiente:**
- ⏳ Test: Crear ingrediente con factor "1 kg = 500 ml" desde frontend
- ⏳ Verificar: BD guarda el string correctamente
- ⏳ Verificar: GET `/api/ingredientes` devuelve el factor

#### FRONTEND CHANGES (Completadas hoy)

- ✅ Estado actualizado: `factorCantidadEntrada` + `factorCantidadSalida` + `factorUnidadSalidaId`
- ✅ UI redesignada: 2 campos (entrada y salida) en lugar de 1
- ✅ Previsualización dinámica: Muestra "0.5 kg = 250 ml" en tiempo real
- ✅ Ejemplos mejorados: Naranja, Embutido, Harina
- ✅ Compilación: ✅ Build successful en 35.82s

**Test required:**
- ⏳ Crear ingrediente con factor flexible
- ⏳ Verificar que se guarda en BD
- ⏳ Verificar que aparece en listado

---

### 🟢 SPRINT 3: Recetas + Stock + Ventas (Siguiente sesión)

**Objetivo**: Vincular todo: Compra → Ingrediente → Receta → Venta → Stock

Dependencias:
- Sprint 1 completo
- Sprint 2 testeable

Tareas:
- ⏳ AdminRecetas: Crear/editar recetas (FRONTEND)
- ⏳ RecetaItem: Vincular ingredientes a recetas (FRONTEND)
- ⏳ Cálculo de costo: Ingrediente × Cantidad = Costo receta (FRONTEND)
- ⏳ Descuento de stock en ventas (BACKEND)
- ⏳ Reporte: Movimiento de inventario (FRONTEND)

---

## 🚀 PLAN EJECUCIÓN HOJA DE RUTA (HOY - 20 DICIEMBRE)

### AHORA (20-dic 11:15)

**1. Iniciar servidor backend**
```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend
./start.sh
```
→ Esperar a que esté listo en `http://localhost:8080`

**2. Testear creación de ingrediente**
```bash
POST http://localhost:8080/api/ingredientes
{
  "nombre": "Naranja Fresca",
  "unidadBaseId": 1,  // kg
  "costoUnitarioBase": 9.00,
  "factorConversion": "1 kg = 500 ml",  // String ahora
  "activo": true
}
```
→ Debe responder HTTP 201 (éxito)

**3. Verificar BD**
```bash
SELECT id, nombre, factor_conversion FROM ingredientes 
WHERE nombre = 'Naranja Fresca';
```
→ Debe mostrar: `id | nombre | factor_conversion`
           `5 | Naranja Fresca | 1 kg = 500 ml`

---

### LUEGO (20-dic, próximas 3-4 horas)

**Sprint 1 Frontend:**

**Paso 1**: Actualizar `CompraForm.tsx`
- Debe mostrar tabla con ingredientes + cantidad + precio

**Paso 2**: Actualizar modal `SeleccionarIngredientes.tsx`
- Después de crear/seleccionar ingrediente, pedir cantidad y precio
- Botón "Agregar a Compra" que lo añade a la tabla

**Paso 3**: Actualizar `CompraService` del backend
- Verificar que `POST /api/compras` guarda `CompraItem` correctamente

**Paso 4**: Test completo end-to-end
```
1. Abrir AdminCompras
2. Nueva Compra → Proveedor "Frutas México"
3. Agregar Ingrediente:
   ├─ Busca "Naranja"
   ├─ Si no existe → Crea con factor
   ├─ Cantidad: 30, Precio: $9.00
   └─ Agregar a compra
4. Guardar compra
5. Verificar en BD que se guardó correctamente
```

---

## 📊 TABLA COMPARATIVA: LO PLANEADO vs IMPLEMENTADO

| Componente | Planeado | Actual | % | Nota |
|-----------|----------|--------|---|------|
| **COMPRAS** | | | | |
| Crear compra | ✅ | ✅ | 100% | Backend OK |
| Agregar ingredientes | ✅ | 🟡 50% | Crear sí, registrar cantidad/precio NO |
| Registrar cantidad | ✅ | ❌ | 0% | FALTA: Campo en UI |
| Registrar precio | ✅ | ❌ | 0% | FALTA: Campo en UI |
| Subtotal automático | ✅ | ❌ | 0% | FALTA: Cálculo |
| **INGREDIENTES** | | | | |
| Crear ingrediente | ✅ | ✅ | 100% | Backend OK, Frontend OK |
| Factor conversión | ✅ | ✅ | 100% | Ahora String flexible |
| Unidades variables | ✅ | ✅ | 100% | kg, ml, pza, gramo, etc. |
| Previsualización factor | ✅ | ✅ | 100% | Real-time en modal |
| **RECETAS** | ✅ | ❌ | 0% | PRÓXIMA SESIÓN |
| **VENTAS** | ✅ | ✅ | 95% | Falta descuento de stock |
| **MERMAS** | ✅ | ❌ | 0% | PRÓXIMA SESIÓN |
| **REPORTES** | ✅ | ✅ | 80% | Falta movimiento inventario UI |

---

## 🎯 RESUMEN: QUÉ HACER AHORA

### CRÍTICO (Para que funcione todo)

1. **Hoy (20-dic)**: Completar Sprint 1
   - Agregar campos cantidad + precio en `SeleccionarIngredientes`
   - Actualizar `CompraForm` para mostrar tabla con ingredientes
   - Test: Crear compra completa y verificar en BD

2. **Próxima sesión**: Sprint 2 + Sprint 3
   - Recetas
   - Stock (descuento automático en ventas)
   - Reportes

### NICE TO HAVE (Para mejorar UX)

- Buscar ingredientes existentes (autocomplete mejorado)
- Historial de precios de compra
- Sugerencias de cantidad basadas en ventas anteriores

---

## 📝 CONCLUSIÓN

**Estado actual**: 60% (como dice PENDIENTES.md)
- ✅ Backend: 90% (solo falta verificación)
- ✅ Frontend Compras: 40% (falta UI de cantidad/precio)
- ❌ Frontend Recetas: 0%
- ❌ Frontend Mermas: 0%

**Tras completar Sprint 1**: 70%
**Tras completar Sprint 3**: 95%

**Tiempo estimado total**: 8-10 horas de desarrollo

---

## 📌 PRÓXIMOS COMANDOS

```bash
# 1. Iniciar backend
cd backend && ./start.sh

# 2. Test manual: Crear ingrediente
curl -X POST http://localhost:8080/api/ingredientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Naranja Test",
    "unidadBaseId": 1,
    "costoUnitarioBase": 9.00,
    "factorConversion": "1 kg = 500 ml",
    "activo": true
  }'

# 3. Iniciar frontend
cd frontend-web && npm start
```

