# 📦 Lógica de Inventario, Recetas y Costos

## 1. Ingreso de materia prima (stock)
- Al comprar materia prima (ej. 180 kg de naranja):
  - Cantidad: 180 kg
  - Costo total: $9.00 × 180 = $1,620.00
  - Costo unitario: $9.00/kg

## 2. Definición de receta
- Para cada producto (ej. jugo de naranja 500 ml):
  - Ingredientes:
    - Naranja: 1 kg (produce 500 ml de jugo)
    - Vaso, tapa, popote: 1 pza cada uno
  - Costos indirectos: servicios, mano de obra, etc.

## 3. Cálculo de costo de producción
- Al definir la receta, el sistema calcula:
  - Costo de naranja por jugo: 1 kg × $9.00 = $9.00
  - Costo de insumos: suma de costos unitarios de vaso, tapa, popote
  - Costos indirectos: suma de servicios y mano de obra
  - Costo total = suma de todo lo anterior

## 4. Venta y consumo de inventario
- Al registrar una venta de jugo:
  - Se descuenta del stock: 1 kg de naranja, 1 vaso, 1 tapa, 1 popote
  - El reporte de consumo diario muestra solo lo realmente usado (no lo comprado)
  - Si hay merma, se descuenta aparte y se reporta

## 5. Reporte de utilidad
- Utilidad diaria = Ventas del día - (costo real de insumos consumidos + costos indirectos)
- El sistema puede mostrar:
  - Utilidad por producto
  - Utilidad por día/semana/mes
  - Consumo y merma de materia prima

## 6. Cálculo de precio de venta sugerido
- El sistema puede sugerir precio de venta:
  - Precio sugerido = Costo total × (1 + % utilidad deseada)
  - Ejemplo: $26.07 × 1.4 = $36.50

## 7. Pseudocódigo de la lógica

```java
// Al registrar compra de materia prima
stock.naranja += cantidadComprada;
costoUnitarioNaranja = totalCompra / cantidadComprada;

// Al definir receta
recetaJugoNaranja = {
  naranja: 1, // kg
  vaso: 1,
  tapa: 1,
  popote: 1,
  servicios: 4.02,
  manoObra: 10.00
}

// Al vender jugo
if (stock.naranja >= 1) {
  stock.naranja -= 1;
  // ...descontar insumos
  registrarConsumo("naranja", 1);
  registrarConsumo("vaso", 1);
  // ...
}

// Para reportes
costoReal = (consumoNaranja * costoUnitarioNaranja) + ...otros insumos + servicios + manoObra;
utilidad = ventas - costoReal;
```

---

Esta lógica permite calcular el costo real de producción, utilidad y consumo de insumos de manera precisa, considerando compras, recetas, ventas y mermas.


---

## 8. Gastos indirectos y mano de obra

Para calcular el costo real de cada producto, es fundamental considerar los gastos indirectos (servicios, renta, mantenimiento, etc.) y la mano de obra (sueldos, pagos por turno, etc.).

### ¿Cómo integrarlo en el sistema?

- **Registro de gastos indirectos y mano de obra:**
  - Crea un apartado/tab en la sección de gastos para registrar estos egresos periódicos.
  - Permite registrar cada gasto con su periodo (mensual, semanal, diario).

- **Distribución del gasto por producto:**
  - El sistema calcula el gasto indirecto y de mano de obra por producto:
    - Gasto por producto = Gasto total del periodo / Productos vendidos en ese periodo
  - Ejemplo: Si vendiste 1680 productos en el mes y tu gasto de luz mensual es $1000, el gasto de luz por producto es $1000 / 1680 ≈ $0.60.

- **Suma al costo de producción:**
  - Al calcular el costo de cada producto, suma:
    - Costo de insumos directos (receta)
    - + Gasto indirecto por producto
    - + Mano de obra por producto

- **Reportes:**
  - El sistema muestra el costo real de cada producto, considerando todos los gastos.
  - Permite ver utilidad real, puntos de equilibrio, etc.

### Propuesta de estructura en el sistema

- Apartado “Gastos”:
  - Subapartado/tab “Gastos indirectos” (servicios, renta, etc.)
  - Subapartado/tab “Mano de obra” (empleados, sueldos)
- Apartado “Recetas”:
  - Al calcular el costo, el sistema suma automáticamente el prorrateo de gastos indirectos y mano de obra según el periodo y ventas.

---

**Este enfoque permite tener un control total sobre el costo real de producción y la utilidad, integrando todos los egresos relevantes en la operación diaria del punto de venta.**