# 📋 Ejemplos de Uso - Menú Dinámico por Popularidad

## Compilación y ejecución

### Compilar
```bash
cd backend
./mvnw clean compile
```

### Ejecutar
```bash
./start.sh
```

### Verificar que está corriendo
```bash
curl http://localhost:8080/actuator/health
# Respuesta: {"status":"UP"}
```

## 📡 Llamadas REST con cURL

### 1. Obtener menú completo ordenado por popularidad

```bash
curl -X GET "http://localhost:8080/api/v1/menu/ordenado?columnasGrid=3&diasAnalizar=7"
```

**Respuesta (ejemplo):**
```json
{
  "columnasGrid": 3,
  "posiciones": {
    "1": {
      "fila": 0,
      "columna": 0
    },
    "2": {
      "fila": 0,
      "columna": 1
    },
    "3": {
      "fila": 0,
      "columna": 2
    },
    "4": {
      "fila": 1,
      "columna": 0
    }
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Café Espreso",
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
    },
    {
      "id": 3,
      "nombre": "Croissant",
      "categoriaNombre": "Panadería",
      "precio": 45.00,
      "descripcion": "Croissant francés mantequilla",
      "frecuenciaVenta": 128,
      "cantidadVendida": 256,
      "ingresoTotal": 11520.00,
      "ultimaVenta": "2025-12-06T09:30:00",
      "scorePopularidad": 85.20
    },
    {
      "id": 4,
      "nombre": "Pan Integral",
      "categoriaNombre": "Panadería",
      "precio": 30.00,
      "descripcion": "Pan integral casero",
      "frecuenciaVenta": 95,
      "cantidadVendida": 190,
      "ingresoTotal": 5700.00,
      "ultimaVenta": "2025-12-06T08:15:00",
      "scorePopularidad": 78.40
    }
  ],
  "timestamp": "2025-12-06T12:00:00"
}
```

**Explicación del layout:**
```
┌──────────────────────────────┐
│ Café Espreso │ Capuchino │ Croissant │
├──────────────────────────────┤
│ Pan Integral │  (vacío)  │  (vacío)  │
└──────────────────────────────┘

Fila 0: Productos 1, 2, 3 (esquina superior izquierda)
Fila 1: Producto 4, seguido de espacios vacíos
```

### 2. Obtener top 5 productos más populares

```bash
curl -X GET "http://localhost:8080/api/v1/menu/top?limite=5&diasAnalizar=7"
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Café Espreso",
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
]
```

### 3. Obtener menú por categorías

```bash
curl -X GET "http://localhost:8080/api/v1/menu/por-categoria?columnasGrid=3&diasAnalizar=7"
```

**Respuesta (estructura de posiciones por categoría):**
```json
{
  "columnasGrid": 3,
  "posiciones": {
    "Bebidas": {
      "1": {"fila": 0, "columna": 0},
      "2": {"fila": 0, "columna": 1}
    },
    "Panadería": {
      "3": {"fila": 0, "columna": 0},
      "4": {"fila": 0, "columna": 1}
    }
  },
  "productos": [
    {
      "id": 1,
      "nombre": "Café Espreso",
      "categoriaNombre": "Bebidas",
      "scorePopularidad": 92.50
    },
    {
      "id": 2,
      "nombre": "Capuchino",
      "categoriaNombre": "Bebidas",
      "scorePopularidad": 88.75
    },
    {
      "id": 3,
      "nombre": "Croissant",
      "categoriaNombre": "Panadería",
      "scorePopularidad": 85.20
    },
    {
      "id": 4,
      "nombre": "Pan Integral",
      "categoriaNombre": "Panadería",
      "scorePopularidad": 78.40
    }
  ],
  "timestamp": "2025-12-06T12:00:00"
}
```

### 4. Obtener solo distribución en grilla (sin detalles de productos)

```bash
curl -X GET "http://localhost:8080/api/v1/menu/grilla?columnasGrid=4&diasAnalizar=30"
```

**Respuesta:**
```json
{
  "columnasGrid": 4,
  "posiciones": {
    "1": {"fila": 0, "columna": 0},
    "2": {"fila": 0, "columna": 1},
    "3": {"fila": 0, "columna": 2},
    "4": {"fila": 0, "columna": 3},
    "5": {"fila": 1, "columna": 0},
    "6": {"fila": 1, "columna": 1}
  },
  "productos": [...],
  "timestamp": "2025-12-06T12:00:00"
}
```

### 5. Obtener estadísticas detalladas

```bash
curl -X GET "http://localhost:8080/api/v1/menu/estadisticas?diasAnalizar=7"
```

Retorna todos los productos con sus estadísticas completas (sin limit).

## 🧪 Pruebas en Postman

### Crear collection

1. **Abre Postman**
2. **New → Collection → Menú Dinámico**

### Agregar requests

#### Request 1: Menú Ordenado
- **Método:** GET
- **URL:** `http://localhost:8080/api/v1/menu/ordenado`
- **Params:**
  - Key: `columnasGrid`, Value: `3`
  - Key: `diasAnalizar`, Value: `7`
- **Click "Send"**

#### Request 2: Top Productos
- **Método:** GET
- **URL:** `http://localhost:8080/api/v1/menu/top`
- **Params:**
  - Key: `limite`, Value: `10`
  - Key: `diasAnalizar`, Value: `7`

