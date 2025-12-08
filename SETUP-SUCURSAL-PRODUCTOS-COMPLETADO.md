# 🎉 Setup de Sucursal_Productos Completado

## Resumen de la Ejecución

**Fecha**: 6 de diciembre de 2025  
**Status**: ✅ **EXITOSO**  
**Duración**: < 1 minuto

---

## ✅ Lo que se ejecutó

### 1. Conexión a Railway PostgreSQL
- **Host**: yamabiko.proxy.rlwy.net
- **Puerto**: 32280
- **Base de datos**: railway
- **Usuario**: postgres
- **Status**: ✅ Conexión exitosa

### 2. Creación de la tabla `sucursal_productos`

```sql
CREATE TABLE IF NOT EXISTS sucursal_productos (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    precio_sucursal DECIMAL(12, 2),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INT,
    stock_maximo INT,
    horario_disponibilidad TEXT,
    dias_disponibilidad TEXT,
    notas VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (sucursal_id, producto_id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

**Status**: ✅ Tabla creada con índices

### 3. Asignación de Productos a Sucursal ID 1

| Métrica | Valor |
|---------|-------|
| **Total de productos asignados** | 174 |
| **Sucursal** | 1 (Sucursal Principal) |
| **Estado disponible** | true |
| **Orden visual inicial** | 0 |

---

## 📊 Datos Verificados

### Sucursales en la BD
```
 id |       nombre       | email | telefono 
----+--------------------+-------+----------
  1 | Sucursal Principal |       | 
  2 | Sucursal Principal |       | 
```

### Productos en Sucursal 1 (Muestra de 10)
```
 id  |     nombre      | disponible | orden_visualizacion 
-----+-----------------+------------+---------------------
 167 | Naranja         | t          |                   0
   1 | Naranja Chico   | t          |                   0
   2 | Naranja Mediano | t          |                   0
   3 | Naranja Grande  | t          |                   0
   4 | Toronja         | t          |                   0
   5 | Toronja Chico   | t          |                   0
   6 | Toronja Mediano | t          |                   0
   7 | Toronja Grande  | t          |                   0
   8 | Zanahoria       | t          |                   0
   9 | Zanahoria Chico | t          |                   0
```

---

## 🛠️ Scripts Generados

### 1. `backend/scripts/setup-sucursal-productos.sql`
- **Tipo**: Script SQL de inicialización
- **Contenido**: 
  - Creación de tabla sucursal_productos
  - Creación de índices
  - Inserción de sucursal Centro (si no existe)
  - Asignación de 174 productos activos
  - Queries de verificación

### 2. `backend/scripts/run-setup.sh`
- **Tipo**: Script Bash automatizado
- **Funcionalidad**:
  - Lee credenciales de `.env`
  - Verifica conexión a PostgreSQL
  - Ejecuta script SQL
  - Muestra resumen de resultados

---

## 🔧 Cómo Usar los Scripts

### Opción 1: Ejecutar el script bash (recomendado)
```bash
cd /home/grxson/Documentos/Github/punto-de-venta
bash backend/scripts/run-setup.sh
```

**Ventajas**:
- Automatizado
- Verifica conexión
- Muestra resumen
- Maneja errores

### Opción 2: Ejecutar SQL manualmente
```bash
PGPASSWORD="wJKSbcSmVIZwlENHMugzIxdIrNwumWft" psql \
  -h "yamabiko.proxy.rlwy.net" \
  -p "32280" \
  -U "postgres" \
  -d "railway" \
  -f "backend/scripts/setup-sucursal-productos.sql"
```

---

## 📋 Estado de la Base de Datos

### Tabla `sucursal_productos`

**Status**: ✅ **CREADA Y POBLADA**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGSERIAL | Clave primaria |
| sucursal_id | BIGINT | FK a sucursales |
| producto_id | BIGINT | FK a productos |
| precio_sucursal | DECIMAL(12,2) | Precio específico de sucursal (NULL = precio del producto) |
| disponible | BOOLEAN | Producto activo en la sucursal |
| orden_visualizacion | INT | Orden en el menú |
| stock_maximo | INT | Stock límite por sucursal |
| horario_disponibilidad | TEXT | JSON con horario {inicio, fin} |
| dias_disponibilidad | TEXT | JSON con días [1-7] |
| notas | VARCHAR(500) | Notas específicas de la sucursal |
| created_at | TIMESTAMP | Creado |
| updated_at | TIMESTAMP | Actualizado |

**Índices creados**:
- ✅ idx_sucursal_producto_sucursal (sucursal_id)
- ✅ idx_sucursal_producto_producto (producto_id)
- ✅ idx_sucursal_producto_disponible (disponible)
- ✅ idx_sucursal_producto_orden (orden_visualizacion)

**Constraints**:
- ✅ UNIQUE (sucursal_id, producto_id)
- ✅ FK sucursal_id → sucursales.id
- ✅ FK producto_id → productos.id

### Datos Iniciales

| Métrica | Cantidad |
|---------|----------|
| Sucursales | 2 |
| Productos activos | 174 |
| Asignaciones sucursal_productos | 174 |
| Productos por sucursal 1 | 174 |

---

## 🚀 Próximos Pasos

### 1. **Verificar en el Backend** (Inmediato)
```bash
# Ejecutar el backend
cd backend
./start.sh
```

- Verifica que los productos se cargan desde sucursal_productos
- Revisa los logs en http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

### 2. **Crear Más Sucursales** (Si es necesario)

```sql
-- Script para agregar más sucursales
INSERT INTO sucursales (nombre, direccion, activo, email, telefono, activa)
VALUES 
  ('Sucursal Sur', 'Calle Sur 123', 1, 'sur@ejemplo.com', '+5551234567', true),
  ('Sucursal Oeste', 'Av Oeste 456', 1, 'oeste@ejemplo.com', '+5559876543', true),
  ('Sucursal Este', 'Calle Este 789', 1, 'este@ejemplo.com', '+5552468135', true);

