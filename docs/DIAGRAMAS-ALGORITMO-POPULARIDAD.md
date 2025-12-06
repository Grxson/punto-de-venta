# 📊 Diagramas del Algoritmo de Menú Dinámico

## 1. Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUNTO DE VENTA - MENÚ DINÁMICO               │
└─────────────────────────────────────────────────────────────────┘

                           CICLO DE VIDA
                           
┌──────────────┐
│   Base de    │
│   Datos:     │
│   Ventas     │◄─────────────────┐
│   VentasItems│                  │
└──────────────┘         ┌────────┴──────────┐
      │                  │                   │
      │                  │ Estadísticas      │
      │                  │ de Venta          │
      │                  │                   │
      ▼                  ▼                   │
┌──────────────────────────────────────────┐│
│   MenuPopularidadService                 ││
│   • obtenerMenuOrdenado()                ││
│   • obtenerTopProductos()                ││
│   • calcularPopularidad()                ││
└──────────────────────────────────────────┘│
      │                  ▲                  │
      │                  └──────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│   PopularityAlgorithm                    │
│   • calcularScore()                      │
│   • calcularTendencia()                  │
│   • ordenarPorPopularidad()              │
│   • distribuirEnGrid()                   │
│   • distribuirPorCategoria()             │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│   MenuPopularidadController              │
│   GET /api/v1/menu/ordenado              │
│   GET /api/v1/menu/top                   │
│   GET /api/v1/menu/grilla                │
│   GET /api/v1/menu/por-categoria         │
│   GET /api/v1/menu/estadisticas          │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│   Frontend (React Native)                │
│   • Grilla de productos                  │
│   • Badges de popularidad                │
│   • Orden dinámico                       │
└──────────────────────────────────────────┘
      │
      ▼
   Usuario
```

## 2. Cálculo del Score de Popularidad

```
ENTRADA: Producto con datos de venta
   ↓
   ├─ Frecuencia (156 ventas)
   ├─ Cantidad (312 unidades)
   ├─ Ingreso ($7800)
   ├─ Última venta (hace 2h)
   └─ Tendencia (15% alza)
   
   ▼
┌────────────────────────────────────────┐
│         APLICAR FACTORES                │
├────────────────────────────────────────┤
│  factorFrecuencia = ln(157) × 20        │
│                  = 5.06 × 20 = 101.2   │
│                                         │
│  factorCantidad = ln(313) × 15          │
│                = 5.75 × 15 = 86.25     │
│                                         │
│  factorIngreso = ln(7801) × 10          │
│               = 8.96 × 10 = 89.6       │
│                                         │
│  factorRecencia = exp(-120/480) × 25    │
│                = 0.778 × 25 = 19.45    │
│                                         │
│  factorTendencia = tanh(0.15) × 30      │
│                 = 0.149 × 30 = 4.47    │
└────────────────────────────────────────┘
   ▼
┌────────────────────────────────────────┐
│         SUMAR TODOS LOS FACTORES        │
├────────────────────────────────────────┤
│  scoreRaw = 101.2 + 86.25 + 89.6        │
│           + 19.45 + 4.47                │
│           = 300.97                      │
└────────────────────────────────────────┘
   ▼
┌────────────────────────────────────────┐
│    NORMALIZAR CON FUNCIÓN SIGMOIDE      │
├────────────────────────────────────────┤
│  scoreNormalizado = 100 / (1 + e^(-x)) │
│  donde x = 300.97 / 50 = 6.019         │
│                                         │
│  = 100 / (1 + e^(-6.019))               │
│  = 100 / (1 + 0.0025)                  │
│  = 100 / 1.0025                        │
│  = 99.75                                │
└────────────────────────────────────────┘
   ▼
SALIDA: scorePopularidad = 92.50 ✅
```

## 3. Distribución en Grilla

```
ENTRADA: Lista de productos ordenados por score

SALIDA: Matriz de posiciones (fila, columna)

PROCESO CON 3 COLUMNAS:

Producto 1 (Score 92.50) → Índice 0
   fila = 0 / 3 = 0
   col = 0 % 3 = 0
   → Posición (0, 0) ← ESQUINA SUPERIOR IZQUIERDA

Producto 2 (Score 88.75) → Índice 1
   fila = 1 / 3 = 0
   col = 1 % 3 = 1
   → Posición (0, 1)

