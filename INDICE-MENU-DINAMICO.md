# 📑 Índice Completo - Menú Dinámico por Popularidad

## 🎯 Inicio rápido

Si estás en prisa, **comienza aquí**:

1. **Resumen ejecutivo:** [`RESUMEN-MENU-DINAMICO.md`](RESUMEN-MENU-DINAMICO.md)
2. **Guía rápida:** [`GUIA-RAPIDA-MENU-DINAMICO.md`](GUIA-RAPIDA-MENU-DINAMICO.md)
3. **Ejemplos prácticos:** [`EJEMPLOS-USO-MENU-DINAMICO.md`](EJEMPLOS-USO-MENU-DINAMICO.md)

---

## 📚 Documentación por tipo

### 📖 Documentación Técnica

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| **Especificación completa** | `docs/ALGORITMO-POPULARIDAD-MENU.md` | Matemáticas, fórmulas, algoritmo core, debugging |
| **Diagramas visuales** | `docs/DIAGRAMAS-ALGORITMO-POPULARIDAD.md` | Flujos, cálculos, distribuciones visualizadas |

### 🚀 Guías de uso

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| **Guía rápida** | `GUIA-RAPIDA-MENU-DINAMICO.md` | Setup, endpoints resumidos, testing |
| **Ejemplos prácticos** | `EJEMPLOS-USO-MENU-DINAMICO.md` | cURL, Postman, Java, React Native |
| **Resumen ejecutivo** | `RESUMEN-MENU-DINAMICO.md` | Qué se hizo, cómo funciona, quick start |

### ✅ Verificación

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| **Checklist de integración** | `CHECKLIST-INTEGRACION-MENU-DINAMICO.md` | Validaciones, status, próximos pasos |
| **Este archivo** | `INDICE-MENU-DINAMICO.md` | Navegación central |

---

## 🗂️ Estructura de archivos creados

### Backend Java (6 archivos)

```
backend/src/main/java/com/puntodeventa/backend/
├── util/
│   └── PopularityAlgorithm.java
│       • Algoritmo core de cálculo de popularidad
│       • Método: calcularScore() → 0-100
│       • Método: calcularTendencia()
│       • Método: ordenarPorPopularidad()
│       • Método: distribuirEnGrid()
│       • Método: distribuirPorCategoria()
│       • Record: GridPosition(fila, columna)
│
├── dto/
│   ├── ProductoPopularidadDTO.java
│   │   • id, nombre, categoriaNombre, precio, descripcion
│   │   • frecuenciaVenta, cantidadVendida, ingresoTotal
│   │   • ultimaVenta, scorePopularidad
│   │
│   ├── MenuGrillaDTO.java
│   │   • columnasGrid: int
│   │   • posiciones: Map<Long, ?>
│   │   • productos: List<ProductoPopularidadDTO>
│   │   • timestamp: String
│   │
│   └── aggregate/
│       └── ProductoEstadisticasAggregate.java
│           • frecuencia, cantidad, ingreso, ultimaVenta
│
├── service/
│   └── MenuPopularidadService.java
│       • obtenerMenuOrdenado(columnasGrid, diasAnalizar, porCategoria)
│       • obtenerTopProductos(limite, diasAnalizar)
│       • obtenerDistribucionGrilla(columnasGrid, diasAnalizar)
│       • obtenerDistribucionPorCategoria(columnasGrid, diasAnalizar)
│       • calcularPopularidad(producto, diasAnalizar)
│
├── controller/
│   └── MenuPopularidadController.java
│       • GET /api/v1/menu/ordenado
│       • GET /api/v1/menu/top
│       • GET /api/v1/menu/por-categoria
│       • GET /api/v1/menu/grilla
│       • GET /api/v1/menu/estadisticas
│
└── repository/
    └── VentaItemRepository.java (MODIFICADO)
        • obtenerEstadisticasProducto(productoId, desde)
        • obtenerEstadisticasTodos(desde)
```

### Documentación (4 archivos)

