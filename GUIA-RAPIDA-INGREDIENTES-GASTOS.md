# 🎯 GUÍA RÁPIDA - Sistema de Ingredientes Vinculados a Gastos

## ⚡ Para Usar en Producción

### 1️⃣ Backend - Ejecutar Migraciones
```bash
cd backend
./start.sh  # Ejecuta automáticamente migración V025
```

✅ Se agregarán:
- Campos nuevos en tabla ingredientes (gasto_id, costo_total_gasto, unidad_gasto_id, factor_conversion)
- Relaciones con tabla gastos

**Nota:** Se usa la categoría "Insumos" existente (ID 1) en lugar de crear una nueva

### 2️⃣ Frontend - Flujo de Usuario

#### Paso A: Registrar Gasto
```
Admin Dashboard
  → Finanzas > Gastos
    → Nuevo Gasto
      ├─ Categoría: "Insumos" (Ingredientes y materiales para producción)
      ├─ Referencia: "Harina integral 5kg"
      ├─ Monto: $50
      └─ Guardar
```

#### Paso B: Crear Ingrediente Vinculado
```
Admin Dashboard
  → Inventario > Ingredientes
    → Nuevo Ingrediente
      ├─ Nombre: "Harina Integral"
      ├─ Buscar gasto de insumos: "harina" 
      │  └─ Autocomplete: "Harina integral 5kg - $50"
      ├─ Unidad gasto: "Kilogramo"
      ├─ Factor conversión: "5" (5 kg comprados)
      │  └─ AUTOMÁTICO: $50 / 5 = $10/kg
      ├─ Unidad base: "Kilogramo"
      ├─ Costo: $10.00 (CALCULADO)
      └─ Guardar
```

---

## 📊 Ejemplo Práctico Completo

### Escenario: Café Descafeinado

**Paso 1: Compra**
```
Gasto: "Café descafeinado Nescafé lata 500g"
Categoría: Materia Prima
Monto: $25
Fecha: 2025-12-18
```

**Paso 2: Crear Ingrediente**
```
Ingrediente: Café Descafeinado
├─ Vincular gasto: "Café descafeinado..." ✓
├─ Unidad gasto: Gramo (500g por lata)
├─ Factor: 500 (son 500g en un gasto)
│  → CÁLCULO: $25 / 500 = $0.05/gramo
├─ Unidad base: Gramo
└─ Costo unitario: $0.05 ✓
```

**Paso 3: En Receta**
```
Receta: Café Descafeinado (Taza)
├─ Café: 10 gramos
├─ Costo ingrediente: 10 × $0.05 = $0.50
└─ Beneficio: Precio exacto sin guesar
```

---

## 🔍 Endpoint API

### GET `/api/finanzas/gastos/buscar`
```bash
curl -X GET "http://localhost:8080/api/finanzas/gastos/buscar?categoriaNombre=Materia%20Prima&busqueda=harina"

Response:
[
  {
    "id": 15,
    "categoriaGastoNombre": "Materia Prima",
    "referencia": "Harina integral 5kg",
    "monto": 50.00,
    "fecha": "2025-12-18T10:00:00"
  }
]
```

---

## 🛠️ Solución de Problemas

### ❌ "Categoría 'Materia Prima' no encontrada"
**Solución**: Ejecutar migraciones
```bash
cd backend && ./start.sh
```

### ❌ "No encuentro gastos al buscar"
**Verificar**:
1. ¿El gasto está registrado en categoría "Materia Prima"?
2. ¿Coincide el texto de búsqueda con la referencia del gasto?
3. ¿Estás en la misma sucursal que el gasto?

### ❌ "El costo no se calcula automáticamente"
**Verificar**:
1. ¿Seleccionaste un gasto?
2. ¿Completaste el "Factor de Conversión"?
3. ¿El factor es mayor que 0?

---

## 📱 Interfaz - Secciones del Diálogo

```
┌─────────────────────────────────────┐
│  Nuevo Ingrediente         [x]      │
├─────────────────────────────────────┤
│ 📋 INFORMACIÓN BÁSICA                │
│  Nombre*: [Harina Integral]         │
│  Descripción: [Para pan...]         │
│  SKU: [HARINA-INT-001]              │
│  Unidad*: [Kilogramo ▼]             │
├─────────────────────────────────────┤
│ 🔗 VINCULAR CON GASTO                │
│  Buscar Gasto: [harina________]     │
│                                      │
│  ┌─ GASTO SELECCIONADO ──────────┐  │
│  │ Descripción: Harina 5kg        │  │
│  │ Costo: $50.00                  │  │
│  │ Unidad gasto: [Kg ▼]           │  │
│  │ Factor conversión: [5_]        │  │
│  │ ✓ Costo calculado: $10/unidad  │  │
│  └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ 💰 COSTO Y STOCK                     │
│  Costo Unitario*: $10.00            │
│  Stock Mínimo: [___]                │
├─────────────────────────────────────┤
│  [Cancelar]  [✓ Guardar]            │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [x] Migración V024: Crear categoría "Materia Prima"
- [x] Migración V025: Agregar campos a tabla ingredientes
- [x] Endpoint GET /gastos/buscar
- [x] DTO IngredienteDTO con campos de vinculación
- [x] Entidad Ingrediente con relaciones
- [x] Lógica de cálculo automático en backend
- [x] Servicio de gastos en frontend
- [x] Interfaz AdminIngredientes mejorada
- [x] Tabla con columna "Vinculado a Gasto"
- [x] Alert visual del costo calculado
- [x] Backend compilado ✅
- [x] Frontend compilado ✅

---

## 🚀 Listo para Deploy

Todo está compilado y listo para probar en ambiente de desarrollo.

**Para probar**:
1. Ejecutar backend: `cd backend && ./start.sh`
2. Ejecutar frontend: `cd frontend-web && npm run dev`
3. Acceder a: `http://localhost:5173`
4. Ir a: Admin > Inventario > Ingredientes
5. Crear nuevo ingrediente y probar búsqueda de gastos

---

**¿Dudas o ajustes?** Pregunta en el chat 💬
