# 📋 CHECKLIST: VERIFICACIÓN DE FIX DE REPORTES

## 🔧 PASO 1: Ejecutar el Backend

```bash
cd backend && ./start.sh
```

**Verificar que dice**:
```
✅ The application has started successfully.
✅ Server is running on http://localhost:8080
```

---

## 📊 PASO 2: Acceder a Reportes - Cortes Generales

1. Abre la aplicación en `http://localhost:5173`
2. Navega a **Reportes → Cortes Generales**
3. Selecciona una fecha o rango

**Espera ver estos campos**:
- ✅ **Total Ventas**: Suma de todas las ventas
- ✅ **Total Costos**: Costos de productos + TODOS los gastos
- ✅ **Total Gastos**: Suma de TODOS los gastos (Operacional + Admin + otros)
- ✅ **Margen Bruto**: Total Ventas - Total Costos
- ✅ **Margen %**: Porcentaje de margen

---

## 📈 PASO 3: Crear Datos de Prueba

### Test 1: Crear Compra
1. Ve a **Inventario → Compras**
2. Crea una nueva compra:
   - Ingrediente: cualquiera
   - Cantidad: 10
   - Precio Total: $100
   - Proveedor: cualquiera

3. Guarda la compra

### Test 2: Crear Gastos de Diferentes Tipos

Crea 3 gastos (en **Admin → Gastos**):

**Gasto 1: Operacional**
```
Tipo: Operacional
Monto: $50
Fecha: Hoy
Categoría: Utilities
Nota: "Agua y electricidad"
```

**Gasto 2: Administrativo**
```
Tipo: Administrativo
Monto: $30
Fecha: Hoy
Categoría: Office Supplies
Nota: "Útiles de oficina"
```

**Gasto 3: Otro tipo**
```
Tipo: Renta (o el que tengas)
Monto: $100
Fecha: Hoy
Categoría: Facilities
Nota: "Renta del local"
```

### Test 3: Crear Venta
1. Ve a **Ventas → Nueva Venta**
2. Agrega un producto (usa el que compraste)
3. Cantidad: 5 unidades
4. Precio: $25 cada una
5. Total: $125
6. Completa la venta

---

## 🔍 PASO 4: Verificar Datos en Reportes

### Verify en "Cortes Generales":

**Accede a la fecha de hoy**

Deberías ver:
```
┌─────────────────────────────────────┐
│ CORTE GENERAL                       │
├─────────────────────────────────────┤
│ Total Ventas:      $125.00 ✅      │
│ Total Costos:      $80.00           │ (costo producto + gastos)
│                                      │
│ Desglose:                            │
│ - Costo Productos:  ? (depende)     │
│ - Gastos:           $180.00 ✅      │ (50+30+100)
│                                      │
│ Margen Bruto:      $45.00 ✅        │ (125-80)
│ Margen %:          36% ✅           │
└─────────────────────────────────────┘
```

**Lo Importante**:
- ✅ **Total Gastos debe ser $180** (suma de los 3 gastos)
- ✅ **NO debe ser $50** (como sería si solo contara "Operacional")
- ✅ **Margen debe ser preciso** basado en TODOS los gastos

### Verify en "Corte por Producto":

1. Ve a **Reportes → Corte por Producto**
2. Selecciona la misma fecha

Deberías ver:
```
┌──────────────────────────────────────────┐
│ PRODUCTO                                 │
├──────────────────────────────────────────┤
│ [Nombre del Producto]                    │
│ Cantidad:        5 unidades              │
│ Precio Unit:     $25.00                  │
│ Ingreso Total:   $125.00                 │
│ Costo Unit:      ? (calculado)           │
│ Costo Total:     ? (calculado)           │
│ Margen Unit:     ? (precio - costo)      │
│ Margen %:        ? (basado en costo)     │
└──────────────────────────────────────────┘
```

---

## 🚨 Si NO ves los Gastos...

**Problema**: Los gastos no aparecen en "Total Gastos"

**Solución**:
1. Verifica que los gastos tengan la **fecha correcta** (debe estar en el rango del reporte)
2. Verifica que los gastos tengan una **sucursal asignada**
3. Compila nuevamente:
   ```bash
   cd backend && ./mvnw clean package -DskipTests
   ```
4. Reinicia el backend:
   ```bash
   cd backend && ./start.sh
   ```

---

## 📊 Fórmula de Cálculo (Verificación Manual)

**Antes del Fix**:
```
Total Gastos = Gastos con tipo="Operacional" SOLO
             = $50 (❌ INCOMPLETO)
Total Costos = $? + $50 (❌ BAJO)
Margen Bruto = $125 - $? (❌ INFLADO)
```

**Después del Fix**:
```
Total Gastos = TODOS los gastos sin importar tipo
             = $50 + $30 + $100 = $180 (✅ CORRECTO)
Total Costos = $? + $180 (✅ COMPLETO)
Margen Bruto = $125 - $? (✅ PRECISO)
```

---

## ✅ Checklist Final

- [ ] Backend compiló exitosamente
- [ ] Backend empaquetó exitosamente
- [ ] Backend inicia sin errores
- [ ] Creé datos de prueba (compra, gastos, venta)
- [ ] Accedí a "Cortes Generales"
- [ ] Total Gastos muestra la suma COMPLETA de todos los gastos
- [ ] Margen Bruto es preciso (Ventas - Total Costos)
- [ ] Accedí a "Corte por Producto"
- [ ] Los márgenes se calculan correctamente
- [ ] No hay valores en $0 (excepto si no hay datos)

---

## 📞 Si Algo Falla...

**Síntoma**: Backend no inicia

```bash
# Limpiar caché
cd backend && rm -rf target/

# Recompilar desde cero
./mvnw clean compile
./mvnw clean package -DskipTests

# Iniciar
./start.sh
```

**Síntoma**: Gastos no aparecen en reportes

```bash
# Verifica la BD:
# 1. Abre H2 Console: http://localhost:8080/h2-console
# 2. Ejecuta:
SELECT COUNT(*) as total_gastos,
       SUM(monto) as suma_gastos
FROM gastos
WHERE fecha BETWEEN CURRENT_DATE AND CURRENT_TIMESTAMP;

# Debe mostrar los gastos que creaste
```

---

**Estado**: ✅ FIX COMPLETADO Y LISTO PARA VERIFICAR  
**Fecha**: 2025-12-20

