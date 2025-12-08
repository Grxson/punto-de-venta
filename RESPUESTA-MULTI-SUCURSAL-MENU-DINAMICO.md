# 📋 Respuesta a tu pregunta: "¿Agregar columna a productos para especificar sucursal?"

## La respuesta corta: NO es una nueva columna 🎯

Lo que ya está implementado es **mucho mejor que una simple columna**:

### ❌ Opción MALA: Una columna `sucursal_id` en `productos`
```sql
-- Malo porque:
productos (
    id, nombre, precio,
    sucursal_id  ← Un producto solo en una sucursal
)

-- Problema: Un producto solo puede estar en UNA sucursal
-- ¿Qué si quiero: Jugo en Sucursal 1 Y Sucursal 2 con precios diferentes?
```

### ✅ Opción BUENA: Tabla relacional `sucursal_productos` (YA IMPLEMENTADA)
```sql
sucursal_productos (
    id, sucursal_id, producto_id,
    precio_sucursal,        -- Precio específico de esta sucursal
    disponible,             -- ¿Mostrar en esta sucursal?
    orden_visualizacion,    -- Orden en el menú
    horario_disponibilidad, -- Disponible de 06:00 a 12:00
    dias_disponibilidad,    -- Disponible L-S
    ...
)

-- Ventajas:
-- ✓ Un producto puede estar en MÚLTIPLES sucursales
-- ✓ Cada sucursal puede tener PRECIOS DIFERENTES
-- ✓ Cada sucursal puede tener ORDEN DIFERENTE
-- ✓ Cada sucursal puede tener HORARIOS DIFERENTES
-- ✓ Flexible para cualquier configuración
```

---

## Ejemplo práctico: Jugo de Naranja

### Escenario
- **Sucursal 1** (Centro): Jugo de naranja $2.50, disponible L-V 6am-12pm
- **Sucursal 2** (Sur): Jugo de naranja $3.00, disponible L-D 6am-1pm
- **Sucursal 3**: No vende jugo de naranja

### Datos en BD
```sql
-- Tabla productos (global)
INSERT INTO productos VALUES (5, 'Jugo de Naranja', NULL, 'Bebida', 2.50, NULL, 'SKU-001', 1, 1);

-- Tabla sucursal_productos (config por sucursal)
INSERT INTO sucursal_productos VALUES (
    NULL, 1, 5,              -- Sucursal 1, Producto 5
    2.50,                    -- Precio
    1,                       -- Disponible
    1,                       -- Orden 1 en menú
    '{"inicio": "06:00", "fin": "12:00"}',  -- Horario
    '{"dias": [1,2,3,4,5]}'  -- Lunes-Viernes
);

INSERT INTO sucursal_productos VALUES (
    NULL, 2, 5,              -- Sucursal 2, Producto 5
    3.00,                    -- Precio diferente
    1,                       -- Disponible
    2,                       -- Orden 2 en menú (después del café)
    '{"inicio": "06:00", "fin": "13:00"}',  -- Horario más largo
    '{"dias": [1,2,3,4,5,6,7]}'  -- Todos los días
);

-- Sucursal 3 NO tiene entrada para producto 5
```

### Resultado: Menú diferente en cada sucursal

**Sucursal 1 (Centro):**
```
1. Jugo de Naranja - $2.50 (6am-12pm, L-V)
2. Café - $1.50 (todo el día)
3. Croissant - $1.80 (todo el día)
```

**Sucursal 2 (Sur):**
```
1. Café - $2.00 (todo el día)
2. Jugo de Naranja - $3.00 (6am-1pm, L-D)
3. Ensalada - $5.00 (12pm-8pm)
```

**Sucursal 3:**
```
1. Café - $1.50 (todo el día)
2. Croissant - $2.00 (todo el día)
3. Ensalada - $4.50 (todo el día)
```

---

## ✨ Ventajas de la implementación actual

| Aspecto | Tabla Relacional (Actual) | Una Columna sucursal_id |
|---------|---------------------------|------------------------|
| **Producto en múltiples sucursales** | ✅ Sí | ❌ No |
| **Precios diferentes** | ✅ Sí | ❌ No |
| **Orden diferente** | ✅ Sí | ❌ No |
| **Horarios diferentes** | ✅ Sí | ❌ No |
| **Deshabilitar en una sucursal** | ✅ Sí (sin borrar) | ❌ No |
| **Stock máximo por sucursal** | ✅ Sí | ❌ No |
| **Flexibilidad** | ✅ Muy alta | ❌ Nula |

---

## Lo que necesitas hacer en el FRONTEND

### 1. Obtener el menú al iniciar/cambiar sucursal

```typescript
// React Native ejemplo
const [menu, setMenu] = useState([]);

useEffect(() => {
  const fetchMenu = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(
      'http://localhost:8080/api/sucursales/productos',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const productos = await response.json();
    setMenu(productos);
  };

  fetchMenu();
}, []);
```

### 2. Renderizar agrupado por categoría y orden

