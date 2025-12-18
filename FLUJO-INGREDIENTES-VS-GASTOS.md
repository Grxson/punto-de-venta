# 🔄 Flujo de Gestión de Ingredientes vs Gastos

## El Dilema: ¿Gasto o Ingrediente?

Tienes razón en cuestionarlo. Aquí explicamos el modelo correcto:

---

## 📊 **Modelo de Datos - 3 Conceptos Clave**

### 1. **COMPRA (Proveedor → Materia Prima)**
```
Evento: Recibes materia prima del proveedor
Acción: Registrar en "GASTO OPERACIONAL" con categoría "Compra de Materia Prima"
Datos: Proveedor, cantidad, costo total, fecha
Sistema: Modulo de Gastos Operacionales
```

### 2. **INGREDIENTE (Base de Recetas)**
```
Evento: Definir los ingredientes que usarás en recetas
Acción: Registrar en "INGREDIENTES"
Datos: Nombre, unidad de medida, costo unitario ACTUALIZADO
Sistema: Módulo de Ingredientes
```

### 3. **RECETA (Combinación de Ingredientes)**
```
Evento: Definir cómo se prepara cada producto
Acción: Crear en "RECETAS"
Datos: Producto, ingredientes + cantidades, costos, precio sugerido
Sistema: Módulo de Recetas
```

---

## 🔗 **Relación entre Gastos e Ingredientes**

```
┌─────────────────────────────────────────────────────────┐
│  COMPRA A PROVEEDOR (Gasto)                             │
│  ├─ Fecha: 2025-12-18                                  │
│  ├─ Proveedor: "Juan's Produce"                        │
│  ├─ Items:                                              │
│  │  ├─ Harina (kg) - 10 kg @ $2.50/kg = $25.00        │
│  │  ├─ Azúcar (kg) - 5 kg @ $1.80/kg = $9.00          │
│  │  └─ Huevos (docena) - 2 dz @ $4.50/dz = $9.00      │
│  └─ Total Gasto: $43.00                                │
└─────────────────────────────────────────────────────────┘
                        ↓
        [Actualizar costo unitario en Ingredientes]
                        ↓
┌─────────────────────────────────────────────────────────┐
│  INGREDIENTES (Base de datos)                           │
│  ├─ Harina: $2.50/kg (actualizado)                     │
│  ├─ Azúcar: $1.80/kg (actualizado)                     │
│  └─ Huevos: $2.25 por unidad (actualizado)             │
└─────────────────────────────────────────────────────────┘
                        ↓
        [Usar en Recetas para calcular costos]
                        ↓
┌─────────────────────────────────────────────────────────┐
│  RECETA: "Pan Integral"                                 │
│  ├─ Harina: 500g @ $2.50/kg = $1.25                   │
│  ├─ Agua: 300ml (gratuita)                             │
│  ├─ Sal: 10g (costo ínfimo)                            │
│  ├─ Levadura: 5g (costo ínfimo)                        │
│  ├─ Costo Total: ~$1.30                                │
│  └─ Precio Sugerido (40% utilidad): $1.82              │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ **Flujo Operacional Correcto**

### **Semana 1: Compra inicial**
1. Voy al mercado y compro materia prima
2. Registro en **Gastos Operacionales → Compra de Materia Prima**
3. Ingreso: 10 kg Harina @ $2.50/kg = $25.00
4. Sistema registra el gasto

### **Semana 1: Configuración de Ingredientes**
5. Voy a **Menú → Ingredientes**
6. Creo: "Harina" 
   - Unidad: Kilogramo
   - Costo Unitario: $2.50/kg (basado en el compra)
   - Proveedor: Juan's Produce
   - Stock Mínimo: 5 kg (reorden)

### **Semana 2: Cambio de proveedor**
7. Compro harina a otro proveedor: 8 kg @ $2.30/kg = $18.40
8. Registro nuevo gasto en **Gastos Operacionales**
9. Actualizo Ingrediente "Harina": 
   - Nuevo Costo Unitario: $2.30/kg
   - Proveedor: Updated

### **Semana 3: Crear Receta**
10. Voy a **Menú → Recetas**
11. Creo "Pan Integral"
12. Agrego Ingredientes:
    - Harina 500g
    - Agua 300ml
    - Sal 10g
    - Sistema calcula costo basado en precios unitarios actuales

---

## 🎯 **Campos que DEBERÍA pedir el Formulario de Ingredientes**

Actual (Compacto - 4 campos):
- ✅ Nombre
- ✅ Unidad de Medida
- ✅ Costo Unitario
- ❌ Falta: Proveedor (importante)
- ❌ Falta: Stock Actual
- ❌ Falta: Stock Mínimo (reorden)
- ❌ Falta: SKU (código interno)

**Propuesta Mejorada (8 campos):**
- Nombre (requerido)
- Descripción (opcional)
- Unidad de Medida (requerido)
- Proveedor (recomendado)
- Costo Unitario (requerido)
- Stock Actual (opcional, se actualiza desde compras)
- Stock Mínimo (opcional, para alertas)
- SKU/Código (opcional)

---

## 📋 **Respuesta a tu pregunta**

### ¿Registro como Gasto O como Ingrediente?

**Respuesta: AMBOS, pero en diferente momento**

1. **PRIMERO** → Registra en **Gastos Operacionales**
   - Esto registra el movimiento financiero real
   - Afecta el balance de caja
   - Auditable para contabilidad

2. **DESPUÉS** → Actualiza en **Ingredientes**
   - Esto actualiza el costo unitario
   - Afecta el cálculo de costos de recetas
   - Usa para pricing inteligente

### Ejemplo Real:
```
Acción: Compro 10 kg de harina a $2.50/kg

PASO 1 - Gasto:
├─ Tipo: Gasto Operacional
├─ Categoría: Compra de Materia Prima
├─ Proveedor: Juan's Produce
├─ Monto: $25.00
└─ Fecha: 2025-12-18

PASO 2 - Ingrediente:
├─ Ingrediente: Harina
├─ Nuevo Costo: $2.50/kg
├─ Proveedor: Juan's Produce
├─ Actualizar: stock e historial de precios
└─ Fecha: 2025-12-18
```

---

## 🔧 **Mejoras a Implementar**

1. ✅ **Expandir formulario de Ingredientes**
   - Agregar Proveedor (dropdown)
   - Agregar Stock Actual y Stock Mínimo
   - Agregar SKU

2. ✅ **Agregar Formulario de Compras**
   - Crear entrada específica para "Compra de Ingredientes"
   - Que sincronice automáticamente con Ingredientes
   - Historial de precios por proveedor

3. ✅ **Alertas de Stock**
   - Notificar cuando stock < stock mínimo
   - Sugerir reorden automático

4. ✅ **Reportes de Costos**
   - Histórico de precios por ingrediente
   - Análisis de proveedores (mejor precio, calidad)
   - Impacto en costo de recetas

---

## 💡 **Resumen del Flujo Correcto**

```
COMPRA FÍSICA           →    REGISTRO FINANCIERO      →    BASE PARA RECETAS
(Mercado)                    (Sistema - Gastos)              (Sistema - Recetas)
    ↓                               ↓                              ↓
10kg Harina @ $2.50         Gasto Operacional            Ingrediente actualizado
Recibo del proveedor        $25.00 registrado            Costo = $2.50/kg
                            Balance actualizado          ✓ Listo para recetas
```