#### Request 3: Por Categoría
- **Método:** GET
- **URL:** `http://localhost:8080/api/v1/menu/por-categoria`
- **Params:**
  - Key: `columnasGrid`, Value: `3`
  - Key: `diasAnalizar`, Value: `7`

## 💻 Uso en código Java

### Inyectar servicio en un controller

```java
@RestController
@RequestMapping("/mi-endpoint")
public class MiController {

    @Autowired
    private MenuPopularidadService menuService;

    @GetMapping("/mostrar-menu")
    public ResponseEntity<MenuGrillaDTO> mostrarMenu() {
        // Obtener menú con 3 columnas, análisis de 7 días
        MenuGrillaDTO menu = menuService.obtenerMenuOrdenado(3, 7, false);
        
        // Opcional: log de depuración
        menu.productos().forEach(p -> 
            System.out.println(p.nombre() + ": " + p.scorePopularidad())
        );
        
        return ResponseEntity.ok(menu);
    }

    @GetMapping("/top-ventas")
    public ResponseEntity<List<ProductoPopularidadDTO>> obtenerTopVentas() {
        List<ProductoPopularidadDTO> top = menuService.obtenerTopProductos(15, 30);
        return ResponseEntity.ok(top);
    }
}
```

### Usar en servicio

```java
@Service
public class MiServicio {

    @Autowired
    private MenuPopularidadService menuService;

    public void procesarMenuDinamico() {
        // Obtener productos populares
        List<ProductoPopularidadDTO> populares = 
            menuService.obtenerTopProductos(5, 7);

        // Procesarlos
        populares.forEach(p -> {
            System.out.println("Producto: " + p.nombre());
            System.out.println("Score: " + p.scorePopularidad());
            System.out.println("Ventas: " + p.cantidadVendida());
            System.out.println("---");
        });
    }
}
```

## 🎨 Frontend - React Native

### Hook para obtener menú

```javascript
import { useState, useEffect } from 'react';

export const useMenuPopularidad = (columnasGrid = 3, diasAnalizar = 7) => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/menu/ordenado?columnasGrid=${columnasGrid}&diasAnalizar=${diasAnalizar}`
        );
        const data = await response.json();
        setMenu(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [columnasGrid, diasAnalizar]);

  return { menu, loading, error };
};
```

### Componente para renderizar

```javascript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useMenuPopularidad } from './hooks/useMenuPopularidad';

export const MenuGrilla = () => {
  const { menu, loading, error } = useMenuPopularidad(3, 7);

  if (loading) return <Text>Cargando menú...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {menu.productos.map((producto) => {
          const posicion = menu.posiciones[producto.id];
          return (
            <View key={producto.id} style={styles.card}>
              {/* Card del producto */}
              <Text style={styles.nombre}>{producto.nombre}</Text>
              <Text style={styles.precio}>${producto.precio}</Text>
              
              {/* Badge de popularidad */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  ⭐ {producto.scorePopularidad.toFixed(0)}
                </Text>
              </View>

              {/* Info de ventas */}
              <Text style={styles.stats}>
                {producto.cantidadVendida} vendidas
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: '30%',
    margin: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  precio: {
    fontSize: 16,
    color: '#ff6b00',
    marginVertical: 5,
  },
  badge: {
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stats: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
```

## 📊 Parámetros recomendados según caso

| Caso | columnasGrid | diasAnalizar | Razón |
|------|--------------|--------------|-------|
| **POS Escritorio** | 4-5 | 7 | Más espacio, datos recientes |
| **POS Móvil** | 2-3 | 7 | Pantalla pequeña |
| **Dashboard** | 3 | 30 | Vista general mes |
| **Análisis** | 1 | 90 | Solo ranking |
| **Promoción diaria** | 3 | 1 | Lo más vendido hoy |

## 🔍 Debugging

### Ver logs en desarrollo

```bash
# Ejecutar backend con debug
cd backend
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Ddebug"
```

### Verificar queries en BD

```sql
-- ¿Cuántas ventas tiene cada producto en los últimos 7 días?
SELECT 
    p.id,
    p.nombre,
    COUNT(DISTINCT vi.venta_id) as frecuencia,
    SUM(vi.cantidad) as cantidad_total,
    SUM(vi.subtotal) as ingreso_total
FROM productos p
LEFT JOIN ventas_items vi ON p.id = vi.producto_id
LEFT JOIN ventas v ON vi.venta_id = v.id
WHERE v.fecha >= NOW() - INTERVAL 7 DAY
    AND v.estado IN ('cerrada', 'PAGADA')
GROUP BY p.id, p.nombre
ORDER BY ingreso_total DESC;
```

## ✅ Verificación rápida

```bash
# 1. ¿Endpoint responde?
curl http://localhost:8080/api/v1/menu/ordenado -w "\nStatus: %{http_code}\n"

# 2. ¿Hay datos?
curl http://localhost:8080/api/v1/menu/top?limite=1 | jq '.[] | .nombre'

# 3. ¿Scores son razonables?
curl http://localhost:8080/api/v1/menu/ordenado | jq '.productos[] | {nombre, score: .scorePopularidad}'

# 4. ¿Posiciones son correctas?
curl http://localhost:8080/api/v1/menu/grilla?columnasGrid=3 | jq '.posiciones'
```

---

**Próximo:** Lee `GUIA-RAPIDA-MENU-DINAMICO.md` para guía resumida.
