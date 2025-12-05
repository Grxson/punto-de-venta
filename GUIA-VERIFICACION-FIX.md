# 🚀 Guía de Verificación: Fix de Variantes

## 📋 Checklist Completo

### ✅ Ya Completado

- [x] **Frontend:** ProductoForm.tsx actualizado (líneas 346-365)
- [x] **Backend:** ProductoService.java mejorado (método apply())
- [x] **Compilaciones:** Frontend ✅ Backend ✅
- [x] **Base de Datos:** Script SQL ejecutado en Railway PostgreSQL
- [x] **Molletes:** Unificadas correctamente en BD

### 🔄 Pendiente

- [ ] **Reiniciar Backend** - Para limpiar caché y cargar cambios
- [ ] **Verificar en POS** - Confirmar agrupación de variantes
- [ ] **Verificar en Admin** - Confirmar gestor de variantes
- [ ] **Editar y Probar** - Cambiar subcategoría y verificar

---

## 🎬 Pasos para Verificar

### PASO 1: Reiniciar el Backend (OBLIGATORIO)

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend

# OPCIÓN A: Con script (recomendado)
bash start.sh

# OPCIÓN B: Manual
pkill -f "java -jar" || true
sleep 2
java -Dspring.profiles.active=dev -jar target/backend-*.jar
```

**Espera a ver:**
```
[start.sh] Usando perfil: dev
[start.sh] JAR encontrado. No se reconstruye.
[start.sh] Lanzando: java ... -Dspring.profiles.active=dev -jar backend-*.jar
```

**El backend debería estar disponible en:** `http://localhost:8080`

**Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

### PASO 2: Verificar Estado en BD

Conectarse a PostgreSQL y verificar que los datos están correctos:

```bash
psql -h yamabiko.proxy.rlwy.net -p 32280 -U postgres -d railway

# Ejecutar esta query:
SELECT id, nombre, nombre_variante, producto_base_id, orden_variante 
FROM productos 
WHERE id IN (519, 520, 521, 522)
ORDER BY id;
```

**Resultado esperado:**
```
 id  |        nombre         | nombre_variante | producto_base_id | orden_variante 
-----+-----------------------+-----------------+------------------+----------------
 519 | Molletes              |                 |                  |               
 520 | Molletes - Dulce      | Dulce           |              519 |              1
 521 | Molletes - Con Untado | Con Untado      |              519 |              2
 522 | Molletes - Salado     | Salado          |              519 |              3
(4 rows)
```

✅ Si ves esto, la BD está correcta.

---

### PASO 3: Verificar API REST

Hacer un GET a la API para verificar que agrupa las variantes:

```bash
curl -s "http://localhost:8080/api/inventario/productos/519" | jq .
```

**Resultado esperado:**
```json
{
  "id": 519,
  "nombre": "Molletes",
  "precio": 40,
  "descripcion": null,
  "categoriaId": 1,
  "categoriaNombre": "Desayunos",
  "costoEstimado": null,
  "sku": null,
  "activo": true,
  "disponibleEnMenu": true,
  "variantes": [
    {
      "id": 520,
      "nombre": "Molletes - Dulce",
      "nombreVariante": "Dulce",
      "precio": 30,
      "ordenVariante": 1,
      "productoBaseId": 519
    },
    {
      "id": 521,
      "nombre": "Molletes - Con Untado",
      "nombreVariante": "Con Untado",
      "precio": 35,
      "ordenVariante": 2,
      "productoBaseId": 519
    },
    {
      "id": 522,
      "nombre": "Molletes - Salado",
      "nombreVariante": "Salado",
      "precio": 40,
      "ordenVariante": 3,
      "productoBaseId": 519
    }
  ],
  "productoBaseId": null,
  "nombreVariante": null
}
```

✅ Si ves el array `variantes` con las 3 variantes, la API está correcta.

---

### PASO 4: Verificar en el POS

1. **Abre el navegador:** `http://localhost:5173` (frontend)
2. **Navega a:** Punto de Venta
3. **Selecciona categoría:** DESAYUNOS
4. **Selecciona subcategoría:** DULCES
5. **Busca:** "Molletes"

**Resultado esperado:**

```
┌──────────────────┐
│   Molletes       │
│                  │
│    $40.00        │
│                  │
└──────────────────┘
```

✅ **Debería aparecer UNA SOLA TARJETA** (no 3 separadas)

**Cuando hagas click:**
```
┌─────────────────────────────────────────┐
│ Seleccionar Variante de Molletes        │
│                                         │
│ Este producto tiene diferentes          │
│ tamaños/presentaciones disponibles.     │
│ Selecciona una opción:                 │
│                                         │
│ Dulce                        $30.00    │
│ Con Untado                   $35.00    │
│ Salado                       $40.00    │
│                                         │
│ [Agregar producto sin variante]        │
└─────────────────────────────────────────┘
```

✅ **Debería abrir un modal con las 3 opciones**

---

### PASO 5: Verificar en Admin

1. **Abre el navegador:** `http://localhost:5173`
2. **Navega a:** Panel Administrativo → Inventario
3. **Busca:** "Molletes"
4. **Click en el icono de editar (⚙️)**
5. **Click en botón:** "Ver Variantes"

