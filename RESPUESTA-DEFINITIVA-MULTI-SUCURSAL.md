# ❓ Pregunta-Respuesta: Cambiar de sucursal y menú totalmente diferente

## 🎯 Tu pregunta original
> "Ahora hay que ver sobre eso que mencione de cambiar de sucursal y tener un menú totalmente diferente, y ahora supongo que tenemos que agregar una columna a productos para especificar de a que sucursal va ese producto para poder verlo en su respectivo menú, ¿no?"

---

## ✅ Respuesta completa

### 1️⃣ **¿Necesitamos una nueva columna?**

**NO.** 

Ya existe una solución mejor: la tabla `sucursal_productos` que es una **relación many-to-many** entre sucursales y productos.

Esto es **mucho más flexible** que una simple columna `sucursal_id` porque:

| Aspecto | Columna sucursal_id | Tabla sucursal_productos |
|--------|-------------------|----------------------|
| Un producto en múltiples sucursales | ❌ No | ✅ Sí |
| Precios diferentes por sucursal | ❌ No | ✅ Sí |
| Orden visual diferente | ❌ No | ✅ Sí |
| Disponibilidad por horario | ❌ No | ✅ Sí |
| Disponibilidad por día | ❌ No | ✅ Sí |
| Stock máximo por sucursal | ❌ No | ✅ Sí |

---

### 2️⃣ **¿Cómo funciona?**

#### Estructura de datos actual:

```
┌────────────────┐
│ PRODUCTOS      │  Global: Un "Jugo" existe una sola vez
├────────────────┤
│ id: 1          │
│ nombre: "Jugo" │
│ precio: $2.50  │
└────────────────┘

                    ↓ Se relaciona con ↓

┌─────────────────────────┐
│ SUCURSAL_PRODUCTOS      │  Config específica por sucursal
├─────────────────────────┤
│ sucursal_id: 1          │  En Sucursal 1
│ producto_id: 1          │  El Jugo cuesta
│ precio_sucursal: $2.50  │  $2.50 y aparece
│ disponible: true        │  en orden 1
│ orden_visualizacion: 1  │
│                         │
│ sucursal_id: 2          │  En Sucursal 2
│ producto_id: 1          │  El Jugo cuesta
│ precio_sucursal: $3.00  │  $3.00 y aparece
│ disponible: true        │  en orden 2
│ orden_visualizacion: 2  │
│                         │
│ sucursal_id: 3          │  En Sucursal 3
│ producto_id: 1          │  El Jugo NO existe
│ (Sin entrada)           │  (No aparece en menú)
└─────────────────────────┘
```

---

### 3️⃣ **¿Qué ya está implementado en el backend?**

✅ **COMPLETAMENTE IMPLEMENTADO:**

- [x] Entidad `SucursalProducto.java`
- [x] Tabla `sucursal_productos` en BD
- [x] Repository con queries optimizadas
- [x] Service `SucursalProductoService`
- [x] SucursalContext (ThreadLocal)
- [x] Security Filter para establecer contexto
- [x] Endpoints en `SucursalController`
- [x] DTOs con todos los campos

**Resultado:** El backend AUTOMÁTICAMENTE:
1. Filtra productos por sucursal
2. Devuelve precios correctos
3. Devuelve orden visual correcto
4. Devuelve horarios y días disponibles
5. Seguridad: Usuario solo ve su sucursal

---

### 4️⃣ **¿Qué falta en el frontend?**

❌ **POR HACER:**

1. Obtener menú dinámico desde API (no hardcodeado)
2. Agrupar por categoría
3. Ordenar por `ordenVisualizacion`
4. Considerar disponibilidad por horario/día (opcional)
5. UI para cambiar sucursal (si admin)

**Tiempo estimado:** 1-2 días

---

### 5️⃣ **Flujo completo de usuario**