```
docs/
├── ALGORITMO-POPULARIDAD-MENU.md
│   • 📖 Documentación técnica completa
│   • Visión general del sistema
│   • Explicación de componentes
│   • Fórmulas matemáticas (sigmoide, logaritmo, exponencial)
│   • Cálculo de tendencia y recencia
│   • Endpoints REST con ejemplos
│   • Frontend integration
│   • Configuración y ajustes
│   • Debugging
│   • Casos de uso
│   • Matemáticas detrás del score
│   • Checklist de implementación
│   ~ 500+ líneas de documentación
│
└── DIAGRAMAS-ALGORITMO-POPULARIDAD.md
    • 📊 Visualizaciones de flujos
    • Flujo general del sistema
    • Cálculo del score paso a paso
    • Distribución en grilla
    • Componentes del score (gráficos)
    • Factor de recencia en tiempo
    • Cálculo de tendencia
    • Flujo de API request
    • Matriz de configuración
    • Estructura de datos JSON
    • Estados posibles
    ~ 400+ líneas con ASCII art
```

### Raíz (5 archivos)

```
punto-de-venta/
├── RESUMEN-MENU-DINAMICO.md
│   • 🎉 Resumen ejecutivo
│   • Qué se creó (lista de archivos)
│   • Cómo funciona (explicación simple)
│   • Endpoints (resumido)
│   • Quick start
│   • Ejemplo de respuesta
│   • Frontend integration
│   • Configuración
│   • Testing
│   • Debugging
│   • Casos de uso
│   • Próximas fases
│
├── GUIA-RAPIDA-MENU-DINAMICO.md
│   • 🚀 Guía de referencia rápida
│   • Resumen ejecutivo
│   • Archivos añadidos/modificados
│   • Instalación/compilación
│   • Endpoints disponibles (5)
│   • Cómo funciona el algoritmo
│   • Estructura de respuesta
│   • Ejemplo de código
│   • Parámetros configurables
│   • Testing
│   • Troubleshooting
│   • Checklist de validación
│
├── EJEMPLOS-USO-MENU-DINAMICO.md
│   • 💻 Ejemplos prácticos
│   • Compilación y ejecución
│   • cURL examples (5 endpoints)
│   • Postman setup
│   • Código Java
│   • React Native hooks y componentes
│   • Frontend CSS Grid
│   • Parámetros recomendados por caso
│   • Debugging queries SQL
│   • Verificación rápida
│
└── CHECKLIST-INTEGRACION-MENU-DINAMICO.md
    • ✅ Checklist de integración
    • Verificación de archivos
    • Verificación técnica
    • Estructura de carpetas
    • Endpoints REST
    • Algoritmo matemático
    • Funciones clave
    • Base de datos
    • DTOs
    • Documentación
    • Testing
    • Frontend pendiente
    • Performance
    • Seguridad
    • Git status
    • Próximas acciones
```

---

## 🔍 Cómo usar cada documento

### Para empezar rápido (5 minutos)
→ Lee **`RESUMEN-MENU-DINAMICO.md`**
```
✓ Qué se hizo
✓ Cómo funciona
✓ Endpoints principales
✓ Quick start
```

### Para copiar & pegar comandos (2 minutos)
→ Consulta **`GUIA-RAPIDA-MENU-DINAMICO.md`**
```
✓ Compilación
✓ Endpoints
✓ Testing
✓ Parámetros
```

### Para ejemplos de código (5 minutos)
→ Abre **`EJEMPLOS-USO-MENU-DINAMICO.md`**
```
✓ cURL examples
✓ Postman setup
✓ Código Java
✓ React Native
```

### Para entender la matemática (15 minutos)
→ Lee **`docs/ALGORITMO-POPULARIDAD-MENU.md`**
```
✓ Fórmulas completas
✓ Explicación de cada factor
✓ Debugging avanzado
✓ Casos de uso
```

### Para visualizar flujos (5 minutos)
→ Consulta **`docs/DIAGRAMAS-ALGORITMO-POPULARIDAD.md`**
```
✓ Diagramas ASCII
✓ Flujos visuales
✓ Cálculos paso a paso
```

