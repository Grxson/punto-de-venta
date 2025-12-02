# Guía: Campo `tipoGasto` en la Base de Datos

## Estructura en Base de Datos

### Tabla: `gastos`

Se agregó una nueva columna:

```sql
ALTER TABLE gastos 
ADD COLUMN tipo_gasto VARCHAR(50) DEFAULT 'Operacional' NOT NULL;

CREATE INDEX idx_gasto_tipo ON gastos(tipo_gasto);
```

**Valores permitidos:**
- `Operacional`: Gasto que aparece en el "Resumen del Día" (valor por defecto)
- `Administrativo`: Gasto que NO aparece en el "Resumen del Día"

---

## Backend: Métodos de Consulta

### En `GastoRepository`

```java
// Obtener todos los gastos operacionales
List<Gasto> findByTipoGasto(String tipoGasto);

// Obtener gastos operacionales en un rango de fechas
List<Gasto> findByTipoGastoAndFechaBetween(String tipoGasto, 
                                            LocalDateTime fechaInicio, 
                                            LocalDateTime fechaFin);

// Obtener gastos operacionales por sucursal y rango de fechas
List<Gasto> findByTipoGastoAndSucursalAndFechaBetween(String tipoGasto,
                                                        Long sucursalId,
                                                        LocalDateTime fechaInicio,
                                                        LocalDateTime fechaFin);

// Sumar montos de gastos de un tipo específico en un rango de fechas
java.math.BigDecimal sumMontoByTipoGastoAndFechaBetween(String tipoGasto,
                                                         LocalDateTime fechaInicio,
                                                         LocalDateTime fechaFin);
```

---

## Ejemplos de Uso en Backend

### 1. Obtener SOLO gastos Operacionales de hoy

```java
LocalDateTime hoyComienzo = LocalDateTime.now().toLocalDate().atStartOfDay();
LocalDateTime hoyFin = LocalDateTime.now().toLocalDate().atTime(23, 59, 59);

List<Gasto> gastosOperacionales = gastoRepository.findByTipoGastoAndFechaBetween(
    "Operacional", 
    hoyComienzo, 
    hoyFin
);
```

### 2. Sumar SOLO gastos Operacionales

```java
BigDecimal totalOperacionales = gastoRepository.sumMontoByTipoGastoAndFechaBetween(
    "Operacional", 
    fechaInicio, 
    fechaFin
);
```

### 3. Sumar SOLO gastos Administrativos

```java
BigDecimal totalAdministrativos = gastoRepository.sumMontoByTipoGastoAndFechaBetween(
    "Administrativo", 
    fechaInicio, 
    fechaFin
);
```

### 4. Reportes: Gastos Operacionales por sucursal

```java
List<Gasto> gastosOperacionalesSucursal = gastoRepository
    .findByTipoGastoAndSucursalAndFechaBetween(
        "Operacional", 
        sucursalId,
        fechaInicio, 
        fechaFin
    );
```

---

## Ejemplos de Queries SQL

### 1. Obtener SOLO gastos Operacionales

```sql
SELECT * FROM gastos 
WHERE tipo_gasto = 'Operacional' 
ORDER BY fecha DESC;
```

### 2. Sumar SOLO gastos Operacionales en un período

```sql
SELECT SUM(monto) as total_operacionales
FROM gastos
WHERE tipo_gasto = 'Operacional'
AND fecha BETWEEN '2025-12-01' AND '2025-12-31';
```

### 3. Sumar SOLO gastos Administrativos

```sql
SELECT SUM(monto) as total_administrativos
FROM gastos
WHERE tipo_gasto = 'Administrativo'
AND fecha BETWEEN '2025-12-01' AND '2025-12-31';
```

### 4. Comparación: Operacionales vs Administrativos

```sql
SELECT 
    tipo_gasto,
    COUNT(*) as cantidad,
    SUM(monto) as total
FROM gastos
WHERE fecha BETWEEN '2025-12-01' AND '2025-12-31'
GROUP BY tipo_gasto;
```

### 5. Gastos Operacionales por Categoría

```sql
SELECT 
    cg.nombre as categoria,
    COUNT(g.id) as cantidad,
    SUM(g.monto) as total
FROM gastos g
JOIN categorias_gasto cg ON g.categoria_gasto_id = cg.id
WHERE g.tipo_gasto = 'Operacional'
AND g.fecha BETWEEN '2025-12-01' AND '2025-12-31'
GROUP BY cg.nombre
ORDER BY total DESC;
```

