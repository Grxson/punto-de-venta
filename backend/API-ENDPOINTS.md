# API Endpoints - Punto de Venta

Documentación completa de los endpoints REST disponibles en el backend.

**Base URL**: `http://localhost:8080` (desarrollo) | `https://tu-dominio.com` (producción)

**Autenticación**: Bearer Token JWT en header `Authorization: Bearer {token}`

---

## 📋 Índice

- [Autenticación](#autenticación)
- [Salud del Sistema](#salud-del-sistema)
- [Inventario](#inventario)
  - [Unidades de Medida](#unidades-de-medida)
  - [Proveedores](#proveedores)
  - [Ingredientes](#ingredientes)
  - [Productos](#productos)
  - [Categorías de Productos](#categorías-de-productos)
  - [Recetas](#recetas)
  - [Movimientos de Inventario](#movimientos-de-inventario)
  - [Mermas](#mermas)

---

## Autenticación

### Login
Inicia sesión y obtiene token JWT.

**Endpoint**: `POST /api/auth/login`

**Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "rol": "ADMIN"
  }
}
```

### Registrar Usuario
Crea un nuevo usuario en el sistema.

**Endpoint**: `POST /api/auth/registro`

**Body**:
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "username": "juan_perez",
  "password": "Pass1234",
  "rolId": 2,
  "sucursalId": 1
}
```

**Respuesta (201)**: Usuario creado con detalles completos.

### Obtener Usuario
**Endpoint**: `GET /api/auth/usuarios/{usuarioId}`

### Listar Usuarios por Sucursal
**Endpoint**: `GET /api/auth/usuarios/sucursal/{sucursalId}?activo=true`

### Actualizar Usuario
**Endpoint**: `PUT /api/auth/usuarios/{usuarioId}`

### Desactivar Usuario
**Endpoint**: `DELETE /api/auth/usuarios/{usuarioId}` (borrado lógico)

### Reactivar Usuario
**Endpoint**: `POST /api/auth/usuarios/{usuarioId}/reactivar`

---

## Salud del Sistema

### Health Check
Verifica el estado del servicio.

**Endpoint**: `GET /actuator/health`

**Respuesta (200)**:
```json
{
  "status": "UP"
}
```

---

## Inventario

### Unidades de Medida

Gestión de unidades de medida con factor de conversión a unidad base.

#### Listar Unidades
**Endpoint**: `GET /api/inventario/unidades`

**Respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "Gramos",
    "abreviatura": "g",
    "factorBase": 1.0,
    "descripcion": "Unidad base para peso"
  },
  {
    "id": 2,
    "nombre": "Kilogramos",
    "abreviatura": "kg",
    "factorBase": 1000.0,
    "descripcion": "1 kg = 1000 g"
  }
]
```

#### Obtener Unidad por ID
**Endpoint**: `GET /api/inventario/unidades/{id}`

#### Crear Unidad
**Endpoint**: `POST /api/inventario/unidades`

**Body**:
```json
{
  "nombre": "Litros",
  "abreviatura": "L",
  "factorBase": 1000.0,
  "descripcion": "Unidad de volumen"
}
```

#### Actualizar Unidad
**Endpoint**: `PUT /api/inventario/unidades/{id}`

#### Eliminar Unidad
**Endpoint**: `DELETE /api/inventario/unidades/{id}`

---

### Proveedores

Gestión de proveedores de ingredientes.

#### Listar Proveedores
**Endpoint**: `GET /api/inventario/proveedores`

**Query params opcionales**:
- `activo=true|false` - Filtrar por estado

#### Obtener Proveedores Activos
**Endpoint**: `GET /api/inventario/proveedores/activos`

#### Obtener Proveedor por ID
**Endpoint**: `GET /api/inventario/proveedores/{id}`

#### Buscar Proveedores por Nombre
**Endpoint**: `GET /api/inventario/proveedores/buscar?nombre={texto}`

#### Crear Proveedor
**Endpoint**: `POST /api/inventario/proveedores`

**Body**:
```json
{
  "nombre": "Proveedor ABC",
  "contacto": "Juan Pérez",
  "telefono": "5512345678",
  "email": "contacto@proveedorabc.com",
  "activo": true
}
```

#### Actualizar Proveedor
**Endpoint**: `PUT /api/inventario/proveedores/{id}`

#### Eliminar Proveedor
**Endpoint**: `DELETE /api/inventario/proveedores/{id}` (borrado lógico)

---

### Ingredientes

Gestión de ingredientes con control de stock, costos y proveedores.

#### Listar Ingredientes
**Endpoint**: `GET /api/inventario/ingredientes`

**Query params opcionales**:
- `activo=true|false` - Filtrar por estado

#### Obtener Ingredientes Activos
**Endpoint**: `GET /api/inventario/ingredientes/activos`

#### Obtener Ingrediente por ID
**Endpoint**: `GET /api/inventario/ingredientes/{id}`

#### Obtener Categorías de Ingredientes
**Endpoint**: `GET /api/inventario/ingredientes/categorias`

**Respuesta**:
```json
[
  "Harinas",
  "Lácteos",
  "Frutas",
  "Verduras"
]
```

#### Buscar Ingredientes por Nombre
**Endpoint**: `GET /api/inventario/ingredientes/buscar?nombre={texto}`

#### Crear Ingrediente
**Endpoint**: `POST /api/inventario/ingredientes`

**Body**:
```json
{
  "nombre": "Harina de trigo",
  "categoria": "Harinas",
  "unidadBaseId": 1,
  "costoUnitarioBase": 0.025,
  "stockMinimo": 5000,
  "proveedorId": 1,
  "sku": "HAR-001",
  "activo": true
}
```

#### Actualizar Ingrediente
**Endpoint**: `PUT /api/inventario/ingredientes/{id}`

#### Eliminar Ingrediente
**Endpoint**: `DELETE /api/inventario/ingredientes/{id}` (borrado lógico)

---

### Productos

Gestión de productos del menú con precios y categorización.

#### Listar Productos
**Endpoint**: `GET /api/inventario/productos`

**Query params opcionales**:
- `activo=true|false` - Filtrar por estado
- `enMenu=true|false` - Filtrar por disponibilidad en menú
- `categoriaId={id}` - Filtrar por categoría
- `q={texto}` - Búsqueda por nombre

#### Obtener Producto por ID
**Endpoint**: `GET /api/inventario/productos/{id}`

**Respuesta**:
```json
{
  "id": 1,
  "nombre": "Waffles con Fruta",
  "descripcion": "Waffles con fresas y plátano",
  "categoriaId": 2,
  "categoriaNombre": "Desayunos",
  "precio": 85.00,
  "costoEstimado": 35.50,
  "sku": "WAFF-001",
  "activo": true,
  "disponibleEnMenu": true
}
```

#### Crear Producto
**Endpoint**: `POST /api/inventario/productos`

**Body**:
```json
{
  "nombre": "Tostada",
  "descripcion": "Tostada de pollo",
  "categoriaId": 1,
  "precio": 25.00,
  "sku": "TOST-001",
  "disponibleEnMenu": true
}
```

#### Obtener Productos Activos
**Endpoint**: `GET /api/inventario/productos/activos`

#### Actualizar Producto
**Endpoint**: `PUT /api/inventario/productos/{id}`

#### Cambiar Estado del Producto
**Endpoint**: `PATCH /api/inventario/productos/{id}/estado?activo={true|false}`

#### Eliminar Producto
**Endpoint**: `DELETE /api/inventario/productos/{id}` (borrado lógico)

---

### Categorías de Productos

Organización de productos en categorías.

#### Listar Categorías
**Endpoint**: `GET /api/inventario/categorias-productos`

**Query params opcionales**:
- `activa=true|false` - Filtrar por estado
- `q={texto}` - Búsqueda por nombre

**Respuesta**:
```json
[
  {
    "id": 1,
    "nombre": "Desayunos",
    "descripcion": "Platillos de desayuno",
    "activa": true
  },
  {
    "id": 2,
    "nombre": "Bebidas",
    "descripcion": "Bebidas frías y calientes",
    "activa": true
  }
]
```

#### Obtener Categoría por ID
**Endpoint**: `GET /api/inventario/categorias-productos/{id}`

#### Crear Categoría
**Endpoint**: `POST /api/inventario/categorias-productos`

**Body**:
```json
{
  "nombre": "Bebidas",
  "descripcion": "Categoría para bebidas frías y calientes",
  "activa": true
}
```

#### Actualizar Categoría
**Endpoint**: `PUT /api/inventario/categorias-productos/{id}`

#### Eliminar Categoría
**Endpoint**: `DELETE /api/inventario/categorias-productos/{id}` (borrado lógico)

---

### Recetas

Sistema de recetas que vincula productos con ingredientes, cantidades y merma teórica.

#### Obtener Recetas por Producto
**Endpoint**: `GET /api/inventario/recetas/producto/{productoId}`

**Respuesta**:
```json
[
  {
    "productoId": 1,
    "productoNombre": "Waffles con Fruta",
    "ingredienteId": 5,
    "ingredienteNombre": "Harina de trigo",
    "cantidad": 200,
    "unidadId": 1,
    "unidadNombre": "Gramos",
    "mermaTeorica": 0.05,
    "costoIngrediente": 5.00
  },
  {
    "productoId": 1,
    "productoNombre": "Waffles con Fruta",
    "ingredienteId": 8,
    "ingredienteNombre": "Leche",
    "cantidad": 150,
    "unidadId": 3,
    "unidadNombre": "Mililitros",
    "mermaTeorica": 0.02,
    "costoIngrediente": 3.75
  }
]
```

#### Obtener Recetas por Ingrediente
**Endpoint**: `GET /api/inventario/recetas/ingrediente/{ingredienteId}`

#### Calcular Costo de Receta
Calcula el costo total de producción de un producto basándose en sus ingredientes.

**Endpoint**: `GET /api/inventario/recetas/producto/{productoId}/costo`

**Respuesta**:
```json
{
  "productoId": 1,
  "productoNombre": "Waffles con Fruta",
  "costoTotal": 35.50,
  "ingredientes": [
    {
      "ingredienteNombre": "Harina de trigo",
      "cantidad": 200,
      "unidad": "g",
      "costoUnitario": 0.025,
      "costoTotal": 5.00
    }
  ]
}
```

#### Crear Receta
**Endpoint**: `POST /api/inventario/recetas`

**Body**:
```json
{
  "productoId": 1,
  "ingredienteId": 5,
  "cantidad": 200,
  "unidadId": 1,
  "mermaTeorica": 0.05
}
```

#### Actualizar Receta
**Endpoint**: `PUT /api/inventario/recetas/producto/{productoId}/ingrediente/{ingredienteId}`

#### Eliminar Receta Específica
**Endpoint**: `DELETE /api/inventario/recetas/producto/{productoId}/ingrediente/{ingredienteId}`

#### Eliminar Todas las Recetas de un Producto
**Endpoint**: `DELETE /api/inventario/recetas/producto/{productoId}`

---

### Movimientos de Inventario

Registro de ingresos y egresos de ingredientes con trazabilidad.

#### Crear Movimiento
**Endpoint**: `POST /api/inventario/movimientos`

**Body**:
```json
{
  "ingredienteId": 5,
  "cantidad": 1000,
  "unidadId": 1,
  "costoUnitario": 0.025,
  "tipo": "INGRESO",
  "nota": "Compra mensual"
}
```

**Tipos válidos**: `INGRESO`, `EGRESO`, `AJUSTE`, `MERMA`, `TRANSFERENCIA`

**Respuesta (201)**:
```json
{
  "id": 1,
  "ingredienteId": 5,
  "ingredienteNombre": "Harina de trigo",
  "cantidad": 1000,
  "unidadId": 1,
  "unidadNombre": "Gramos",
  "costoUnitario": 0.025,
  "tipo": "INGRESO",
  "nota": "Compra mensual",
  "fecha": "2025-11-24T10:30:00"
}
```

#### Obtener Movimientos por Ingrediente
**Endpoint**: `GET /api/inventario/movimientos/ingrediente/{ingredienteId}`

#### Obtener Movimientos por Ingrediente y Tipo
**Endpoint**: `GET /api/inventario/movimientos/ingrediente/{ingredienteId}/tipo/{tipo}`

**Ejemplo**: `/api/inventario/movimientos/ingrediente/5/tipo/INGRESO`

#### Obtener Movimientos por Rango de Fechas
**Endpoint**: `GET /api/inventario/movimientos/rango?desde={fecha-inicio}&hasta={fecha-fin}`

**Ejemplo**: `/api/inventario/movimientos/rango?desde=2025-01-01&hasta=2025-12-31`

**Formato de fechas**: `YYYY-MM-DD`

---

### Mermas

Control de pérdidas de ingredientes con motivos y registro histórico.

#### Crear Merma
**Endpoint**: `POST /api/inventario/mermas`

**Body**:
```json
{
  "ingredienteId": 5,
  "cantidad": 50,
  "unidadId": 1,
  "motivo": "Vencimiento de producto"
}
```

**Motivos comunes**:
- Vencimiento de producto
- Rotura/Derrame
- Caducidad
- Error de manipulación
- Deterioro por temperatura
- Otros

**Respuesta (201)**:
```json
{
  "id": 1,
  "ingredienteId": 5,
  "ingredienteNombre": "Harina de trigo",
  "cantidad": 50,
  "unidadId": 1,
  "unidadNombre": "Gramos",
  "motivo": "Vencimiento de producto",
  "fecha": "2025-11-24T11:00:00"
}
```

#### Obtener Mermas por Ingrediente
**Endpoint**: `GET /api/inventario/mermas/ingrediente/{ingredienteId}`

#### Obtener Todas las Mermas
**Endpoint**: `GET /api/inventario/mermas`

**Respuesta**:
```json
[
  {
    "id": 1,
    "ingredienteId": 5,
    "ingredienteNombre": "Harina de trigo",
    "cantidad": 50,
    "unidadId": 1,
    "unidadNombre": "Gramos",
    "motivo": "Vencimiento de producto",
    "fecha": "2025-11-24T11:00:00"
  }
]
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Creado - Recurso creado exitosamente |
| 204 | Sin contenido - Operación exitosa sin contenido de respuesta |
| 400 | Solicitud incorrecta - Datos de entrada inválidos |
| 401 | No autorizado - Falta autenticación |
| 403 | Prohibido - Sin permisos para acceder al recurso |
| 404 | No encontrado - Recurso no encontrado |
| 500 | Error interno del servidor - Error interno del servidor |

---

## Estructura de Respuestas de Error

Todas las respuestas de error siguen el mismo formato:

```json
{
  "timestamp": "2025-11-24T11:47:03.035244396",
  "status": 404,
  "error": "Recurso no encontrado",
  "message": "Categoría no encontrada con id: 1",
  "path": "/api/inventario/categorias-productos/1"
}
```

---

## Colección Postman

Puedes importar la colección completa desde:
`postman/punto-de-venta.postman_collection.json`

**Características**:
- Scripts automáticos para capturar tokens y IDs
- Variables de entorno configuradas
- Organización por carpetas (Autenticación, Salud, Inventario)
- Ejemplos de peticiones para todos los endpoints

**Variables capturadas automáticamente**:
- `token` - Token JWT tras login
- `usuarioId` - ID del usuario autenticado
- `productoId` - ID del último producto creado
- `categoriaProductoId` - ID de la última categoría creada
- `ingredienteId` - ID del último ingrediente creado
- `movimientoId` - ID del último movimiento creado
- `mermaId` - ID de la última merma creada

---

## Documentación Swagger

Para explorar la API interactivamente:

**Swagger UI**: `http://localhost:8080/swagger-ui.html`

**OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## Notas Importantes

### Borrado Lógico
La mayoría de los endpoints de eliminación realizan **borrado lógico**, es decir, marcan el registro como inactivo sin eliminarlo físicamente de la base de datos. Esto permite:
- Mantener histórico completo
- Auditoría de cambios
- Posibilidad de reactivación
- Integridad referencial

### Validaciones
Todos los endpoints validan:
- Formato de datos de entrada
- Existencia de entidades relacionadas
- Reglas de negocio específicas
- Permisos de usuario (cuando JWT esté implementado)

### Paginación
**Estado**: Pendiente de implementación

En futuras versiones se agregará paginación automática a los endpoints de listado que retornen grandes volúmenes de datos.

---

## Versionado de API

**Versión actual**: 1.1.0

Para verificar la versión del backend:
```bash
GET /api/version
```

---

*Última actualización: 2025-11-24*