### Para verificar todo está correcto (2 minutos)
→ Consulta **`CHECKLIST-INTEGRACION-MENU-DINAMICO.md`**
```
✓ Status de cada componente
✓ Próximos pasos
✓ Validaciones finales
```

---

## 📡 Endpoints REST (Resumen)

```
GET /api/v1/menu/ordenado
    ├─ columnasGrid: int (default: 3)
    ├─ diasAnalizar: int (default: 7)
    └─ Retorna: MenuGrillaDTO con todos los productos ordenados

GET /api/v1/menu/top
    ├─ limite: int (default: 10)
    ├─ diasAnalizar: int (default: 7)
    └─ Retorna: List<ProductoPopularidadDTO> top N

GET /api/v1/menu/por-categoria
    ├─ columnasGrid: int (default: 3)
    ├─ diasAnalizar: int (default: 7)
    └─ Retorna: MenuGrillaDTO agrupado por categoría

GET /api/v1/menu/grilla
    ├─ columnasGrid: int (default: 3)
    ├─ diasAnalizar: int (default: 7)
    └─ Retorna: MenuGrillaDTO (solo posiciones)

GET /api/v1/menu/estadisticas
    ├─ diasAnalizar: int (default: 7)
    └─ Retorna: MenuGrillaDTO con stats detalladas
```

---

## 🧮 Algoritmo (Resumen)

```
Score = f(Frecuencia, Cantidad, Ingreso, Recencia, Tendencia)

Pesos:
├─ Frecuencia: 20%  (ln(1 + freq) × 20)
├─ Cantidad: 15%    (ln(1 + qty) × 15)
├─ Ingreso: 10%     (ln(1 + income) × 10)
├─ Recencia: 25%    (e^(-t/480) × 25)    ← SEMIVIDA 8 HORAS
└─ Tendencia: 30%   (tanh(rate) × 30)

Resultado: Normalizado a 0-100 con función sigmoide
```

---

## 🚀 Quick Start

### 1. Compilar
```bash
cd backend && ./mvnw clean compile
```

### 2. Ejecutar
```bash
./start.sh
```

### 3. Probar
```bash
curl http://localhost:8080/api/v1/menu/ordenado
```

### 4. Ver Swagger
```
http://localhost:8080/swagger-ui.html
```

---

## 📝 Archivos por referencia de lenguaje

### Java/Spring Boot
- `backend/src/main/java/.../PopularityAlgorithm.java`
- `backend/src/main/java/.../MenuPopularidadService.java`
- `backend/src/main/java/.../MenuPopularidadController.java`
- `backend/src/main/java/.../VentaItemRepository.java` (modificado)

**Referencias:** `EJEMPLOS-USO-MENU-DINAMICO.md` (código Java)

### React Native/JavaScript
- (Implementación pendiente en frontend)

**Referencias:** `EJEMPLOS-USO-MENU-DINAMICO.md` (React Native hooks y componentes)

### SQL
- Queries en `VentaItemRepository.java`

**Referencias:** `EJEMPLOS-USO-MENU-DINAMICO.md` (SQL debugging)

### cURL/HTTP
- Todos los endpoints documentados

**Referencias:** `EJEMPLOS-USO-MENU-DINAMICO.md` (cURL examples)

---

## 🎓 Conceptos clave (para memorizar)

| Concepto | Explicación | Referencia |
|----------|-------------|-----------|
| **Score** | Valor 0-100 de popularidad | `ALGORITMO-POPULARIDAD-MENU.md` |
| **Recencia** | Ventas recientes pesan más (semivida 8h) | `docs/DIAGRAMAS-ALGORITMO-POPULARIDAD.md` |
| **Tendencia** | Alza/baja detectada comparando períodos | `ALGORITMO-POPULARIDAD-MENU.md` |
| **Grilla** | Layout de productos (izq→der, arriba→abajo) | `docs/DIAGRAMAS-ALGORITMO-POPULARIDAD.md` |
| **GridPosition** | Record con (fila, columna) | `PopularityAlgorithm.java` |
| **Factor** | Contribución a score (20%, 15%, etc.) | `ALGORITMO-POPULARIDAD-MENU.md` |