### 6. Gastos Administrativos por Categoría

```sql
SELECT 
    cg.nombre as categoria,
    COUNT(g.id) as cantidad,
    SUM(g.monto) as total
FROM gastos g
JOIN categorias_gasto cg ON g.categoria_gasto_id = cg.id
WHERE g.tipo_gasto = 'Administrativo'
AND g.fecha BETWEEN '2025-12-01' AND '2025-12-31'
GROUP BY cg.nombre
ORDER BY total DESC;
```

### 7. Gastos Operacionales por Sucursal y Día

```sql
SELECT 
    DATE(g.fecha) as fecha,
    s.nombre as sucursal,
    COUNT(g.id) as cantidad,
    SUM(g.monto) as total
FROM gastos g
JOIN sucursales s ON g.sucursal_id = s.id
WHERE g.tipo_gasto = 'Operacional'
AND g.fecha BETWEEN '2025-12-01' AND '2025-12-31'
GROUP BY DATE(g.fecha), s.nombre
ORDER BY fecha DESC, sucursal;
```

### 8. Resumen Diario: Operacionales vs Administrativos

```sql
SELECT 
    DATE(g.fecha) as fecha,
    SUM(CASE WHEN g.tipo_gasto = 'Operacional' THEN g.monto ELSE 0 END) as operacionales,
    SUM(CASE WHEN g.tipo_gasto = 'Administrativo' THEN g.monto ELSE 0 END) as administrativos,
    SUM(g.monto) as total
FROM gastos g
WHERE g.fecha BETWEEN '2025-12-01' AND '2025-12-31'
GROUP BY DATE(g.fecha)
ORDER BY fecha DESC;
```

---

## Frontend: Cómo aparece en la API

Cada gasto devuelto por la API ahora incluye el campo `tipoGasto`:

```json
{
  "id": 1,
  "categoriaGastoId": 5,
  "categoriaGastoNombre": "Insumos",
  "monto": 500.00,
  "fecha": "2025-12-02T10:30:00",
  "nota": "Compra de papel",
  "tipoGasto": "Operacional",
  "usuarioNombre": "Juan Perez",
  "createdAt": "2025-12-02T10:30:00"
}
```

---

## Seguridad por Rol

- **Usuarios Admin** (AdminExpenses):
  - Ven TODOS los gastos (Operacional + Administrativo)
  - Pueden crear/editar ambos tipos
  - Pueden ver reportes de ambos tipos

- **Usuarios Regulares** (PosExpenses):
  - Solo ven gastos Operacionales
  - Solo pueden crear gastos Operacionales
  - Campo `tipoGasto` siempre deshabilitado (valor: "Operacional")

---

## Ejemplo Completo: Reporte de Resumen del Día

### Backend (GastoService)

```java
public BigDecimal obtenerTotalGastosOperacionalesDelDia() {
    LocalDateTime hoyComienzo = LocalDateTime.now().toLocalDate().atStartOfDay();
    LocalDateTime hoyFin = LocalDateTime.now().toLocalDate().atTime(23, 59, 59);
    
    return gastoRepository.sumMontoByTipoGastoAndFechaBetween(
        "Operacional", 
        hoyComienzo, 
        hoyFin
    );
}
```

### Fronend (Ejemplo: AdminExpenses)

```typescript
// Solo gastos Operacionales para el resumen
const totalGastosOperacionales = gastosFiltrados
  .filter(gasto => !gasto.tipoGasto || gasto.tipoGasto === 'Operacional')
  .reduce((sum, gasto) => sum + gasto.monto, 0);

// Solo gastos Administrativos (separados)
const totalGastosAdministrativos = gastosFiltrados
  .filter(gasto => gasto.tipoGasto === 'Administrativo')
  .reduce((sum, gasto) => sum + gasto.monto, 0);
```

---

## Migración de Datos (Si hay gastos existentes)

Si ya hay gastos en la BD sin el campo `tipoGasto`, se asignará automáticamente el valor por defecto "Operacional" para mantener compatibilidad con reportes existentes.

```sql
-- Verificar que todos los gastos existentes tengan un tipo
SELECT COUNT(*) FROM gastos WHERE tipo_gasto IS NULL;

-- Si hay NULL, asignarles "Operacional"
UPDATE gastos SET tipo_gasto = 'Operacional' WHERE tipo_gasto IS NULL;
```
