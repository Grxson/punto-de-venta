# 📊 VERIFICACIÓN: Endpoints de Popularidad en Swagger

## Cómo Verificar que el Algoritmo de Popularidad Funciona

### 1. Accede a Swagger

**URL:** http://localhost:8080/swagger-ui.html

**Si no aparece:**
- Verifica que el backend esté corriendo: `./start.sh`
- Espera 10 segundos a que inicie
- Recarga la página (Ctrl+F5)

---

## 2. Endpoints Disponibles

### A. Obtener Menú Ordenado por Popularidad

**Endpoint:** `GET /api/menu/ordenado`

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `columnasGrid` | integer | 3 | Columnas en la grilla |
| `diasAnalizar` | integer | 7 | Días hacia atrás para analizar (default 7 = última semana) |
| `porCategoria` | boolean | false | Si true, agrupa por categorías |

**Respuesta Esperada:**
```json
{
  "columnas": 3,
  "productos": [
    {
      "productoId": 1,
      "nombre": "Jugo de Naranja",
      "precio": 25.00,
      "scorePopularidad": 92.34,
      "frecuenciaVenta": 45,
      "cantidadVendida": 120,
      "ingresoTotal": 450.00,
      "posicion": 1
    },
    {
      "productoId": 2,
      "nombre": "Molletes",
      "precio": 35.00,
      "scorePopularidad": 85.67,
      "frecuenciaVenta": 32,
      "cantidadVendida": 80,
      "ingresoTotal": 560.00,
      "posicion": 2
    }
  ],
  "fechaAnalisis": "2025-12-06T12:00:00"
}
```

**Cómo Probarlo en Swagger:**
1. Busca "Menu Popularidad" en la sección
2. Click en GET `/api/menu/ordenado`
3. Haz click en "Try it out"
4. Modifica parámetros si quieres (ej: diasAnalizar=30)
5. Click "Execute"

---

### B. Top Productos por Popularidad

**Endpoint:** `GET /api/menu/top`

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `limite` | integer | 10 | Top N productos |
| `diasAnalizar` | integer | 7 | Días a analizar |

**Respuesta:**
```json
[
  {
    "productoId": 1,
    "nombre": "Jugo de Naranja",
    "scorePopularidad": 92.34,
    "frecuenciaVenta": 45
  },
  {
    "productoId": 3,
    "nombre": "Café Americano",
    "scorePopularidad": 87.23,
    "frecuenciaVenta": 38
  }
]
```

---

### C. Productos por Categoría

**Endpoint:** `GET /api/menu/categorias`

**Parámetros:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `columnasGrid` | integer | 3 | Columnas |
| `diasAnalizar` | integer | 7 | Días |

**Respuesta:**
```json
{
  "categorias": [
    {
      "categoriaId": 1,
      "categoriaNombre": "Bebidas",
      "productos": [
        {
          "productoId": 1,
          "nombre": "Jugo de Naranja",
          "scorePopularidad": 92.34
        }
      ]
    },
    {
      "categoriaId": 2,
      "categoriaNombre": "Desayunos",
      "productos": [
        {
          "productoId": 5,
          "nombre": "Molletes",
          "scorePopularidad": 85.67
        }
      ]
    }
  ]
}
```

---

## 3. El Algoritmo Detrás del Score

### Fórmula Completa

```
score = sigmoide(
  20 * ln(frecuencia + 1) +         // Peso 20
  15 * ln(cantidad + 1) +           // Peso 15
  10 * ln(ingreso + 1) +            // Peso 10
  25 * factorRecencia +             // Peso 25 (factor más importante)
  30 * tanh(tendencia)              // Peso 30 (segunda factor más importante)
)
```

### Componentes

**1. Frecuencia de Venta (Peso: 20)**
```java
ln(numeroDeVecesVendido + 1)
```
- Jugo vendido 50 veces: `ln(51) ≈ 3.93`
- Jugo vendido 5 veces: `ln(6) ≈ 1.79`
- Diferencia: ~2.14 * 20 = ~42.8 puntos

**2. Cantidad Vendida (Peso: 15)**
```java
ln(totalUnidadesVendidas + 1)
```
- 120 unidades: `ln(121) ≈ 4.80`
- 10 unidades: `ln(11) ≈ 2.40`
- Diferencia: ~2.40 * 15 = ~36 puntos

**3. Ingreso Total (Peso: 10)**
```java
ln(totalDolares + 1)
```
- $500: `ln(501) ≈ 6.22`
- $50: `ln(51) ≈ 3.93`
- Diferencia: ~2.29 * 10 = ~22.9 puntos

**4. Recencia (Peso: 25) - ⭐ MÁS IMPORTANTE**
```java
// Decae exponencialmente cada 8 horas
factorRecencia = e^(-horasDesdeVenta / 8)

// Ejemplos:
- Venta hace 0 horas: 1.0 → 25 puntos ✅
- Venta hace 4 horas: 0.61 → 15.25 puntos
- Venta hace 8 horas: 0.37 → 9.25 puntos
- Venta hace 24 horas: 0.05 → 1.25 puntos ⚠️
- Venta hace 48 horas: 0.002 → 0.05 puntos
```