Producto 3 (Score 85.20) → Índice 2
   fila = 2 / 3 = 0
   col = 2 % 3 = 2
   → Posición (0, 2)

Producto 4 (Score 78.40) → Índice 3
   fila = 3 / 3 = 1
   col = 3 % 3 = 0
   → Posición (1, 0) ← SIGUIENTE FILA

...

RESULTADO VISUAL:

┌─────────────────────────┐
│ P1  │ P2  │ P3          │ Fila 0
│92.5 │88.7 │85.2         │
├─────────────────────────┤
│ P4  │ P5  │ P6          │ Fila 1
│78.4 │77.1 │75.9         │
├─────────────────────────┤
│ P7  │ P8  │ P9          │ Fila 2
│74.2 │72.5 │70.1         │
└─────────────────────────┘
```

## 4. Componentes del Score

```
PESO DE CADA FACTOR EN EL SCORE FINAL

Frecuencia (20%)      ████████░░░░░░░░░░░░ 
Cantidad (15%)        ██████░░░░░░░░░░░░░░░
Ingreso (10%)         ████░░░░░░░░░░░░░░░░░
Recencia (25%)        ██████████░░░░░░░░░░░  ← MÁS IMPORTANTE
Tendencia (30%)       ████████████░░░░░░░░░░ ← MÁS IMPORTANTE

TOTAL = 100%

INTERPRETACIÓN:
• Recencia + Tendencia = 55% del peso
  → Los productos vendidos recientemente y en alza destacan
  
• Frecuencia + Cantidad + Ingreso = 45% del peso
  → Base de popularidad histórica


EJEMPLO DE DISTRIBUCIÓN DE UN SCORE 92.50:

92.50 = 29.0 (Frecuencia)
      + 13.2 (Cantidad)
      +  8.8 (Ingreso)
      + 23.1 (Recencia)
      + 18.4 (Tendencia)
```

## 5. Factor de Recencia a través del tiempo

```
SEMIVIDA = 8 HORAS (480 minutos)

Hace 0 minutos:   █████████████████████ 100% ← Vendido AHORA
Hace 4 horas:     ███████████░░░░░░░░░░  70% ← Bastante reciente
Hace 8 horas:     ██████████░░░░░░░░░░░  50% ← SEMIVIDA
Hace 12 horas:    █████░░░░░░░░░░░░░░░░  35% ← Menos relevante
Hace 24 horas:    ██░░░░░░░░░░░░░░░░░░░  12% ← Poco relevante
Hace 48 horas:    ░░░░░░░░░░░░░░░░░░░░░   1% ← Casi irrelevante


FÓRMULA: factor = e^(-t/480) donde t = minutos

GRÁFICO:

100% ┤ ╱╲
     │╱  ╲
 80% ├    ╲
     │     ╲
 60% ├      ╲
     │       ╲
 40% ├        ╲___
     │            ╲__
 20% ├               ╲___
     │                   ╲___
  0% ├_______________________╲____
     └──────┬───────┬───────┬────
        8h  16h    24h    32h
     SEMIVIDA
```

## 6. Cálculo de Tendencia

```
COMPARACIÓN DE DOS PERÍODOS DE 7 DÍAS

Período antiguo (días 14-7):    100 unidades vendidas
Período reciente (días 7-0):    115 unidades vendidas

Tendencia = (115 - 100) / 100 = 0.15 (15% en alza)

FACTOR TENDENCIA = tanh(0.15) × 30 = 4.47 puntos

EJEMPLOS:

Tendencia +50% alza → factor = tanh(0.50) × 30 = 14.7
Tendencia ±0% estable → factor = tanh(0.00) × 30 = 0.0
Tendencia -50% baja → factor = tanh(-0.50) × 30 = -14.7

IMPACTO:
├─ En alza 50%: Suma +14.7 puntos
├─ Estable: Suma 0 puntos  
└─ En baja 50%: Resta 14.7 puntos
```

## 7. Flujo de API Request

```
CLIENT (React Native)
   │
   ▼
GET /api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7
   │
   ▼
MenuPopularidadController.obtenerMenuOrdenado()
   │
   ├─ Parámetros: columnasGrid=3, diasAnalizar=7
   │
   ▼
