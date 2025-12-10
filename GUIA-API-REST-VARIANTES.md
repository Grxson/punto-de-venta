# Guía de API REST - Variantes Multi-Paso

**Status**: Pendiente de implementación de Controllers
**Base**: `/api/v1/`

---

## 📌 Endpoints de Tamaños

### GET `/productos/tamanios`
Obtiene todos los tamaños activos.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "nombre": "Pequeño",
    "descripcion": "Tamaño pequeño",
    "precioExtra": 0,
    "orden": 1,
    "activo": true
  },
  {
    "id": 2,
    "nombre": "Mediano",
    "descripcion": "Tamaño mediano",
    "precioExtra": 50.00,
    "orden": 2,
    "activo": true
  }
]
```

---

### GET `/productos/tamanios/{id}`
Obtiene un tamaño específico.

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "nombre": "Pequeño",
  "descripcion": "Tamaño pequeño",
  "precioExtra": 0,
  "orden": 1,
  "activo": true
}
```

**Errores**:
- 404: Tamaño no encontrado

---

### POST `/productos/tamanios`
Crea un nuevo tamaño.

**Request Body**:
```json
{
  "nombre": "Extra Grande",
  "descripcion": "Tamaño extra grande",
  "precioExtra": 150.00,
  "orden": 4
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 5,
  "nombre": "Extra Grande",
  "descripcion": "Tamaño extra grande",
  "precioExtra": 150.00,
  "orden": 4,
  "activo": true
}
```

**Errores**:
- 400: El nombre ya existe

---

### PUT `/productos/tamanios/{id}`
Actualiza un tamaño.

**Request Body**:
```json
{
  "nombre": "Grande",
  "descripcion": "Tamaño grande actualizado",
  "precioExtra": 100.00,
  "orden": 3,
  "activo": true
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 2,
  "nombre": "Grande",
  "descripcion": "Tamaño grande actualizado",
  "precioExtra": 100.00,
  "orden": 3,
  "activo": true
}
```

---

### DELETE `/productos/tamanios/{id}`
Desactiva un tamaño (soft delete).

**Respuesta (204 No Content)**

---

### GET `/productos/tamanios/buscar?nombre=med`
Busca tamaños por nombre.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 2,
    "nombre": "Mediano",
    "descripcion": "Tamaño mediano",
    "precioExtra": 50.00,
    "orden": 2,
    "activo": true
  }
]
```

---

## 📌 Endpoints de Variantes-Tamaños (M-M)

### GET `/productos/{productoId}/tamanios`
Obtiene todos los tamaños disponibles para una variante.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "productoId": 10,
    "productoNombre": "Jugo Verde",
    "tamañoId": 1,
    "tamañoNombre": "Pequeño",
    "precioExtra": 0,
    "orden": 1
  },
  {
    "id": 2,
    "productoId": 10,
    "productoNombre": "Jugo Verde",
    "tamañoId": 2,
    "tamañoNombre": "Mediano",
    "precioExtra": 50.00,
    "orden": 2
  }
]
```

---

### POST `/productos/{productoId}/tamanios`
Agrega un tamaño a una variante.

**Request Body**:
```json
{
  "tamañoId": 3,
  "orden": 3
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 3,
  "productoId": 10,
  "productoNombre": "Jugo Verde",
  "tamañoId": 3,
  "tamañoNombre": "Grande",
  "precioExtra": 100.00,
  "orden": 3
}
```

**Errores**:
- 404: Producto o tamaño no encontrado
- 400: El producto ya tiene este tamaño

---

### PUT `/productos/{productoId}/tamanios/{relacionId}`
Actualiza el orden de un tamaño en una variante.

**Request Body**:
```json
{
  "orden": 2
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 3,
  "productoId": 10,
  "productoNombre": "Jugo Verde",
  "tamañoId": 3,
  "tamañoNombre": "Grande",
  "precioExtra": 100.00,
  "orden": 2
}
```

---

### DELETE `/productos/{productoId}/tamanios/{relacionId}`
Elimina un tamaño de una variante.

**Respuesta (204 No Content)**

---

## 📌 Endpoints de Atributos

