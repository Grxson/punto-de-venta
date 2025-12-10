# Plan de Implementación: Variantes Multi-Paso con Atributos

## 📌 Descripción General

Sistema de selección multi-paso para productos con variantes y atributos:
- **Paso 1**: Seleccionar variante/tamaño base (ej: "Jugo Verde")
- **Paso 2**: Seleccionar tamaño (ej: "Pequeño, Mediano, Grande")
- **Paso 3**: Seleccionar atributos/componentes (ej: ingredientes: "Naranja, Zanahoria")
- **Paso 4**: Confirmar y agregar al carrito

Se implementa tanto en **Cliente (MenuScreen)** como en **Admin (AdminProductos)**.

---

## 🏗️ Arquitectura General

### Backend (Java 21 + Spring Boot)

```
Modelo Actual:
Producto (base)
├── variantes (Jugo Verde, Jugo Rojo, etc.)
└── nombreVariante

Cambio Propuesto:
Producto (base)
├── variantes []
│   ├── nombreVariante: "Jugo Verde"
│   ├── tamaños [] (relación muchos-a-muchos)
│   │   ├── nombre: "Pequeño"
│   │   ├── precio_extra: 0
│   │   └── orden: 1
│   └── atributos [] (relación muchos-a-muchos)
│       ├── nombre: "Ingrediente"
│       ├── esMultiseleccion: true
│       ├── requerido: true
│       ├── opciones []
│       │   ├── nombre: "Naranja"
│       │   ├── precio_extra: 0
│       │   └── orden: 1
│       └── orden: 1
```

### Base de Datos

**Nuevas Tablas:**

1. `producto_tamaño` - Define los tamaños disponibles
   - `id` PK
   - `nombre` VARCHAR(100)
   - `descripcion` TEXT
   - `precio_extra` DECIMAL(12,2)
   - `orden` INT
   - `activo` BOOLEAN

2. `producto_variante_tamaño` - Relación M-M
   - `id` PK
   - `producto_id` FK (variante/subproducto)
   - `tamaño_id` FK
   - `orden` INT

3. `producto_atributo` - Define atributos (ingredientes, opciones, etc.)
   - `id` PK
   - `producto_id` FK (variante/subproducto)
   - `nombre` VARCHAR(100) - "Ingrediente", "Salsa", "Complemento"
   - `tipo` ENUM - SIMPLE|MULTIPLE (univalorado o multivaluado)
   - `requerido` BOOLEAN
   - `orden` INT
   - `activo` BOOLEAN

4. `producto_atributo_opcion` - Opciones del atributo
   - `id` PK
   - `atributo_id` FK
   - `nombre` VARCHAR(100)
   - `precio_extra` DECIMAL(12,2)
   - `orden` INT
   - `activo` BOOLEAN

### DTOs (Java 21 Records)

```java
// ProductoDTO - incluir nuevas propiedades
public record ProductoDTO(
    Long id,
    String nombre,
    String descripcion,
    Long categoriaId,
    String categoriaNombre,
    BigDecimal precio,
    BigDecimal costoEstimado,
    String sku,
    Boolean activo,
    Boolean disponibleEnMenu,
    List<VarianteDTO> variantes,
    Long productoBaseId,
    String nombreVariante,
    Integer ordenVariante,
    List<TamañoDTO> tamaños,           // NUEVO
    List<AtributoDTO> atributos        // NUEVO
) {
    public record VarianteDTO(
        Long id,
        String nombre,
        String nombreVariante,
        BigDecimal precio,
        Integer ordenVariante,
        List<TamañoDTO> tamaños,        // NUEVO
        List<AtributoDTO> atributos     // NUEVO
    ) {}
    
    public record TamañoDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precioExtra,
        Integer orden
    ) {}
    
    public record AtributoDTO(
        Long id,
        String nombre,
        String tipo,                    // SIMPLE|MULTIPLE
        Boolean requerido,
        Integer orden,
        List<OpcionDTO> opciones
    ) {
        public record OpcionDTO(
            Long id,
            String nombre,
            BigDecimal precioExtra,
            Integer orden
        ) {}
    }
}

// DTO para respuesta del carrito con selecciones
public record CarritoItemDTO(
    Long id,
    ProductoDTO producto,
    Long varianteId,                   // ID de la variante seleccionada
    Long tamañoId,                     // ID del tamaño
    Map<Long, List<Long>> atributosSeleccionados,  // atributoId -> [opcionIds]
    Integer cantidad,
    BigDecimal precioUnitario,
    BigDecimal subtotal
) {}
```