```typescript
// Agrupar productos por categoría
const productosPorCategoria = menu.reduce((acc, producto) => {
  const categoria = producto.categoria || 'Sin categoría';
  if (!acc[categoria]) {
    acc[categoria] = [];
  }
  acc[categoria].push(producto);
  return acc;
}, {});

// Ordenar dentro de cada categoría
Object.keys(productosPorCategoria).forEach(categoria => {
  productosPorCategoria[categoria].sort((a, b) => 
    (a.ordenVisualizacion || 999) - (b.ordenVisualizacion || 999)
  );
});

// Renderizar
return (
  <ScrollView>
    {Object.entries(productosPorCategoria).map(([categoria, productos]) => (
      <View key={categoria}>
        <Text style={styles.categoriaTitle}>{categoria}</Text>
        {productos.map(producto => (
          <ProductoItem
            key={producto.id}
            nombre={producto.nombre}
            precio={producto.precioSucursal || producto.precio}
            disponible={producto.disponible}
          />
        ))}
      </View>
    ))}
  </ScrollView>
);
```

### 3. Considerar disponibilidad por horario (Opcional)

```typescript
const esDisponibleAhora = (producto) => {
  // Si no tiene restricciones, está disponible
  if (!producto.horarioDisponibilidad && !producto.diasDisponibilidad) {
    return true;
  }

  const ahora = new Date();
  
  // Verificar horario
  if (producto.horarioDisponibilidad) {
    const { inicio, fin } = JSON.parse(producto.horarioDisponibilidad);
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const [horaInicio, minInicio] = inicio.split(':').map(Number);
    const [horaFin, minFin] = fin.split(':').map(Number);
    const minDesdeInicio = horaInicio * 60 + minInicio;
    const minHastaFin = horaFin * 60 + minFin;
    
    if (horaActual < minDesdeInicio || horaActual > minHastaFin) {
      return false;
    }
  }

  // Verificar día de la semana (1=lunes, 7=domingo)
  if (producto.diasDisponibilidad) {
    const { dias } = JSON.parse(producto.diasDisponibilidad);
    const diaSemana = (ahora.getDay() + 6) % 7 + 1; // Convertir JS (0=domingo) a SQL (1=lunes)
    
    if (!dias.includes(diaSemana)) {
      return false;
    }
  }

  return true;
};

// Filtrar productos disponibles
const productosDisponibles = menu.filter(esDisponibleAhora);
```

### 4. Botón para cambiar sucursal (Admin)

```typescript
const [sucursal, setSucursal] = useState(null);
const [sucursales, setSucursales] = useState([]);
const [usuario, setUsuario] = useState(null);

// Al login, obtener usuario
const handleLogin = async (username, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  setUsuario(data.usuario);
  setSucursal(data.usuario.sucursal);
  await AsyncStorage.setItem('authToken', data.token);
  
  // Si es admin, cargar lista de sucursales
  if (data.usuario.rol === 'ADMIN' || data.usuario.rol === 'GERENTE') {
    cargarSucursales();
  }
};

// Admin puede cambiar sucursal (esto enviaría el header X-Sucursal-Id)
const cambiarSucursal = async (sucursalId) => {
  const token = await AsyncStorage.getItem('authToken');
  const response = await fetch(
    `http://localhost:8080/api/sucursales/${sucursalId}/productos`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const productos = await response.json();
  setSucursal({ id: sucursalId });
  setMenu(productos);
};
```

---

## Estado actual: ¿Qué falta?

### Backend ✅
- [x] Entidad `SucursalProducto` con todos los campos
- [x] Relación many-to-many funcional
- [x] Queries optimizadas en repository
- [x] Service con lógica de obtención
- [x] SucursalContext (ThreadLocal) para sucursal actual
- [x] Filter de seguridad para establecer contexto
- [x] Endpoints en controller

### Frontend ❌
- [ ] Obtener menú dinámico al iniciar app
- [ ] Filtrar por categoría y ordenar
- [ ] Considerar disponibilidad por horario/día (opcional)
- [ ] UI para cambiar sucursal (si admin)
- [ ] Mostrar el precio correcto de la sucursal

---

## 🔍 Para verificar que todo está funccionando

### 1. Verificar BD
```sql
-- Ver sucursales con productos
SELECT sp.id, s.nombre, p.nombre, sp.precio_sucursal, sp.disponible
FROM sucursal_productos sp
JOIN sucursales s ON sp.sucursal_id = s.id
JOIN productos p ON sp.producto_id = p.id
LIMIT 20;
```

### 2. Probar endpoint
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."  # Token de un usuario

curl -X GET http://localhost:8080/api/sucursales/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

# Debería retornar array de ProductoSucursalDTO con todos los campos
```

### 3. Ver swagger
```
http://localhost:8080/swagger-ui.html
Buscar: "SucursalController"
```

---

## 🎯 Resumen ejecutivo

**Pregunta:** ¿Hay que agregar columna a productos para especificar sucursal?

**Respuesta:** No, es mejor la forma que ya está. Se usa una tabla relacional `sucursal_productos` que permite:
1. ✅ Mismo producto en múltiples sucursales
2. ✅ Precios diferentes
3. ✅ Orden visual diferente
4. ✅ Horarios diferentes
5. ✅ Flexibilidad total

**Lo que falta:** Que el frontend obtenga y renderice el menú dinámico en lugar de uno hardcodeado.