### GET `/productos/{productoId}/atributos`
Obtiene todos los atributos activos de una variante.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "productoId": 10,
    "nombre": "Ingrediente",
    "tipo": "MULTIPLE",
    "requerido": true,
    "orden": 1,
    "activo": true,
    "opciones": [
      {
        "id": 10,
        "atributoId": 1,
        "nombre": "Naranja",
        "precioExtra": 0,
        "orden": 1,
        "activo": true
      },
      {
        "id": 11,
        "atributoId": 1,
        "nombre": "Zanahoria",
        "precioExtra": 0,
        "orden": 2,
        "activo": true
      }
    ]
  }
]
```

---

### POST `/productos/{productoId}/atributos`
Crea un nuevo atributo.

**Request Body**:
```json
{
  "nombre": "Complemento",
  "tipo": "SIMPLE",
  "requerido": false,
  "orden": 2
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 2,
  "productoId": 10,
  "nombre": "Complemento",
  "tipo": "SIMPLE",
  "requerido": false,
  "orden": 2,
  "activo": true,
  "opciones": []
}
```

---

### PUT `/atributos/{atributoId}`
Actualiza un atributo.

**Request Body**:
```json
{
  "nombre": "Ingrediente Principal",
  "tipo": "MULTIPLE",
  "requerido": true,
  "orden": 1,
  "activo": true
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 1,
  "productoId": 10,
  "nombre": "Ingrediente Principal",
  "tipo": "MULTIPLE",
  "requerido": true,
  "orden": 1,
  "activo": true,
  "opciones": [...]
}
```

---

### DELETE `/atributos/{atributoId}`
Desactiva un atributo.

**Respuesta (204 No Content)**

---

## 📌 Endpoints de Opciones de Atributos

### GET `/atributos/{atributoId}/opciones`
Obtiene todas las opciones activas de un atributo.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 10,
    "atributoId": 1,
    "nombre": "Naranja",
    "precioExtra": 0,
    "orden": 1,
    "activo": true
  },
  {
    "id": 11,
    "atributoId": 1,
    "nombre": "Zanahoria",
    "precioExtra": 0,
    "orden": 2,
    "activo": true
  }
]
```

---

### POST `/atributos/{atributoId}/opciones`
Crea una nueva opción para un atributo.

**Request Body**:
```json
{
  "nombre": "Betabel",
  "precioExtra": 0,
  "orden": 3
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 12,
  "atributoId": 1,
  "nombre": "Betabel",
  "precioExtra": 0,
  "orden": 3,
  "activo": true
}
```

---

### PUT `/opciones/{opcionId}`
Actualiza una opción.

**Request Body**:
```json
{
  "nombre": "Betabel Orgánico",
  "precioExtra": 10.00,
  "orden": 3,
  "activo": true
}
```

**Respuesta (200 OK)**:
```json
{
  "id": 12,
  "atributoId": 1,
  "nombre": "Betabel Orgánico",
  "precioExtra": 10.00,
  "orden": 3,
  "activo": true
}
```

---

### DELETE `/opciones/{opcionId}`
Desactiva una opción.

**Respuesta (204 No Content)**

---

## 📌 Endpoints de Atributos Seleccionados en Ventas

### GET `/ventas-items/{ventaItemId}/atributos`
Obtiene todos los atributos seleccionados en un item de venta.

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "ventaItemId": 100,
    "atributoId": 1,
    "atributoNombre": "Ingrediente",
    "opcionId": 10,
    "opcionNombre": "Naranja",
    "valorSeleccionado": null,
    "precioExtra": 0
  },
  {
    "id": 2,
    "ventaItemId": 100,
    "atributoId": 1,
    "atributoNombre": "Ingrediente",
    "opcionId": 11,
    "opcionNombre": "Zanahoria",
    "valorSeleccionado": null,
    "precioExtra": 0
  }
]
```

---

### POST `/ventas-items/{ventaItemId}/atributos`
Agrega un atributo seleccionado a un item de venta.

**Request Body**:
```json
{
  "atributoId": 1,
  "opcionId": 10,
  "precioExtra": 0
}
```

**Respuesta (201 Created)**:
```json
{
  "id": 1,
  "ventaItemId": 100,
  "atributoId": 1,
  "atributoNombre": "Ingrediente",
  "opcionId": 10,
  "opcionNombre": "Naranja",
  "valorSeleccionado": null,
  "precioExtra": 0
}
```

---

### DELETE `/ventas-items/{ventaItemId}/atributos/{atributoSeleccionadoId}`
Elimina un atributo seleccionado.

**Respuesta (204 No Content)**

---

### DELETE `/ventas-items/{ventaItemId}/atributos`
Limpia todos los atributos seleccionados de un item.

**Respuesta (204 No Content)**

---

## 🔐 Autorización

- **GET** (lectura): Sin restricción o ROLE_USER
- **POST, PUT, DELETE** (escritura): ROLE_ADMIN o ROLE_GERENTE
- **Segregación por sucursal**: El admin solo puede gestionar productos de su sucursal

---

## 📊 Códigos de estado HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Violación de constraint único |
| 500 | Internal Server Error |