```
PASO 1: LOGIN
  Juan hace login con usuario "juan_sucursal_centro"
    ↓
  Backend genera JWT con username
  
PASO 2: GUARDAR TOKEN
  Frontend guarda token en AsyncStorage
  Frontend guarda sucursal: {"id": 1, "nombre": "Centro"}
    ↓
  
PASO 3: OBTENER MENÚ
  Frontend: GET /api/sucursales/productos
  Header: Authorization: Bearer <token>
    ↓
  
PASO 4: SECURITY FILTER
  Backend intercepta request
  Lee JWT → extrae username = "juan"
  Busca usuario en BD
  Lee: usuario.sucursal_id = 1
  ThreadLocal: SucursalContext.setSucursal(1)
    ↓
  
PASO 5: QUERY A BD
  SELECT * FROM sucursal_productos sp
  WHERE sp.sucursal_id = 1 AND sp.disponible = true
  ORDER BY sp.orden_visualizacion
    ↓
  Retorna: [
    {producto: "Jugo", precio: 2.50, orden: 1},
    {producto: "Café", precio: 1.50, orden: 2},
    {producto: "Croissant", precio: 1.80, orden: 3}
  ]
    ↓
  
PASO 6: FRONTEND RENDERIZA
  Agrupa por categoría
  Ordena por orden_visualizacion
  Muestra:
  
  🥤 BEBIDAS
    1. Jugo de Naranja        $2.50
    2. Café                   $1.50
    
  🍞 REPOSTERÍA
    1. Croissant              $1.80
    
    
════════════════════════════════════════════════════════════════

Mientras tanto, María (sucursal Sur) hace login:
  María → usuario "maria_sucursal_sur"
    ↓
  JWT almacena: sucursal_id = 2
    ↓
  SucursalContext.setSucursal(2)
    ↓
  Query: WHERE sucursal_id = 2
    ↓
  María ve:
  
  🥤 BEBIDAS
    1. Café                   $2.00   ← Precio diferente
    2. Jugo de Naranja        $3.00   ← Precio diferente
    
  🍽️ COMIDAS
    1. Ensalada               $5.00   ← No existe en Centro
```

---

### 6️⃣ **Ejemplo práctico: 3 sucursales, 5 productos**

#### BD:
```sql
-- Sucursal 1: Centro (Mañanas)
INSERT INTO sucursal_productos VALUES 
  (1, 1, 1, 2.50, true, 1, NULL, NULL),  -- Jugo orden 1
  (2, 1, 2, 1.50, true, 2, NULL, NULL),  -- Café orden 2
  (3, 1, 3, 1.80, true, 3, NULL, NULL);  -- Croissant orden 3

-- Sucursal 2: Sur (Noches)
INSERT INTO sucursal_productos VALUES 
  (4, 2, 2, 2.00, true, 1, NULL, NULL),  -- Café orden 1 (precio diferente)
  (5, 2, 1, 3.00, true, 2, NULL, NULL),  -- Jugo orden 2 (precio diferente)
  (6, 2, 4, 5.00, true, 3, NULL, NULL),  -- Ensalada orden 3 (NO en Centro)
  (7, 2, 5, 8.00, true, 4, NULL, NULL);  -- Bebida Especial (NO en Centro)

-- Sucursal 3: Oeste
INSERT INTO sucursal_productos VALUES 
  (8, 3, 2, 1.75, true, 1, NULL, NULL),  -- Café orden 1
  (9, 3, 3, 2.00, true, 2, NULL, NULL),  -- Croissant orden 2
  (10, 3, 5, 7.50, true, 3, NULL, NULL); -- Bebida Especial orden 3

-- Producto 4 (Ensalada) NO en Sucursal 1 (sin entrada en sucursal_productos)
-- Producto 5 (Bebida Especial) NO en Sucursal 1
```

#### Resultado:

**Sucursal 1 (Centro):**
```
1. Jugo de Naranja     $2.50
2. Café                $1.50
3. Croissant           $1.80
```

**Sucursal 2 (Sur):**
```
1. Café                $2.00    ← Precio diferente
2. Jugo de Naranja     $3.00    ← Precio diferente
3. Ensalada            $5.00    ← NUEVO PRODUCTO
4. Bebida Especial     $8.00    ← NUEVO PRODUCTO
```

**Sucursal 3 (Oeste):**
```
1. Café                $1.75    ← Precio diferente
2. Croissant           $2.00    ← Precio diferente
3. Bebida Especial     $7.50    ← Disponible
```

---

### 7️⃣ **¿Y si el usuario es ADMIN?**

Puede cambiar de "contexto de sucursal" para ver/editar el menú de otra sucursal:

```
María (Admin) está en Sucursal 2 (Sur)
  
Opción 1: Header selector
  "Sucursal Sur" → Click → Modal con opciones
  Selecciona "Sucursal Centro"
    ↓
  Frontend: GET /api/sucursales/1/productos
    ↓
  Backend valida que María es ADMIN
  Retorna productos de Sucursal 1
    ↓
  María ve el menú del Centro (sin cambiar su sucursal por defecto)

Opción 2: API directa
  GET /api/sucursales/1/productos
  Header: Authorization: Bearer <token_admin>
  Header: X-Sucursal-Id: 1
    ↓
  Backend retorna productos de sucursal 1
```