-- Luego asignar productos a estas nuevas sucursales
INSERT INTO sucursal_productos (sucursal_id, producto_id, disponible, orden_visualizacion)
SELECT 2, id, true, 0 FROM productos WHERE activo = 1;

INSERT INTO sucursal_productos (sucursal_id, producto_id, disponible, orden_visualizacion)
SELECT 3, id, true, 0 FROM productos WHERE activo = 1;
```

### 3. **Establecer Precios Diferentes por Sucursal** (Opcional)

```sql
-- Ejemplo: Café más caro en sucursal 2 (Sur)
UPDATE sucursal_productos 
SET precio_sucursal = 2.50
WHERE sucursal_id = 2 AND producto_id = 2;  -- Producto 2 = Café
```

### 4. **Configurar Órdenes Visuales Diferentes** (Opcional)

```sql
-- Cambiar orden en sucursal 2 (Sur)
UPDATE sucursal_productos 
SET orden_visualizacion = 1
WHERE sucursal_id = 2 AND producto_id = 1;  -- Producto 1 primero en Sur

UPDATE sucursal_productos 
SET orden_visualizacion = 2
WHERE sucursal_id = 2 AND producto_id = 2;  -- Producto 2 segundo en Sur
```

### 5. **Configurar Disponibilidad Horaria** (Avanzado)

```sql
-- Ejemplo: Jugo disponible solo por la mañana (6 AM a 12 PM)
UPDATE sucursal_productos 
SET horario_disponibilidad = '{"inicio": "06:00", "fin": "12:00"}'
WHERE producto_id = 1 AND sucursal_id = 1;

-- Ejemplo: Disponible solo de lunes a sábado
UPDATE sucursal_productos 
SET dias_disponibilidad = '{"dias": [1,2,3,4,5,6]}'
WHERE producto_id = 1 AND sucursal_id = 1;
```

---

## 🔐 Credenciales de Conexión

**Archivo**: `backend/.env`

```bash
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=32280
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=wJKSbcSmVIZwlENHMugzIxdIrNwumWft
```

**Nota**: NO subir a Git (ya está en .gitignore)

---

## 📝 Query Útiles para Verificación

### Ver todos los productos de una sucursal
```sql
SELECT sp.id, p.nombre, sp.precio_sucursal, sp.disponible, sp.orden_visualizacion
FROM sucursal_productos sp
JOIN productos p ON sp.producto_id = p.id
WHERE sp.sucursal_id = 1
ORDER BY sp.orden_visualizacion ASC;
```

### Ver cuántos productos hay en cada sucursal
```sql
SELECT 
    s.id,
    s.nombre,
    COUNT(sp.id) as total_productos
FROM sucursales s
LEFT JOIN sucursal_productos sp ON s.id = sp.sucursal_id
GROUP BY s.id, s.nombre;
```

### Ver productos con precios diferentes
```sql
SELECT 
    sp.id,
    p.nombre,
    sp.sucursal_id,
    s.nombre as sucursal_nombre,
    p.precio as precio_global,
    sp.precio_sucursal,
    (sp.precio_sucursal - p.precio) as diferencia
FROM sucursal_productos sp
JOIN productos p ON sp.producto_id = p.id
JOIN sucursales s ON sp.sucursal_id = s.id
WHERE sp.precio_sucursal IS NOT NULL
AND sp.precio_sucursal != p.precio;
```

---

## 🎯 Checklist de Validación

- [x] ✅ Tabla `sucursal_productos` creada
- [x] ✅ Índices creados
- [x] ✅ Constraints de FK establecidos
- [x] ✅ Sucursal ID 1 existe
- [x] ✅ 174 productos asignados a sucursal 1
- [x] ✅ Todos los productos con `disponible = true`
- [ ] ⚠️ Verificar en backend (próximo paso)
- [ ] ⚠️ Crear más sucursales (si necesario)
- [ ] ⚠️ Establecer precios diferentes (si necesario)
- [ ] ⚠️ Configurar órdenes visuales (si necesario)

---

## 📞 Soporte y Troubleshooting

### Error: "Conexión rechazada"
**Solución**: Verificar que Railway está activo y las credenciales en `.env` son correctas

### Error: "Tabla ya existe"
**Solución**: Es normal. El script usa `IF NOT EXISTS` para evitar conflictos. Puedes ejecutarlo múltiples veces sin problemas.

### Error: "FK constraint violation"
**Solución**: Asegurar que la sucursal ID 1 y los productos existen antes de insertar en sucursal_productos

### Ver logs del script
```bash
bash backend/scripts/run-setup.sh 2>&1 | tee setup.log
```

---

*Documento generado: 6 de diciembre de 2025*  
*Setup realizado en: < 1 minuto*  
*Status final: ✅ EXITOSO*