**Resultado esperado:**

```
┌──────────────────────────────────────────┐
│ Gestión de Variantes: Molletes           │
│                                          │
│ Variante         │ Precio  │ Orden      │
│─────────────────────────────────────────│
│ Dulce            │ $30.00  │ 1          │
│ Con Untado       │ $35.00  │ 2          │
│ Salado           │ $40.00  │ 3          │
│                                          │
│ [Agregar nueva variante]                │
└──────────────────────────────────────────┘
```

✅ **Debería listar las 3 variantes correctamente**

---

### PASO 6: Test de Edición (El Fix Principal)

1. **En Admin → Inventario**
2. **Busca y edita "Molletes"**
3. **Cambiar subcategoría:** (si quieres, cambia de DULCES a otra)
4. **Cambiar precio:** (ej: de $40 a $42)
5. **Guardar cambios**
6. **Ir a POS y verificar:**

**Resultado esperado:**
- ✅ Las variantes siguen apareciendo agrupadas
- ✅ El modal de selección sigue funcionando
- ✅ Los precios se actualizaron correctamente
- ✅ NO se separaron las variantes

---

## 🧪 Test Completo de Flujo

### Escenario 1: Crear un Nuevo Producto con Variantes

1. **Admin → Inventario → Nuevo Producto**
2. **Nombre:** "Jugo de Naranja"
3. **Categoría:** "Bebidas"
4. **Precio:** $25
5. **Plantilla de Variantes:** Selecciona "Tamaños"
6. **Guardar**

**Verificar en POS:**
- ✅ Aparece como una tarjeta con el precio base
- ✅ Al clickear, muestra las variantes de tamaño
- ✅ Las variantes se muestran correctamente

---

### Escenario 2: Editar Producto Existente (El Fix)

1. **Admin → Inventario → Buscar "Molletes"**
2. **Editar**
3. **Cambiar subcategoría:** (de DULCES a algo otro)
4. **Cambiar precio:** (de $40 a $45)
5. **Cambiar nombre:** (ej: "Molletes Premium")
6. **Guardar**

**Verificar en POS:**
- ✅ Las variantes NO se separaron
- ✅ Las variantes siguen agrupadas bajo "Molletes Premium"
- ✅ Los precios se actualizaron
- ✅ El modal de selección funciona

---

### Escenario 3: Editar Precio de una Variante

1. **Admin → Inventario → Molletes → Ver Variantes**
2. **Editar precio de "Dulce":** de $30 a $32
3. **Guardar**

**Verificar en POS:**
- ✅ El precio de "Dulce" cambió a $32
- ✅ Las otras variantes mantienen sus precios
- ✅ Siguen agrupadas

---

## ✅ Checklist Final de Verificación

- [ ] Backend reiniciado correctamente
- [ ] BD muestra Molletes unificadas (query verificada)
- [ ] API devuelve variantes agrupadas (GET /519)
- [ ] POS muestra una tarjeta de Molletes (no 3)
- [ ] Modal de selección se abre al clickear
- [ ] Admin muestra las 3 variantes en gestor
- [ ] Editar producto no separa variantes
- [ ] Cambiar subcategoría no rompe agrupación
- [ ] Cambiar precios funciona correctamente
- [ ] Test Escenario 1 pasado ✅
- [ ] Test Escenario 2 pasado ✅
- [ ] Test Escenario 3 pasado ✅

---

## 📞 Si Algo No Funciona

### Problema: "Las variantes siguen separadas en POS"

**Solución:**
```bash
# 1. Verificar que el backend está corriendo
curl http://localhost:8080/swagger-ui.html

# 2. Si no responde, reiniciar backend
cd backend
pkill -f "java -jar"
sleep 3
bash start.sh

# 3. Esperar a que aparezca:
# "Tomcat started on port(s): 8080"

# 4. Limpiar caché del navegador (Ctrl+Shift+Delete)

# 5. Volver a POS y refrescar (F5)
```

### Problema: "Error 404 al acceder a API"

**Solución:**
- Verificar que estés usando el perfil `dev`: `-Dspring.profiles.active=dev`
- Verificar logs del backend: `tail -50 backend.log`
- Verificar que PostgreSQL está accesible: `psql -h yamabiko.proxy.rlwy.net ...`

### Problema: "La BD no tiene los cambios"

**Solución:**
```bash
# Ejecutar el script SQL nuevamente
psql -h yamabiko.proxy.rlwy.net -p 32280 -U postgres -d railway < backend/fix-molletes-variantes.sql

# Reiniciar backend para limpiar caché
pkill -f "java -jar"
sleep 3
bash start.sh
```

---

## 🎯 Resumen

| Paso | Acción | Verificación |
|------|--------|--------------|
| 1 | Reiniciar Backend | ✅ Backend responde en 8080 |
| 2 | Verificar BD | ✅ Molletes tienen producto_base_id |
| 3 | Verificar API | ✅ GET /519 devuelve variantes |
| 4 | Verificar POS | ✅ Aparece una tarjeta, no 3 |
| 5 | Verificar Admin | ✅ Ver Variantes muestra las 3 |
| 6 | Test de Edición | ✅ Cambios se guardan sin separar |

Si todo está ✅, **el fix está funcionando correctamente**.

