# 📊 Algoritmo de Popularidad para Menú Dinámico

## 🎯 Visión General

El sistema de **Menú Dinámico por Popularidad** reordena automáticamente los productos según qué tan populares son (basándose en ventas). Los productos más vendidos aparecen en primer lugar (esquina superior izquierda) y se distribuyen de **izquierda a derecha, de arriba hacia abajo**.

```
┌─────┬─────┬─────┐
│ 1️⃣  │ 2️⃣  │ 3️⃣  │ ← Fila 0 (más populares)
├─────┼─────┼─────┤
│ 4️⃣  │ 5️⃣  │ 6️⃣  │ ← Fila 1
├─────┼─────┼─────┤
│ 7️⃣  │ 8️⃣  │ 9️⃣  │ ← Fila 2
└─────┴─────┴─────┘
  ↑     ↑     ↑
Col 0 Col 1 Col 2
```

## 🧮 Componentes del Algoritmo

### 1. **Score de Popularidad** (0-100)
Combina múltiples factores para crear un score normalizado:

```
Score = función(
    Frecuencia,      // ¿Cuántas veces se vendió?
    Cantidad,        // ¿Cuántas unidades se vendieron?
    Ingreso,         // ¿Cuánto dinero generó?
    Recencia,        // ¿Qué tan reciente fue la venta?
    Tendencia        // ¿Va en alza o baja?
)
```

#### Factores individuales:

| Factor | Peso | Fórmula | Propósito |
|--------|------|---------|----------|
| **Frecuencia** | 20 | `ln(1 + freq) × 20` | Productos vendidos regularmente |
| **Cantidad** | 15 | `ln(1 + qty) × 15` | Volumen total de ventas |
| **Ingreso** | 10 | `ln(1 + income) × 10` | Dinero generado |
| **Recencia** | 25 | `exp(-minutos/480) × 25` | Ventas recientes (últimas 8h) |
| **Tendencia** | 30 | `tanh(tasa_cambio) × 30` | Si está en alza/baja |

La **recencia** tiene un semivida de **8 horas**: un producto vendido hace 8 horas tiene factor 0.5, hace 16 horas tiene factor 0.25, etc.

### 2. **Cálculo de Tendencia**
Compara las ventas recientes vs antiguas:

```
Tendencia = (Ventas_7días_recientes - Ventas_7días_anteriores) / Ventas_7días_anteriores
```

- **Positiva** (> 0): Producto en alza
- **Negativa** (< 0): Producto en baja
- **Cero**: Estable

### 3. **Distribución en Grilla**
Los productos se distribuyen secuencialmente en un grid con N columnas:

```python
fila = índice // columnas
columna = índice % columnas
```

**Ejemplo** con 3 columnas:
- Producto 0 → (fila=0, col=0) ← Esquina superior izquierda
- Producto 1 → (fila=0, col=1)
- Producto 2 → (fila=0, col=2)
- Producto 3 → (fila=1, col=0)
- ...

## 🏗️ Estructura del Código

### Clases principales

#### `PopularityAlgorithm.java`
Núcleo del algoritmo con métodos estáticos:

```java
// Calcular score
BigDecimal score = PopularityAlgorithm.calcularScore(
    productoId,
    frecuenciaVenta,
    cantidadTotal,
    ingresoTotal,
    ultimaVenta,
    tendencia
);

// Ordenar por popularidad
List<ProductoPopularidadDTO> ordenados = 
    PopularityAlgorithm.ordenarPorPopularidad(productos);

// Distribuir en grilla
Map<Long, GridPosition> posiciones = 
    PopularityAlgorithm.distribuirEnGrid(productos, columnasGrid);

// Distribuir por categoría
Map<String, Map<Long, GridPosition>> porCategoria = 
    PopularityAlgorithm.distribuirPorCategoria(productos, columnasGrid);
```

#### `MenuPopularidadService.java`
Orquesta el algoritmo y consulta a BD:

```java
// Obtener menú ordenado completo
MenuGrillaDTO menu = menuPopularidadService.obtenerMenuOrdenado(
    columnasGrid,   // Columnas en grilla
    diasAnalizar,   // Días para cálculo
    porCategoria    // ¿Agrupar por categoría?
);

// Top N productos
List<ProductoPopularidadDTO> top = 
    menuPopularidadService.obtenerTopProductos(10, 7);
```

#### `MenuPopularidadController.java`
Expone los endpoints REST:

- `GET /api/v1/menu/ordenado` - Menú ordenado en grilla
- `GET /api/v1/menu/por-categoria` - Menú por categoría
- `GET /api/v1/menu/top` - Top N productos
- `GET /api/v1/menu/grilla` - Solo distribución de posiciones
- `GET /api/v1/menu/estadisticas` - Datos detallados

### DTOs

- **`ProductoPopularidadDTO`**: Producto con score y estadísticas
- **`MenuGrillaDTO`**: Respuesta completa con productos, posiciones y metadata
- **`ProductoEstadisticasAggregate`**: Agregado de BD con stats

## 📡 Endpoints REST

### 1. Menú ordenado completo

```bash
GET /api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7
```

**Respuesta:**
```json
{
  "columnasGrid": 3,
  "posiciones": {
    "1": { "fila": 0, "columna": 0 },
    "2": { "fila": 0, "columna": 1 },
    "3": { "fila": 0, "columna": 2 },
    "4": { "fila": 1, "columna": 0 }
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Café Expreso",
      "categoriaNombre": "Bebidas",
      "precio": 25.00,
      "descripcion": "Café espresso italiano",
      "frecuenciaVenta": 156,
      "cantidadVendida": 312,
      "ingresoTotal": 7800.00,
      "ultimaVenta": "2025-12-06T10:45:00",
      "scorePopularidad": 92.50
    },
    {
      "id": 2,
      "nombre": "Capuchino",
      "categoriaNombre": "Bebidas",
      "precio": 35.00,
      "descripcion": "Capuchino clásico",
      "frecuenciaVenta": 142,
      "cantidadVendida": 284,
      "ingresoTotal": 9940.00,
      "ultimaVenta": "2025-12-06T11:20:00",
      "scorePopularidad": 88.75
    }
  ],
  "timestamp": "2025-12-06T12:00:00"
}
```

### 2. Menú por categoría

```bash
GET /api/v1/menu/por-categoria?columnasGrid=3&diasAnalizar=7
```

Agrupa productos por categoría y calcula posiciones independientes por cada grupo.

### 3. Top N productos

```bash
GET /api/v1/menu/top?limite=10&diasAnalizar=7
```

Retorna solo los 10 productos más populares.

### 4. Distribución en grilla

```bash
GET /api/v1/menu/grilla?columnasGrid=4&diasAnalizar=30
```

Retorna estructura de grilla con posiciones (fila, columna) para cada producto.

## 🎨 Frontend Integration

### React Native example

```javascript
// Fetch menú ordenado
const response = await fetch(
  'http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7'
);
const menu = await response.json();

// Renderizar grid
<View style={styles.grid}>
  {menu.productos.map((producto) => {
    const posicion = menu.posiciones[producto.id];
    return (
      <ProductCard
        key={producto.id}
        producto={producto}
        fila={posicion.fila}
        columna={posicion.columna}
        score={producto.scorePopularidad}
      />
    );
  })}
</View>
```

### Estilos CSS Grid (Web)

```css
.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
}

.producto-card {
  /* Auto-placement por orden del DOM */
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Badge de popularidad */
.popularity-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff6b00, #ff9500);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
```

## 🔄 Actualización Dinámica

Después de registrar una venta, el sistema puede actualizar el score del producto:

```java
// Después de confirmar venta
ProductoPopularidadDTO productoActualizado = 
    PopularityAlgorithm.actualizarDespuesDeVenta(productoActual);

// El score se recalculará en la próxima solicitud al backend
// o puedes actualizar el cache manualmente
```

## ⚙️ Configuración

Parámetros ajustables en `PopularityAlgorithm.java`:

```java
// Pesos de cada factor (línea 35-40)
factorFrecuencia = Math.log1p(frecuenciaVenta) * 20;      // Cambiar 20
factorCantidad = Math.log1p(cantidadTotal) * 15;          // Cambiar 15
factorIngreso = Math.log1p(ingresoDouble) * 10;           // Cambiar 10
factorRecencia = calcularFactorRecencia(ultimaVenta) * 25;// Cambiar 25
factorTendencia = Math.tanh(tendencia) * 30;              // Cambiar 30

// Semivida de recencia (línea 70)
double factor = Math.exp(-minutosDesdeUltimaVenta / 480.0); // 480 = 8 horas
```

### Casos de uso para ajustes:

| Caso | Ajuste | Razón |
|------|--------|-------|
| Menú pequeño (< 20 productos) | Aumentar pesos | Para más diferenciación |
| Menú grande (> 100 productos) | Reducir pesos | Para más estabilidad |
| Bebidas rápidas | ⬆ Recencia | Priorizar ventas recientes |
| Comidas lentas | ⬆ Frecuencia | Priorizar clientes regulares |
| Productos estacionales | ⬆ Tendencia | Resaltar productos en alza |

## 📊 Ejemplo de Cálculo

Supón que el Café Espreso tiene:

```
frecuenciaVenta = 156 (se vendió 156 veces en 7 días)
cantidadTotal = 312 (312 unidades vendidas)
ingresoTotal = 7800 ($ 7800 generados)
ultimaVenta = hace 2 horas (120 minutos)
tendencia = 0.15 (15% en alza respecto a período anterior)
```

**Cálculo:**

```
factorFrecuencia = ln(1 + 156) × 20 = 5.06 × 20 = 101.2
factorCantidad = ln(1 + 312) × 15 = 5.75 × 15 = 86.25
factorIngreso = ln(1 + 7800) × 10 = 8.96 × 10 = 89.6
factorRecencia = exp(-120/480) × 25 = 0.778 × 25 = 19.45
factorTendencia = tanh(0.15) × 30 = 0.149 × 30 = 4.47

scoreRaw = 101.2 + 86.25 + 89.6 + 19.45 + 4.47 = 300.97

scoreNormalizado = 100 / (1 + exp(-300.97/50))
                 = 100 / (1 + exp(-6.019))
                 = 100 / 1.0025
                 ≈ 99.75 → Redondeado a 99.75
```

## 🚀 Casos de Uso

### 1. POS con menú visual
El personal de caja ve siempre los productos más vendidos en posiciones privilegiadas.

### 2. Recomendaciones para clientes
"Lo más popular hoy" destaca automáticamente.

### 3. Optimización de inventario
Productos con menor score pueden necesitar promoción.

### 4. Análisis de tendencias
Detecta qué está en alza o baja en tiempo real.

### 5. Pruebas A/B
Compara layouts (3 columnas vs 4) midiendo velocidad de venta.

## 🔍 Debugging

### Cómo revisar los scores

```bash
# Obtener estadísticas detalladas
curl 'http://localhost:8080/api/v1/menu/estadisticas?diasAnalizar=7'

# Obtener solo top 3
curl 'http://localhost:8080/api/v1/menu/top?limite=3&diasAnalizar=7'
```

### Logs en desarrollo

En `MenuPopularidadService.java`, agrega logs:

```java
log.info("Producto: {}, Score: {}, Frecuencia: {}",
    producto.getNombre(),
    score,
    frecuencia);
```

## 🎓 Matemáticas Detrás del Score

### Función Sigmoide (normalización final)
```
sigmoid(x) = 100 / (1 + e^(-x/50))
```

Ventajas:
- Suaviza extremos (previene outliers)
- Siempre retorna valor entre 0-100
- S-curve natural para popularidad

### Logaritmo Natural (evita dominancia)
```
ln(1 + x)
```

Sin logaritmo: Producto con 100 ventas dominaría a uno con 10.
Con logaritmo: La diferencia es más sutil y realista.

### Factor de Recencia (decay exponencial)
```
e^(-t/λ)
```
Donde:
- `t` = minutos desde última venta
- `λ` = 480 minutos (semivida de 8h)

Simula la "frescura" de un producto: mientras más reciente, más relevante.

## ✅ Checklist de Implementación

- [ ] `PopularityAlgorithm.java` creado
- [ ] `ProductoPopularidadDTO.java` creado
- [ ] `MenuGrillaDTO.java` creado
- [ ] `ProductoEstadisticasAggregate.java` creado
- [ ] `MenuPopularidadService.java` creado
- [ ] `MenuPopularidadController.java` creado
- [ ] `VentaItemRepository.java` actualizado con nuevas queries
- [ ] Tests unitarios para algoritmo
- [ ] Tests de integración para endpoints
- [ ] Frontend actualizado para consumir endpoints
- [ ] Cache configurado para menuPopularidad
- [ ] Documentación Swagger activa

---

**Próximos pasos:**

1. Compilar y verificar que no hay errores
2. Ejecutar tests
3. Probar endpoints en Postman
4. Implementar en React Native
5. Ajustar pesos del algoritmo según KPIs reales
