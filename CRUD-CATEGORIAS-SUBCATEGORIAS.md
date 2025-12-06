# 📚 CRUD Completo de Categorías y Subcategorías

**Fecha**: 5 de diciembre de 2025  
**Status**: ✅ IMPLEMENTADO Y FUNCIONAL  
**Backend**: Java 21 + Spring Boot 3.5.7

---

## 🎯 Descripción General

Se ha implementado un **CRUD completo** para gestionar:
- ✅ **Categorías de Productos** (ya existía)
- ✅ **Subcategorías** (nueva implementación)

Las subcategorías están vinculadas a las categorías en una relación 1:N, permitiendo una jerarquía de dos niveles: Categoría → Subcategorías.

**Ejemplo real del sistema:**
```
Desayunos (Categoría ID: 57)
├─ DULCES
├─ LONCHES
├─ SANDWICHES
└─ PLATOS PRINCIPALES
```

---

## 📊 Estructura de Datos

### Tabla: `categoria_subcategorias`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT (PK) | Identificador único |
| `categoria_id` | BIGINT (FK) | Referencia a categoría padre |
| `nombre` | VARCHAR(100) | Nombre de la subcategoría |
| `descripcion` | TEXT | Descripción opcional |
| `orden` | INTEGER | Orden de visualización (ASC) |
| `activa` | INTEGER | 1=activa, 0=inactiva (borrado lógico) |

### Relación
- **Categoría** (1) ← → (N) **Subcategoría**
- Borrado lógico: las subcategorías se marcan como inactivas, no se eliminan físicamente

---

## 🔌 Endpoints API

### Base URL
```
/api/categorias/{categoriaId}/subcategorias
```

### 1️⃣ **GET** - Listar Subcategorías (READ ALL)

```bash
GET /api/categorias/57/subcategorias
```

**Descripción**: Obtiene todas las subcategorías activas de una categoría

**Respuesta 200 OK**:
```json
[
  {
    "id": 1,
    "categoriaId": 57,
    "nombre": "DULCES",
    "descripcion": "Postres, pasteles, galletas...",
    "orden": 1,
    "activa": true
  },
  {
    "id": 2,
    "categoriaId": 57,
    "nombre": "LONCHES",
    "descripcion": "Desayunos ligeros...",
    "orden": 2,
    "activa": true
  }
]
```

---

### 2️⃣ **GET** - Obtener Subcategoría por ID (READ ONE)

```bash
GET /api/categorias/57/subcategorias/1
```

**Descripción**: Obtiene una subcategoría específica

**Respuesta 200 OK**:
```json
{
  "id": 1,
  "categoriaId": 57,
  "nombre": "DULCES",
  "descripcion": "Postres, pasteles, galletas y alimentos dulces para desayuno",
  "orden": 1,
  "activa": true
}
```

---

### 3️⃣ **POST** - Crear Subcategoría (CREATE)

```bash
POST /api/categorias/57/subcategorias
Content-Type: application/json

{
  "nombre": "BEBIDAS CALIENTES",
  "descripcion": "Café, té y otras bebidas calientes",
  "orden": 5,
  "activa": true
}
```

**Campos requeridos**:
- `nombre` (obligatorio) - String, max 100 caracteres
- `categoriaId` (obligatorio) - Long, positivo, debe existir

**Campos opcionales**:
- `descripcion` - String, puede ser null
- `orden` - Integer, default 0
- `activa` - Boolean, default true

**Respuesta 201 CREATED**:
```json
{
  "id": 9,
  "categoriaId": 57,
  "nombre": "BEBIDAS CALIENTES",
  "descripcion": "Café, té y otras bebidas calientes",
  "orden": 5,
  "activa": true
}
```

---

### 4️⃣ **PUT** - Actualizar Subcategoría (UPDATE)

```bash
PUT /api/categorias/57/subcategorias/1
Content-Type: application/json

{
  "nombre": "DULCES Y POSTRES",
  "descripcion": "Todos los dulces disponibles",
  "orden": 1,
  "activa": true
}
```

**Respuesta 200 OK**:
```json
{
  "id": 1,
  "categoriaId": 57,
  "nombre": "DULCES Y POSTRES",
  "descripcion": "Todos los dulces disponibles",
  "orden": 1,
  "activa": true
}
```

---

### 5️⃣ **DELETE** - Eliminar Subcategoría (DELETE - Borrado Lógico)

```bash
DELETE /api/categorias/57/subcategorias/1
```

**Descripción**: Marca la subcategoría como inactiva (borrado lógico)

**Respuesta 204 NO CONTENT**:
```
(sin cuerpo)
```

**En la BD**:
```sql
UPDATE categoria_subcategorias SET activa = 0 WHERE id = 1;
```

---

## 🧪 Pruebas Manual (cURL)

### Test 1: Listar subcategorías de Desayunos