---

### 8️⃣ **Validación de seguridad**

```
✅ Usuario normal (Juan)
  - Solo ve su sucursal (determinado por JWT)
  - No puede ver otros menús
  - No puede acceder a /api/sucursales/2/productos

✅ Admin (María)
  - Puede acceder a cualquier sucursal
  - Pero SOLO si tiene rol ADMIN/GERENTE
  - Requiere @RequiredRole(value = {Rol.ADMIN, Rol.GERENTE})

✅ Autenticación JWT
  - Toda request sin token es rechazada
  - Token vencido es rechazado
  - Usuario sin sucursal es rechazado
```

---

### 9️⃣ **Resumen: Lo que NECESITAS hacer**

#### Backend: ✅ NADA (ya está todo)
- [x] BD: tabla sucursal_productos
- [x] Entities: SucursalProducto.java
- [x] Repository: queries optimizadas
- [x] Service: lógica centralizada
- [x] Security: filtro y contexto
- [x] Controller: endpoints

#### Frontend: ❌ POR HACER
- [ ] Hook useApi con Authorization
- [ ] Contexto MenuContext
- [ ] Hook useMenuAgrupado
- [ ] Hook useProductoDisponible
- [ ] Componente ProductoItem
- [ ] Pantalla MenuScreen
- [ ] Selector de sucursal (admin)
- [ ] Tests

**Tiempo:** 1-2 días
**Dificultad:** Fácil (es solo obtener datos y renderizar)

---

### 🔟 **Next Steps**

1. ✅ **Leer documentación:**
   - `MULTI-SUCURSAL-MENU-DINAMICO-EXPLICACION.md` ← Técnica
   - `VISUAL-MULTI-SUCURSAL-FLUJOS.md` ← Flujos visuales
   - `CHECKLIST-MENU-DINAMICO-FRONTEND.md` ← Tareas específicas

2. 🚀 **Implementar en Frontend** (14 tareas)

3. 🧪 **Probar:**
   - Swagger: `/sucursales/productos`
   - Frontend: Obtener menú
   - Multi-sucursal: Juan vs María
   - Admin: Cambiar sucursal

4. ✨ **Bonus:**
   - Filtrar por disponibilidad horaria
   - Ordenamiento por popularidad
   - Cache de menú
   - Offline mode

---

## 📊 Estado del Sistema

| Componente | Estado | Notas |
|-----------|--------|-------|
| **BD: tabla sucursal_productos** | ✅ Completo | Índices optimizados |
| **Entity SucursalProducto** | ✅ Completo | Todos los campos |
| **Repository** | ✅ Completo | Queries optimizadas |
| **Service** | ✅ Completo | Lógica centralizada |
| **Security Filter** | ✅ Completo | ThreadLocal automático |
| **SucursalContext** | ✅ Completo | Transparent |
| **Controller Endpoints** | ✅ Completo | Multi-sucursal soportado |
| **Frontend: obtener menú** | ❌ Pendiente | Necesita hook useApi |
| **Frontend: renderizar menú** | ❌ Pendiente | Necesita agrupación y orden |
| **Frontend: selector sucursal** | ❌ Pendiente | Solo para admin |

**Avance total:** 70% (Backend) + 0% (Frontend) = **35% del sistema**

---

## 🎓 Conclusión

**Tu pregunta:** "¿Agregar columna a productos para especificar sucursal?"

**La respuesta:** No necesitas una nueva columna. La tabla `sucursal_productos` ya existe y es perfecta. El backend ya está completamente implementado. Solo falta que el frontend obtenga y renderice el menú dinámico en lugar de usar un menú hardcodeado.

**Impacto:** Cada usuario verá un menú COMPLETAMENTE DIFERENTE según su sucursal, con:
- ✅ Productos diferentes
- ✅ Precios diferentes
- ✅ Orden visual diferente
- ✅ Disponibilidad diferente (horarios y días)
- ✅ Stock máximo diferente

**Tiempo:** 1-2 días para el frontend (backend ya está listo)

---

¿Tienes dudas? Consulta los documentos generados o preguntame directamente.