### Endpoints Nuevos/Actualizados

**Backend:**

```
GET  /api/productos/{id}/tamaños
     → List<ProductoDTO.TamañoDTO>

GET  /api/productos/{id}/atributos
     → List<ProductoDTO.AtributoDTO>

POST /api/productos/{id}/tamaños
     → Crear tamaño
     Body: { nombre, descripcion, precioExtra, orden }

POST /api/productos/{id}/atributos
     → Crear atributo
     Body: { nombre, tipo, requerido, orden }

PUT  /api/productos/tamaños/{id}
     → Actualizar tamaño

DELETE /api/productos/tamaños/{id}
     → Eliminar tamaño

POST /api/productos/{productoId}/atributos/{atributoId}/opciones
     → Agregar opción a atributo

PUT  /api/carrito
     → Actualizar para soportar estructura nueva
     Body: {
         productoId,
         varianteId,
         tamañoId,
         atributosSeleccionados: { atributoId: [opcionIds] },
         cantidad
     }
```

---

## 🎨 Frontend - Cliente (React Native)

### Componentes Nuevos

1. **ProductoVariantesModal.tsx**
   - Modal para seleccionar variante + tamaño + atributos
   - Flujo multi-paso con navegación
   - Calcula precio dinámico

2. **VariantesStep.tsx**
   - Paso 1: Selecciona variante del producto base
   - Muestra todas las variantes disponibles

3. **TamañosStep.tsx**
   - Paso 2: Selecciona tamaño
   - Muestra tamaños disponibles para la variante
   - Suma precio_extra

4. **AtributosStep.tsx**
   - Paso 3: Selecciona atributos/ingredientes
   - Soporta atributos SIMPLE (radio) y MULTIPLE (checkbox)
   - Marca atributos REQUERIDO
   - Suma precios_extra

5. **ResumenSeleccionStep.tsx**
   - Paso 4: Resumen de selección
   - Muestra variante + tamaño + atributos elegidos
   - Precio final
   - Botón confirmar

### Flujo en MenuScreen

```
MenuScreen
  ↓
  [Card de Producto]
  ↓
  [Click en +] → Verificar tipo
  ├─ SIN VARIANTES → Agregar directo
  └─ CON VARIANTES → Abrir ProductoVariantesModal
     ├─ Step 1: Variantes
     ├─ Step 2: Tamaños
     ├─ Step 3: Atributos
     └─ Step 4: Resumen → Agregar carrito
```

### Actualización CarritoItem

```typescript
// Ahora el CarritoItem tiene:
interface CarritoItem {
  producto: ProductoDTO;
  varianteId?: Long;
  tamañoId?: Long;
  atributosSeleccionados?: Map<Long, Long[]>;  // atributoId -> opcionIds
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  // Campos para mostrar
  detallesSeleccionados?: string;  // "Jugo Verde - Mediano - Naranja, Zanahoria"
}
```

---

## 🛠️ Admin - Gestión de Productos

### Nueva Pantalla: AdminProductosDetalles.tsx

Cuando el admin edita un producto con variantes:

```
AdminProductos
  ↓
  [Click en Producto] → AdminProductosDetalles
     ├─ Tab 1: INFORMACIÓN BÁSICA
     │  ├─ Nombre, descripción, categoría
     │  └─ Precio base
     │
     ├─ Tab 2: VARIANTES (si es producto base)
     │  ├─ Lista de variantes
     │  └─ [Botón + Agregar Variante]
     │     └─ Modal crear variante
     │
     ├─ Tab 3: TAMAÑOS
     │  ├─ Tabla tamaños (nombre, precio_extra, orden)
     │  ├─ [Botón + Agregar Tamaño]
     │  └─ [Botón Editar/Eliminar por tamaño]
     │
     └─ Tab 4: ATRIBUTOS
        ├─ Tabla atributos (nombre, tipo, requerido)
        ├─ [Botón + Agregar Atributo]
        ├─ [Expandible por atributo] → Mostrar opciones
        │  ├─ Tabla opciones (nombre, precio_extra)
        │  ├─ [Botón + Agregar Opción]
        │  └─ [Botón Editar/Eliminar por opción]
        └─ [Botón Editar/Eliminar por atributo]
```

### Formularios Admin

**Modal Crear Tamaño:**
```
[Nombre]          "Pequeño"
[Descripción]     "150 ml"
[Precio Extra]    "+0.00"
[Orden]           1
[Activo]          ☑
[Guardar]
```

**Modal Crear Atributo:**
```
[Nombre]          "Ingrediente"
[Tipo]            ○ Simple (1 opción) ● Múltiple (varias)
[Requerido]       ☑
[Orden]           1
[Activo]          ☑
[Guardar]
```

**Modal Crear Opción (dentro de Atributo):**
```
[Nombre]          "Naranja"
[Precio Extra]    "+0.50"
[Orden]           1
[Activo]          ☑
[Guardar]
```

---

## 📊 Flujo de Datos Completo

### Caso 1: Cliente compra "Jugo Verde"

```
1. MenuScreen carga productos
2. User hace click en "Jugo Verde" (es producto base con variantes)
3. ProductoVariantesModal abre
   ├─ Paso 1: Selecciona "Jugo Verde" (variante)
   ├─ Paso 2: Selecciona "Mediano" (tamaño)
   ├─ Paso 3: Selecciona "Naranja + Zanahoria" (atributos)
   └─ Paso 4: Confirma y calcula:
      └─ Precio = base + precio_extra(tamaño) + precio_extra(atributos)
         = 50 + 5 + (0.5 + 0.5) = 56.00
4. Agregar al carrito (paso 4)
5. CarritoScreen muestra:
   "Jugo Verde - Mediano - Naranja, Zanahoria - $56.00"
```

### Caso 2: Admin crea "Jugo Verde" con variantes

```
1. Admin en AdminProductos → Crear nuevo
2. Ingresa: Nombre "Jugo Verde", Precio base 50
3. Va a Tab VARIANTES → Agregar variante
   └─ Crea "Jugo Verde" (es el producto base actual)
4. Va a Tab TAMAÑOS → Agregar tamaños
   ├─ Pequeño (150ml) - +0
   ├─ Mediano (250ml) - +5
   └─ Grande (400ml) - +10
5. Va a Tab ATRIBUTOS → Agregar atributo
   ├─ Nombre: "Ingrediente"
   ├─ Tipo: Múltiple
   ├─ Requerido: SÍ
   └─ Opciones:
      ├─ Naranja - +0.50
      ├─ Zanahoria - +0.50
      ├─ Betabel - +0.50
      ├─ Toronja - +0.50
      └─ Agua - 0
6. Guarda producto
```

---

## 🔄 Cambios en Base de Datos

### SQL Migration (V{timestamp}__Add_Product_Variants_Attributes.sql)