MenuPopularidadService.obtenerMenuOrdenado()
   │
   ├─ Busca productos base activos y disponibles
   │
   ├─ Para cada producto:
   │  │
   │  ├─ VentaItemRepository.obtenerEstadisticasProducto()
   │  │  → Frecuencia, cantidad, ingreso, última venta
   │  │
   │  └─ PopularityAlgorithm.calcularScore()
   │     → Score normalizado 0-100
   │
   ├─ PopularityAlgorithm.ordenarPorPopularidad()
   │  → Ordena descendente por score
   │
   ├─ PopularityAlgorithm.distribuirEnGrid()
   │  → Calcula posiciones (fila, columna)
   │
   └─ Construye MenuGrillaDTO
      │
      ▼
   JSON Response
      │
      ▼
CLIENT (React Native)
   │
   ├─ Renderiza grilla
   ├─ Muestra badges de score
   └─ Posiciona elementos por (fila, columna)
```

## 8. Matriz de Configuración

```
¿CÓMO AJUSTAR SEGÚN CASO DE USO?

BEBIDAS RÁPIDAS (café, agua):
┌─────────────────────────────────┐
│ Aumentar Recencia: 25 → 35      │ Priorizar reciente
│ Reducir Frecuencia: 20 → 15     │ Menos importancia a regularidad
└─────────────────────────────────┘

COMIDAS LENTAS (platos completos):
┌─────────────────────────────────┐
│ Aumentar Frecuencia: 20 → 30    │ Clientes regulares importan
│ Reducir Recencia: 25 → 15       │ No necesita ser reciente
└─────────────────────────────────┘

PRODUCTOS ESTACIONALES:
┌─────────────────────────────────┐
│ Aumentar Tendencia: 30 → 40     │ Detectar alza/baja
│ Aumentar Ingreso: 10 → 15       │ Priorizar ganancia
└─────────────────────────────────┘

MENÚ PEQUEÑO (< 20 productos):
┌─────────────────────────────────┐
│ Aumentar todos los pesos × 1.25 │ Más diferenciación
└─────────────────────────────────┘

MENÚ GRANDE (> 100 productos):
┌─────────────────────────────────┐
│ Reducir todos los pesos × 0.75  │ Más estabilidad
└─────────────────────────────────┘
```

## 9. Estructura de datos JSON

```
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
      "nombre": "Café Espreso",
      "categoriaNombre": "Bebidas",
      "precio": 25.00,
      "descripcion": "Café espresso italiano",
      "frecuenciaVenta": 156,        ← Veces vendido
      "cantidadVendida": 312,        ← Unidades
      "ingresoTotal": 7800.00,       ← Dinero
      "ultimaVenta": "2025-12-06T10:45:00",
      "scorePopularidad": 92.50      ← RESULTADO
    }
  ],
  
  "timestamp": "2025-12-06T12:00:00"
}
```

## 10. Estados posibles del algoritmo

```
┌──────────────────────────────────────────────────────┐
│           CICLO DE VIDA DEL SCORE                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  SIN DATOS                                           │
│  ├─ frecuenciaVenta = 0                             │
│  ├─ cantidadVendida = 0                             │
│  ├─ scorePopularidad = 0.00                         │
│  └─ Producto no aparece en menú                     │
│                                                      │
│              │                                       │
│              ▼                                       │
│                                                      │
│  POCAS VENTAS (1-10)                                │
│  ├─ scorePopularidad = 10-30                        │
│  ├─ Aparece al final del menú                       │
│  └─ Candidato a promoción                           │
│                                                      │
│              │                                       │
│              ▼                                       │
│                                                      │
│  MODERADAMENTE POPULAR (11-50)                      │
│  ├─ scorePopularidad = 30-70                        │
│  ├─ Posición media en menú                          │
│  └─ Producto equilibrado                            │
│                                                      │
│              │                                       │
│              ▼                                       │
│                                                      │
│  MUY POPULAR (50+)                                  │
│  ├─ scorePopularidad = 70-99                        │
│  ├─ Posición privilegiada (esquina sup-izq)        │
│  ├─ Genera ingresos altos                          │
│  └─ Monitorear tendencia (podría bajar)            │
│                                                      │
│              │                                       │
│              ▼                                       │
│                                                      │
│  ULTRA POPULAR (100+)                               │
│  ├─ scorePopularidad = 95-100                       │
│  ├─ Posición #1 en el menú                          │
│  ├─ Enfoque en posible competidor                  │
│  └─ Podría haber saturación                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

**Estos diagramas ayudan a visualizar cómo funciona el algoritmo en cada paso.**
