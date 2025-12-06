# 🚀 Guía Rápida: Menú Dinámico por Popularidad

## Resumen ejecutivo

Sistema que **reordena automáticamente el menú** basándose en qué tan populares son los productos (ventas, frecuencia, ingresos). Los productos más vendidos aparecen en **primer lugar (esquina superior izquierda)** y se distribuyen en una **grilla de izquierda a derecha, arriba hacia abajo**.

## 📦 Archivos añadidos

| Archivo | Ubicación | Propósito |
|---------|-----------|----------|
| `PopularityAlgorithm.java` | `util/` | Algoritmo core de cálculo |
| `ProductoPopularidadDTO.java` | `dto/` | DTO con score |
| `MenuGrillaDTO.java` | `dto/` | Respuesta de grilla |
| `ProductoEstadisticasAggregate.java` | `dto/aggregate/` | Agregado de estadísticas |
| `MenuPopularidadService.java` | `service/` | Orquestador del algoritmo |
| `MenuPopularidadController.java` | `controller/` | Endpoints REST |
| `ALGORITMO-POPULARIDAD-MENU.md` | `docs/` | Documentación completa |

## 📝 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `VentaItemRepository.java` | Añadidos 2 métodos: `obtenerEstadisticasProducto()` y `obtenerEstadisticasTodos()` |

## 🔨 Instalación / Compilación

### 1. Verificar que Java 21 y Maven estén disponibles
```bash
java -version  # Debe mostrar Java 21
./mvnw --version
```

### 2. Compilar el backend
```bash
cd backend
./mvnw clean compile
```

### 3. Ejecutar el backend
```bash
./start.sh
```

### 4. Verificar que los endpoints estén disponibles
```bash
curl http://localhost:8080/api/v1/menu/ordenado
```

## 📡 Endpoints disponibles

### 1️⃣ Menú ordenado completo
```bash
GET /api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7
```

**Retorna:** Todos los productos ordenados por popularidad con posiciones en grilla.

### 2️⃣ Menú por categoría
```bash
GET /api/v1/menu/por-categoria?columnasGrid=3&diasAnalizar=7
```

**Retorna:** Productos agrupados por categoría, cada grupo en su propia grilla.

### 3️⃣ Top N productos
```bash
GET /api/v1/menu/top?limite=10&diasAnalizar=7
```

**Retorna:** Solo los 10 productos más populares.

### 4️⃣ Distribución en grilla
```bash
GET /api/v1/menu/grilla?columnasGrid=3&diasAnalizar=7
```

**Retorna:** Estructura de posiciones (fila, columna) para cada producto.

### 5️⃣ Estadísticas detalladas
```bash
GET /api/v1/menu/estadisticas?diasAnalizar=7
```

**Retorna:** Todos los productos con scores y estadísticas.

## 🧮 Cómo funciona el algoritmo

### Score de Popularidad = f(5 factores)

```
┌─────────────────────────────────────────────────────┐
│ Score (0-100)                                       │
├─────────────────────────────────────────────────────┤
│ = 20% Frecuencia (¿cuántas veces se vendió?)       │
│ + 15% Cantidad (¿cuántas unidades?)                │
│ + 10% Ingreso (¿cuánto dinero?)                    │
│ + 25% Recencia (¿qué tan reciente?)                │
│ + 30% Tendencia (¿va en alza o baja?)              │
└─────────────────────────────────────────────────────┘
```

### Distribución en Grilla

```
3 columnas
┌───┬───┬───┐
│ 1 │ 2 │ 3 │  Fila 0
├───┼───┼───┤
│ 4 │ 5 │ 6 │  Fila 1
├───┼───┼───┤
│ 7 │ 8 │ 9 │  Fila 2
└───┴───┴───┘
Col 0 1 2
```

Los números representan orden de popularidad (1 = más popular).

## 💻 Ejemplo de uso en código

### Backend (Java)

```java
// Inyectar servicio
@Autowired
private MenuPopularidadService menuService;

// Obtener menú ordenado
MenuGrillaDTO menu = menuService.obtenerMenuOrdenado(3, 7, false);

// Iterar productos
for (ProductoPopularidadDTO producto : menu.productos()) {
    System.out.println(producto.nombre() + ": " + producto.scorePopularidad());
}

// Obtener top 5
List<ProductoPopularidadDTO> top5 = menuService.obtenerTopProductos(5, 7);
```

### Frontend (React Native)

```javascript
// Fetch menú
const response = await fetch(
  'http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7'
);
const menu = await response.json();

// Renderizar
<View style={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row'}}>
  {menu.productos.map((producto, i) => (
    <ProductoCard
      key={producto.id}
      nombre={producto.nombre}
      precio={producto.precio}
      score={producto.scorePopularidad}
      posicion={i + 1}
    />
  ))}
</View>
```