```sql
-- Tabla de tamaños
CREATE TABLE producto_tamaño (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_extra DECIMAL(12, 2) DEFAULT 0,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Relación M-M: Producto Variante ↔ Tamaño
CREATE TABLE producto_variante_tamaño (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id BIGINT NOT NULL,
    tamaño_id BIGINT NOT NULL,
    orden INT DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (tamaño_id) REFERENCES producto_tamaño(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variante_tamaño (producto_id, tamaño_id)
);

-- Tabla de atributos
CREATE TABLE producto_atributo (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('SIMPLE', 'MULTIPLE') NOT NULL DEFAULT 'SIMPLE',
    requerido BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Tabla de opciones de atributo
CREATE TABLE producto_atributo_opcion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    atributo_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    precio_extra DECIMAL(12, 2) DEFAULT 0,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (atributo_id) REFERENCES producto_atributo(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_producto_variante_tamaño_producto ON producto_variante_tamaño(producto_id);
CREATE INDEX idx_producto_atributo_producto ON producto_atributo(producto_id);
CREATE INDEX idx_producto_atributo_opcion_atributo ON producto_atributo_opcion(atributo_id);
```

---

## 📋 Fases de Implementación

### FASE 1: Backend (Modelos, DTOs, Endpoints)
**Duración estimada: 2-3 horas**

- [ ] Crear migrations de BD
- [ ] Crear entidades JPA (ProductoTamaño, ProductoAtributo, ProductoAtributoOpcion)
- [ ] Crear DTOs (TamañoDTO, AtributoDTO, OpcionDTO)
- [ ] Crear repositories
- [ ] Crear servicios CRUD para tamaños y atributos
- [ ] Crear endpoints REST
- [ ] Actualizar ProductoDTO con nuevas relaciones
- [ ] Actualizar CarritoItemDTO

### FASE 2: Admin Frontend (Gestión de Variantes)
**Duración estimada: 3-4 horas**

- [ ] Crear AdminProductosDetalles.tsx con tabs
- [ ] Crear componentes para tab Tamaños
- [ ] Crear componentes para tab Atributos
- [ ] Crear componentes para tab Atributos → Opciones
- [ ] Modales para CRUD de tamaños
- [ ] Modales para CRUD de atributos
- [ ] Modales para CRUD de opciones
- [ ] Integración con API backend
- [ ] Validaciones y manejo de errores

### FASE 3: Cliente Frontend (Compra Multi-paso)
**Duración estimada: 3-4 horas**

- [ ] Crear ProductoVariantesModal.tsx
- [ ] Crear VariantesStep.tsx
- [ ] Crear TamañosStep.tsx
- [ ] Crear AtributosStep.tsx
- [ ] Crear ResumenSeleccionStep.tsx
- [ ] Integración con MenuScreen
- [ ] Lógica de cálculo de precios dinámicos
- [ ] Actualización del CarritoScreen para mostrar detalles
- [ ] Validaciones y manejo de errores

### FASE 4: Testing y Optimización
**Duración estimada: 1-2 horas**

- [ ] Test de flujos completos
- [ ] Test de cálculo de precios
- [ ] Test de persistencia en BD
- [ ] Optimización de queries (N+1)
- [ ] Caché de atributos frecuentes
- [ ] Test en producción

---

## 🎯 Puntos Clave de Implementación

### Backend (Java 21)

1. **Pattern Matching para DTOs:**
   ```java
   return switch (producto) {
       case Producto p when p.getProductoBase() != null 
           -> crearVarianteDTO(p);
       case Producto p when !p.getVariantes().isEmpty() 
           -> crearProductoBaseDTO(p);
       default -> crearProductoSimpleDTO(producto);
   };
   ```

2. **Queries Optimizadas (N+1):**
   ```java
   @Query("""
       SELECT new com.puntodeventa.backend.dto.ProductoDTO(...)
       FROM Producto p
       LEFT JOIN FETCH p.variantes v
       LEFT JOIN FETCH v.tamaños t
       LEFT JOIN FETCH v.atributos a
       LEFT JOIN FETCH a.opciones ao
       WHERE p.id = :id AND p.sucursal.id = :sucursalId
   """)
   Optional<ProductoDTO> findByIdWithVariantes(...);
   ```

