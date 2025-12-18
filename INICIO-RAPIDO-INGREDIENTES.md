# 🚀 INICIO RÁPIDO - Sistema de Ingredientes Vinculados a Gastos

## ⏱️ 5 Minutos para Empezar

### 1️⃣ Asegúrate de tener todo compilado

```bash
# Backend
cd backend
./mvnw clean compile -DskipTests

# Frontend
cd frontend-web
npm run build
```

**Resultado esperado:**
- Backend: `[INFO] BUILD SUCCESS`
- Frontend: `✓ built in 34.62s`

---

### 2️⃣ Ejecuta el backend

```bash
cd backend
./start.sh
```

**Qué hace:**
- Ejecuta migraciones (V025 agrega campos de vinculación)
- Inicia servidor en http://localhost:8080
- H2 console en http://localhost:8080/h2-console (dev)
- Swagger en http://localhost:8080/swagger-ui.html

---

### 3️⃣ Ejecuta el frontend

En otra terminal:

```bash
cd frontend-web
npm start
```

**Resultado:**
- Dev server en http://localhost:5173
- AdminIngredientes en http://localhost:5173/admin/ingredientes

---

## 📝 Flujo Práctico (2 minutos)

### PASO 1: Registrar un Gasto de Insumo

1. Ir a **Finanzas > Gastos**
2. Clic en **➕ Nuevo**
3. Completar:
   ```
   Categoría:  [Insumos] ← Importante
   Referencia: Harina Integral 5kg
   Monto:      50.00
   Fecha:      Hoy
   ```
4. **Guardar** ✓

### PASO 2: Crear Ingrediente Vinculado

1. Ir a **Inventario > Ingredientes**
2. Clic en **➕ Nuevo**
3. Completar **Información Básica**:
   ```
   Nombre:     Harina Integral
   Descripción: Tipo integral, apta para panes
   Unidad Base: Kilogramo
   ```

4. Completar **Vincular con Gasto de Insumos**:
   ```
   Buscar: harina
   └─ (Autocomplete mostrará: "Harina Integral 5kg - $50.00")
   Seleccionar ✓
   ```

5. Configurar **Costo y Stock**:
   ```
   Unidad Gasto:      Kilogramo (cargada automáticamente)
   Factor Conversión: 5 (5 kg comprados)
   
   ⚡ ALERTA AUTOMÁTICA:
      "Costo calculado: $50 ÷ 5 = $10.00/kg"
   
   Stock Inicial: 5
   ```

6. **Guardar** ✓

---

## ✅ Verificación

Después de guardar, en la tabla de ingredientes verás:

```
Ingrediente          | Unidad | Costo   | Stock | Estado
─────────────────────┼────────┼─────────┼───────┼──────────────────
Harina Integral      | kg     | $10.00  | 5     | ✓ Vinculado
```

---

## 🔍 ¿Qué pasó detrás de escenas?

### Backend
1. Búsqueda de gasto en categoría "Insumos" ✓
2. Validación: Factor > 0 ✓
3. Cálculo: `$50 / 5 = $10` con precisión BigDecimal ✓
4. Almacenamiento:
   ```java
   ingrediente {
       gastoId: 123
       costoTotalGasto: 50.00
       unidadGastoId: 2
       factorConversion: 5
       costoUnitarioBase: 10.00  // ← Calculado y guardado
   }
   ```

### Segregación por Sucursal
- El gasto se filtra por tu sucursal automáticamente
- El ingrediente se guarda ligado a tu sucursal
- No verás datos de otras sucursales

---

## 🎓 Conceptos Clave

### ¿Por qué "Insumos"?
La categoría "Insumos" ya existía en el sistema (ID 1) con descripción:
> "Ingredientes y materiales para producción"

Así que la reutilizamos en lugar de crear una nueva categoría duplicada. Más limpio y simple.

### Cálculo Automático
```
Costo Unitario = Monto Total / Factor Conversión
Ejemplo: $50 / 5 kg = $10/kg

Si compras 5 kg por $50:
- Costo unitario = $10/kg
- Si usas 0.5kg en una receta = $5 automáticamente
```

### Ventaja
No vuelves a cargar el costo. El sistema lo calcula automaticamente desde el gasto registrado.

---

## 🔧 Troubleshooting

### Error: "No se encuentra gasto de insumos"
**Causa:** El gasto no está en categoría "Insumos"
**Solución:** Ir a Finanzas > Gastos, verificar categoría

### Error: "Factor conversión debe ser > 0"
**Causa:** Dejaste el campo vacío o con 0
**Solución:** Llenar con número positivo (ej: 5)

### Autocomplete no busca
**Causa:** Escribiste menos de 3 caracteres
**Solución:** Escribe al menos 3 caracteres

---

## 📊 Próximas Integraciones

Una vez creados ingredientes con costos, puedes:

1. **Crear Recetas**
   - Agregar ingredientes vinculados
   - Sistema calcula costo de receta automáticamente

2. **Calcular Rentabilidad**
   - Costo de ingredientes vs precio de venta
   - Márgenes por producto

3. **Reportes**
   - Costo total de ingredientes por período
   - Variación de precios en tiempo

---

## 📚 Documentación Completa

Si necesitas más detalles, consulta:

- **GUIA-RAPIDA-INGREDIENTES-GASTOS.md** - Paso a paso detallado
- **SISTEMA-INGREDIENTES-VINCULADOS-GASTOS.md** - Documentación técnica
- **RESUMEN-FINAL-INGREDIENTES.md** - Estado general del sistema
- **CHECKLIST-FINAL-INGREDIENTES.md** - Verificación completa

---

## ⚡ Atajos Útiles

| Acción | Atajo |
|--------|-------|
| Ir a Ingredientes | `/admin/ingredientes` |
| Buscar gasto | Autocomplete (escribe 3+ caracteres) |
| Ver Gastos | Finanzas > Gastos |
| Ver Recetas | Inventario > Recetas |

---

## ✨ Estado

```
✅ Backend:  LISTO (BUILD SUCCESS)
✅ Frontend: LISTO (built 34.62s)
✅ Datos:    LISTOS (V025 migración)
✅ API:      DISPONIBLE
```

---

**¡Listo para usar!** 🎉

Cualquier pregunta, consulta la documentación en la carpeta raíz del proyecto.