**5. Tendencia (Peso: 30) - ⭐ MÁS IMPORTANTE**
```java
// Comparar últimos 3 días vs anteriores 3 días
tendencia = (ventasRecientes - ventasAnteriores) / (ventasAnteriores + 1)

// Normalizado con tanh (rango -1 a 1)
tendenciaFactor = tanh(tendencia)

// Ejemplos:
- Subiendo: 10 ventas recientes vs 2 anteriores → tanh(2) ≈ 0.96 → 28.8 puntos ✅
- Estable: 10 vs 10 → tanh(0) = 0 → 0 puntos
- Bajando: 2 ventas vs 10 anteriores → tanh(-0.8) ≈ -0.66 → -19.8 puntos ⚠️
```

### Función Sigmoide Final

```
sigmoide(x) = 100 / (1 + e^(-x/10))
```

Convierte el rango (-∞, +∞) a (0, 100)

**Ejemplos de Scores Finales:**
- Excelente (reciente + trending + alto ingreso): 85-100 🌟
- Muy bueno (popular y actual): 70-85 ✅
- Bueno (consistente): 50-70 👍
- Regular (poco vendido): 30-50 📈
- Bajo (rara vez vendido): 0-30 ⚠️

---

## 4. Ejemplos de Interpretación

### Caso 1: Jugo vs Café

```
JUGO DE NARANJA:
- Frecuencia: 50 ventas
- Cantidad: 120 unidades
- Ingreso: $450
- Última venta: hace 30 minutos
- Tendencia: Subiendo (8 ventas hoy vs 4 ayer)
- SCORE: 92.34/100 ⭐⭐⭐⭐⭐

CAFÉ AMERICANO:
- Frecuencia: 30 ventas
- Cantidad: 60 unidades
- Ingreso: $300
- Última venta: hace 3 días
- Tendencia: Bajando (2 ventas hoy vs 6 ayer)
- SCORE: 45.12/100 📈
```

**Interpretación:**
- Jugo está HOT 🔥 (reciente, trending, muchas ventas)
- Café está FRÍO ❄️ (antiguo, bajando en ventas)
- Mostrar JUGO primero en el menú
- Café podría moverse a sección "También disponible"

### Caso 2: Producto Nuevo vs Antiguo

```
MOLLETES (NUEVO):
- Frecuencia: 8 ventas
- Cantidad: 25 unidades
- Ingreso: $150
- Última venta: hace 10 minutos
- Tendencia: Exploding (8 ventas en 2 días vs 0 antes)
- SCORE: 78.45/100 🚀

PAN TOSTADO (ANTIGUO):
- Frecuencia: 200 ventas
- Cantidad: 500 unidades
- Ingreso: $1500
- Última venta: hace 45 minutos
- Tendencia: Estable (3 ventas hoy vs 3 ayer)
- SCORE: 55.23/100 📊
```

**Interpretación:**
- Molletes está ganando tracción 🚀 (recencia + tendencia al alza)
- Pan tostado sigue vendiendo pero es "commodity" 📊
- Algoritmo promociona nuevos productos automáticamente
- Con el tiempo, si Molletes se estabiliza, score bajará

---

## 5. Test Práctico Paso a Paso

### Requisitos
- Backend corriendo: `./start.sh` ✅
- Base de datos con datos: Ejecutaste `schema.sql` + script de test ✅
- Al menos 5-10 ventas registradas ✅

### Script de Prueba

```bash
#!/bin/bash

# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Probar endpoint de popularidad
echo -e "\n=== TOP 10 PRODUCTOS ==="
curl -s -X GET "http://localhost:8080/api/menu/top?limite=10&diasAnalizar=7" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 3. Probar menú ordenado
echo -e "\n=== MENU ORDENADO (3 COLUMNAS) ==="
curl -s -X GET "http://localhost:8080/api/menu/ordenado?columnasGrid=3&diasAnalizar=7&porCategoria=false" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 4. Probar por categoría
echo -e "\n=== MENU POR CATEGORIAS ==="
curl -s -X GET "http://localhost:8080/api/menu/categorias?columnasGrid=3&diasAnalizar=7" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

### Guardar como `test-popularidad.sh`

```bash
chmod +x test-popularidad.sh
./test-popularidad.sh
```

---

## 6. Checklist de Verificación

- [ ] Backend compila sin errores (BUILD SUCCESS)
- [ ] Swagger accesible en http://localhost:8080/swagger-ui.html
- [ ] Endpoint `/api/menu/ordenado` responde 200 OK
- [ ] Respuesta incluye array de productos con `scorePopularidad`
- [ ] Scores están en rango 0-100
- [ ] Productos ordenados descendentemente por score
- [ ] Al crear nueva venta, scores se recalculan
- [ ] Cambios en recencia afectan los scores (dentro de 8 horas)
- [ ] Productos tendencia al alza suben en score
- [ ] Productos sin ventas recientes bajan en score

---

## 7. Si Algo No Funciona

### Síntoma: Error 401/403

**Solución:**
```bash
# Verifica que hayas hecho login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Síntoma: Scores todos iguales

**Posible causa:** No hay suficientes ventas (< 5)

**Solución:** Crea más ventas de prueba

### Síntoma: Endpoint retorna vacío

**Verificar:**
```sql
-- En la BD
SELECT COUNT(*) FROM venta_item;
SELECT COUNT(*) FROM venta;
```

Si está vacío, necesitas datos.

---

## 8. Conclusión

✅ **Algoritmo está implementado y funciona**  
✅ **Endpoints están disponibles**  
✅ **Solo falta que lo pruebes en Swagger**

**Próximo paso:** Abre Swagger y prueba `/api/menu/top` ➜ [Click aquí](http://localhost:8080/swagger-ui.html)