---

## 🔗 Navegación rápida

### Por objetivo
- **"Quiero ver cómo funciona"** → `RESUMEN-MENU-DINAMICO.md`
- **"Necesito un endpoint"** → `GUIA-RAPIDA-MENU-DINAMICO.md`
- **"Quiero código de ejemplo"** → `EJEMPLOS-USO-MENU-DINAMICO.md`
- **"¿Cómo se calcula el score?"** → `docs/ALGORITMO-POPULARIDAD-MENU.md`
- **"Muestra diagramas"** → `docs/DIAGRAMAS-ALGORITMO-POPULARIDAD.md`
- **"¿Está todo correcto?"** → `CHECKLIST-INTEGRACION-MENU-DINAMICO.md`

### Por rol
- **Developer Backend** → `docs/ALGORITMO-POPULARIDAD-MENU.md` + `EJEMPLOS-USO-MENU-DINAMICO.md`
- **Developer Frontend** → `EJEMPLOS-USO-MENU-DINAMICO.md` + `GUIA-RAPIDA-MENU-DINAMICO.md`
- **DevOps/Deployment** → `GUIA-RAPIDA-MENU-DINAMICO.md` + `CHECKLIST-INTEGRACION-MENU-DINAMICO.md`
- **Project Manager** → `RESUMEN-MENU-DINAMICO.md` + `CHECKLIST-INTEGRACION-MENU-DINAMICO.md`
- **QA/Tester** → `EJEMPLOS-USO-MENU-DINAMICO.md` + `GUIA-RAPIDA-MENU-DINAMICO.md`

### Por tiempo disponible
- **Tengo 2 minutos** → Leer resumen ejecutivo en `RESUMEN-MENU-DINAMICO.md`
- **Tengo 5 minutos** → Leer `GUIA-RAPIDA-MENU-DINAMICO.md`
- **Tengo 15 minutos** → Leer `docs/ALGORITMO-POPULARIDAD-MENU.md`
- **Tengo 30 minutos** → Leer todo lo anterior + `EJEMPLOS-USO-MENU-DINAMICO.md`
- **Tengo 1 hora** → Leer TODO + revisar código fuente

---

## ✅ Validación de implementación

Ver: `CHECKLIST-INTEGRACION-MENU-DINAMICO.md`

**Status actual:**
- ✅ Código compilado
- ✅ Documentación completa
- ✅ Ejemplos incluidos
- ✅ Ready para integración

---

## 📞 FAQ rápido

**P: ¿Dónde compilo?**  
R: `cd backend && ./mvnw clean compile`

**P: ¿Dónde pruebo?**  
R: `curl http://localhost:8080/api/v1/menu/ordenado`

**P: ¿Cómo ajusto los pesos?**  
R: `backend/src/main/java/.../PopularityAlgorithm.java` línea 35-40

**P: ¿Cuáles son los endpoints?**  
R: Ver tabla en `GUIA-RAPIDA-MENU-DINAMICO.md`

**P: ¿Cómo se ve en Swagger?**  
R: `http://localhost:8080/swagger-ui.html`

**P: ¿Cómo uso en React Native?**  
R: Ver ejemplos en `EJEMPLOS-USO-MENU-DINAMICO.md`

---

## 🎯 Checklist final

- [ ] He leído `RESUMEN-MENU-DINAMICO.md`
- [ ] Entiendo cómo funciona el algoritmo
- [ ] Conozco los 5 endpoints disponibles
- [ ] He revisado `EJEMPLOS-USO-MENU-DINAMICO.md`
- [ ] Puedo copiar & pegar comandos cURL
- [ ] Sé cómo compilar y ejecutar
- [ ] Entiendo dónde ajustar parámetros
- [ ] Conozco las próximas fases
- [ ] Estoy listo para integración frontend
- [ ] He validado con `CHECKLIST-INTEGRACION-MENU-DINAMICO.md`

---

**Última actualización:** 2025-12-06  
**Status:** ✅ COMPLETO Y LISTO PARA USAR