3. **Virtual Threads para operaciones pesadas:**
   ```java
   @Async
   public CompletableFuture<ProductoDTO> generarReporteDinamico(...) {
       // Procesar múltiples productos con variantes en paralelo
   }
   ```

### Frontend (React Native + TypeScript)

1. **Stepper con validación:**
   ```tsx
   const [step, setStep] = useState(1);
   const [selecciones, setSelecciones] = useState({
       varianteId: null,
       tamañoId: null,
       atributos: new Map()
   });
   
   const puedeAvanzar = () => {
       switch(step) {
           case 1: return selecciones.varianteId !== null;
           case 2: return selecciones.tamañoId !== null;
           case 3: return validarAtributosRequeridos();
           default: return false;
       }
   };
   ```

2. **Cálculo dinámico de precios:**
   ```tsx
   const calcularPrecio = useCallback(() => {
       let precio = variante.precio;
       if (tamaño) precio += tamaño.precioExtra;
       atributosSeleccionados.forEach(opciones => {
           opciones.forEach(opcion => {
               precio += opcion.precioExtra;
           });
       });
       return precio;
   }, [variante, tamaño, atributosSeleccionados]);
   ```

---

## 📱 Mockups de UI

### Cliente - MenuScreen con Modal

```
┌─────────────────────┐
│ ☰  MENU             │ ← MenuScreen
├─────────────────────┤
│ 🥗 🍹 🍰 🍔 ⚪      │ ← Categorías
├─────────────────────┤
│ ┌─────────┬─────────┐│
│ │ Jugo    │ Jugo    ││
│ │ Verde   │ Rojo    ││
│ │ $50     │ $50     ││
│ │   +     │   +     ││
│ └─────────┴─────────┘│
│                       │
│ ... más productos    │
└─────────────────────┘
        ↓ [Click +]
┌─────────────────────────────┐
│   SELECCIONA TU BEBIDA      │
├─────────────────────────────┤
│  PASO 1/4: VARIANTE         │
├─────────────────────────────┤
│ ☑ Jugo Verde               │
│ ○ Jugo Rojo                │
│ ○ Jugo Amarillo            │
│                             │
│ ┌──────────┬──────────────┐ │
│ │  ATRÁS   │  SIGUIENTE   │ │
│ └──────────┴──────────────┘ │
└─────────────────────────────┘
        ↓
┌─────────────────────────────┐
│   SELECCIONA TU TAMAÑO      │
├─────────────────────────────┤
│  PASO 2/4: TAMAÑO           │
├─────────────────────────────┤
│ ○ Pequeño (150ml)   +$0     │
│ ○ Mediano (250ml)   +$5     │
│ ○ Grande (400ml)    +$10    │
│                             │
│ ┌──────────┬──────────────┐ │
│ │  ATRÁS   │  SIGUIENTE   │ │
│ └──────────┴──────────────┘ │
└─────────────────────────────┘
        ↓
┌──────────────────────────────┐
│   ELIGE TUS INGREDIENTES    │
├──────────────────────────────┤
│  PASO 3/4: INGREDIENTES     │
├──────────────────────────────┤
│ ☐ Naranja         +$0.50     │
│ ☐ Zanahoria       +$0.50     │
│ ☐ Betabel         +$0.50     │
│ ☐ Toronja         +$0.50     │
│ ☑ Agua            (incluido) │
│                              │
│ ┌──────────┬──────────────┐  │
│ │  ATRÁS   │  SIGUIENTE   │  │
│ └──────────┴──────────────┘  │
└──────────────────────────────┘
        ↓
┌──────────────────────────────┐
│     CONFIRMA TU ORDEN       │
├──────────────────────────────┤
│  PASO 4/4: RESUMEN          │
├──────────────────────────────┤
│ Jugo Verde                   │
│ └─ Mediano (250ml)  +$5      │
│ └─ Naranja, Zanahoria +$1    │
│                              │
│ PRECIO BASE         $50.00   │
│ EXTRAS              +$6.00   │
│ TOTAL               $56.00   │
│                              │
│ ┌──────────┬──────────────┐  │
│ │  ATRÁS   │ AGREGAR      │  │
│ └──────────┴──────────────┘  │
└──────────────────────────────┘
```