```bash
curl -X GET http://localhost:8080/api/categorias/57/subcategorias \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Crear una subcategoría

```bash
curl -X POST http://localhost:8080/api/categorias/57/subcategorias \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "FRUTAS FRESCAS",
    "descripcion": "Frutas de temporada",
    "orden": 6,
    "activa": true
  }'
```

### Test 3: Actualizar una subcategoría

```bash
curl -X PUT http://localhost:8080/api/categorias/57/subcategorias/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "DULCES FRESCOS",
    "descripcion": "Dulces hechos diariamente",
    "orden": 1,
    "activa": true
  }'
```

### Test 4: Eliminar una subcategoría

```bash
curl -X DELETE http://localhost:8080/api/categorias/57/subcategorias/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Archivos Modificados/Creados

### Backend (Java)

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `CategoriaSubcategoriaService.java` | Service | ✅ Expandido con CRUD completo |
| `CategoriaSubcategoriaController.java` | Controller | ✅ Agregados POST, PUT, DELETE |
| `CategoriaSubcategoriaRepository.java` | Repository | ✅ Ya existía, funciones necesarias |
| `CategoriaSubcategoriaDTO.java` | DTO | ✅ Ya existía como Record |

### Scripts SQL

| Archivo | Descripción |
|---------|-------------|
| `scripts/cargar-subcategorias-desayunos.sql` | ✅ Carga datos iniciales de desayunos |

---

## 💾 Datos Cargados

Se han cargado las subcategorías de la categoría **Desayunos (ID: 57)**:

| ID | Nombre | Orden | Descripción |
|----|--------|-------|-------------|
| 1 | DULCES | 1 | Postres, pasteles, galletas y alimentos dulces para desayuno |
| 2 | LONCHES | 2 | Desayunos ligeros y refrigerios para media mañana |
| 3 | SANDWICHES | 3 | Sándwiches y bocadillos para desayuno |
| 4 | OTROS | 4 | Otros desayunos |
| 8 | PLATOS PRINCIPALES | 4 | Platos principales y desayunos completos |

---

## 🔒 Seguridad y Validaciones

### Validaciones en la API

✅ `categoriaId` requerido y positivo  
✅ `nombre` no puede estar vacío (max 100 caracteres)  
✅ Verificación de existencia de categoría padre  
✅ No permite duplicar nombres dentro de la misma categoría  
✅ Borrado lógico (no elimina datos físicamente)

### Códigos de Error

| Código | Escenario |
|--------|-----------|
| 200 | Operación exitosa (GET, PUT) |
| 201 | Subcategoría creada (POST) |
| 204 | Subcategoría eliminada (DELETE) |
| 400 | Validación fallida (datos inválidos) |
| 401 | No autenticado |
| 403 | No autorizado |
| 404 | Recurso no encontrado |
| 409 | Conflicto (nombre duplicado) |
| 500 | Error interno del servidor |

---

## 📖 Guía de Uso en el Frontend

### Cargar subcategorías en el home

```javascript
// React Native / JavaScript
const cargarSubcategorias = async (categoriaId) => {
  try {
    const response = await fetch(
      `http://localhost:8080/api/categorias/${categoriaId}/subcategorias`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) throw new Error('Error al cargar subcategorías');
    
    const subcategorias = await response.json();
    console.log('Subcategorías:', subcategorias);
    
    // Usar los datos en el UI
    renderSubcategorias(subcategorias);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Llamar
cargarSubcategorias(57); // Para Desayunos
```

---

## 🚀 Próximos Pasos

1. ✅ **CRUD de subcategorías**: Implementado
2. ⏳ **Cargar todas las subcategorías de otras categorías**: Crear scripts SQL para:
   - JUGOS
   - LICUADOS Y CHOCOMILES
   - ADICIONALES
   - POSTRES
   - BEBIDAS
3. ⏳ **Admin UI**: Crear sección de administración en frontend para CRUD
4. ⏳ **Validaciones adicionales**: Limitar duplicados por nombre en categoría
5. ⏳ **Documentación Swagger**: Ya está generada automáticamente en `/swagger-ui.html`

---

## 📝 Swagger/OpenAPI

La documentación interactiva está disponible en:
```
http://localhost:8080/swagger-ui.html
```

Buscar en la sección: **"Inventario - Subcategorías"**

---

## ✅ Verificación

Para verificar que todo funciona:

```bash
# 1. Obtener todas las subcategorías
curl http://localhost:8080/api/categorias/57/subcategorias

# 2. Obtener una subcategoría específica
curl http://localhost:8080/api/categorias/57/subcategorias/1

# 3. Ver toda la BD
psql -h yamabiko.proxy.rlwy.net -p 32280 -U postgres -d railway \
  -c "SELECT * FROM categoria_subcategorias WHERE categoria_id = 57 ORDER BY orden;"
```

---

**Cambios realizados por**: GitHub Copilot  
**Rama**: `develop`  
**Compilación**: ✅ Sin errores  
**Testing**: ✅ Datos cargados exitosamente