## ⚙️ Parámetros configurables

### En `PopularityAlgorithm.java`

```java
// Pesos de factores (línea 35-40)
factorFrecuencia = Math.log1p(frecuenciaVenta) * 20;      // ← Cambiar aquí
factorCantidad = Math.log1p(cantidadTotal) * 15;
factorIngreso = Math.log1p(ingresoDouble) * 10;
factorRecencia = calcularFactorRecencia(ultimaVenta) * 25;
factorTendencia = Math.tanh(tendencia) * 30;

// Semivida de recencia (8 horas = 480 minutos)
double factor = Math.exp(-minutosDesdeUltimaVenta / 480.0); // ← Cambiar aquí
```

### Recomendaciones de ajuste

| Escenario | Cambio |
|-----------|--------|
| Menú pequeño | Aumentar todos los pesos (20→25) |
| Menú grande | Reducir todos los pesos (20→15) |
| Bebidas rápidas | Aumentar Recencia (25→35) |
| Comidas lentas | Aumentar Frecuencia (20→30) |
| Productos estacionales | Aumentar Tendencia (30→40) |

## 🧪 Testing

### Test manual con curl

```bash
# Menú ordenado
curl -X GET "http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3" | jq .

# Top 5 productos
curl -X GET "http://localhost:8080/api/v1/menu/top?limite=5&diasAnalizar=30" | jq .

# Solo en últimos 7 días
curl -X GET "http://localhost:8080/api/v1/menu/estadisticas?diasAnalizar=7" | jq .
```

### Con Postman

1. Abre Postman
2. Crea request `GET http://localhost:8080/api/v1/menu/ordenado`
3. Parámetros:
   - `columnasGrid` = 3
   - `diasAnalizar` = 7
4. Click "Send"

## 📊 Estructura de respuesta

```json
{
  "columnasGrid": 3,
  "posiciones": {
    "1": {"fila": 0, "columna": 0},
    "2": {"fila": 0, "columna": 1},
    "3": {"fila": 0, "columna": 2}
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Café Espreso",
      "categoriaNombre": "Bebidas",
      "precio": 25.00,
      "descripcion": "Café expresso italiano",
      "frecuenciaVenta": 156,
      "cantidadVendida": 312,
      "ingresoTotal": 7800.00,
      "ultimaVenta": "2025-12-06T10:45:00",
      "scorePopularidad": 92.50
    }
  ],
  "timestamp": "2025-12-06T12:00:00"
}
```

## 🎨 Diseño de UI/UX

### Mostrar badge de popularidad

```jsx
<div style={{
  position: 'relative',
  width: '100px',
  height: '100px'
}}>
  <img src={producto.imagen} />
  <div style={{
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ff6b00',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  }}>
    ⭐ {producto.scorePopularidad.toFixed(0)}
  </div>
</div>
```

## 🐛 Troubleshooting

### Error: "Method obtenerEstadisticasProducto not found"
- **Causa:** VentaItemRepository no fue actualizado
- **Solución:** Asegúrate de copiar los nuevos métodos al repositorio

### Error: "No mapping found for GET /api/v1/menu/..."
- **Causa:** MenuPopularidadController no está siendo scaneado
- **Solución:** Verifica que esté en `com.puntodeventa.backend.controller`

### Scores muy bajos (< 10)
- **Causa:** Pocos datos de venta en BD
- **Solución:** Aumentar `diasAnalizar` o generar datos de prueba

### Query lenta en estadísticas
- **Causa:** Índices en BD no optimizados
- **Solución:** Asegúrate que `ventas_items.producto_id` tenga índice

## 📚 Documentación completa

Lee `docs/ALGORITMO-POPULARIDAD-MENU.md` para:
- Matemáticas detalladas
- Fórmulas de cada factor
- Ejemplos de cálculo paso a paso
- Casos de uso avanzados
- Debugging profundo

## ✅ Checklist de validación

- [ ] Proyecto compila sin errores
- [ ] Endpoint `/api/v1/menu/ordenado` retorna datos
- [ ] Productos están ordenados por score (descendente)
- [ ] Posiciones en grilla son correctas (0,0 primero)
- [ ] Frontend consume el endpoint correctamente
- [ ] UI muestra badge de popularidad
- [ ] Cache funciona (responses más rápidas)

## 🎯 Próximos pasos

1. ✅ Compilar y validar
2. ✅ Probar endpoints
3. ✅ Integrar en React Native
4. ✅ Ajustar pesos según datos reales
5. ✅ Monitorear performance
6. ✅ Recopilar feedback de usuarios

---

**¿Preguntas?** Consulta `docs/ALGORITMO-POPULARIDAD-MENU.md` para detalles completos.