### Admin - AdminProductosDetalles

```
┌──────────────────────────────────────┐
│ Jugo Verde                    [← Atrás]│
├──────────────────────────────────────┤
│ [Básica] [Variantes] [Tamaños] [Atr.]│
│                                       │
│ ═════════════════════════════════════ │
│ TAB: TAMAÑOS                          │
│ ═════════════════════════════════════ │
│                                       │
│ ┌─────────────────────────────────┐   │
│ │ Nombre      │ Extra  │ Orden     │   │
│ ├─────────────────────────────────┤   │
│ │ Pequeño     │ $0     │ 1    [✎ ✕]  │
│ │ Mediano     │ $5     │ 2    [✎ ✕]  │
│ │ Grande      │ $10    │ 3    [✎ ✕]  │
│ └─────────────────────────────────┘   │
│                                       │
│ [+ AGREGAR TAMAÑO]                   │
│                                       │
│ ═════════════════════════════════════ │
│ TAB: ATRIBUTOS                        │
│ ═════════════════════════════════════ │
│                                       │
│ ▼ Ingrediente (Múltiple) [Req]       │
│   ┌─────────────────────────────┐    │
│   │ Opción    │ Extra │ [+ ✎ ✕] │    │
│   ├─────────────────────────────┤    │
│   │ Naranja   │ $0.50 │         │    │
│   │ Zanahoria │ $0.50 │         │    │
│   │ Betabel   │ $0.50 │         │    │
│   │ Toronja   │ $0.50 │         │    │
│   │ Agua      │ $0    │         │    │
│   └─────────────────────────────┘    │
│                                       │
│ ▶ Complemento (Simple)                │
│ ▶ Aderezo (Múltiple)                  │
│                                       │
│ [+ AGREGAR ATRIBUTO]                 │
│                                       │
│ [GUARDAR PRODUCTO]                   │
└──────────────────────────────────────┘
```

---

## ⚠️ Consideraciones Importantes

### Performance
- **Lazy Loading**: Cargar tamaños/atributos solo cuando se necesiten
- **Caché**: Cachear lista de atributos por producto
- **Índices BD**: Crear índices en relaciones M-M
- **Paginación**: Si hay muchos tamaños/atributos

### Seguridad
- Validar que los tamaños/atributos pertenezcan al producto
- Validar precios en backend (no confiar en cliente)
- Validar atributos requeridos antes de confirmar
- Auditar cambios en estructura de productos

### Escalabilidad
- Permitir múltiples atributos anidados (ej: Toppings → Salsas)
- Soportar "Combos" (varias bebidas en una orden)
- Historial de cambios en productos (auditoría)

### UX
- Mostrar cálculo de precio en tiempo real
- Recordar última selección
- Sugerencias basadas en popularidad
- Guardar "mis favoritas" (combinaciones frecuentes)

---

## 📌 Próximos Pasos

1. **Confirmar arquitectura** con el equipo
2. **Crear migrations** de BD
3. **Implementar FASE 1** (Backend)
4. **Implementar FASE 2** (Admin)
5. **Implementar FASE 3** (Cliente)
6. **Testing end-to-end**
7. **Deploy a producción**

---

## 📞 Preguntas para Aclarar

1. ¿Todos los productos tendrán tamaños/atributos o solo algunos?
2. ¿Pueden los atributos ser anidados (más de 2 niveles)?
3. ¿Hay precios diferentes por sucursal en tamaños/atributos?
4. ¿Se deben guardar las selecciones del cliente como "favoritas"?
5. ¿Hay límite de atributos por producto?
6. ¿Los tamaños/atributos pueden compartirse entre productos?
