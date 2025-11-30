# Guía Rápida: Eliminar Productos Duplicados

## Productos afectados (según imagen):
- Naranja
- Toronja
- Zanahoria
- Mixto
- Verde
- Verde Especial
- Mixto Betabel
- Naranja/Toronja
- Naranja/Zanahoria
- Zanahoria/Toronja
- Betabel/Naranja
- Betabel/Zanahoria
- Naranja/Toronja (otra variante)
- Naranja/Zanahoria (otra variante)
- Zanahoria/Toronja (otra variante)

## Problema:
Algunos productos están duplicados en la BD. Al abrir el modal, algunos aparecen con precio de tamaño chico en $0 y otros con precio $22.

## Solución:

### Opción 1: Automática (Recomendada)
Ejecuta el archivo: `EJECUTAR-eliminar-duplicados.sql`

Este script:
1. Identifica automáticamente los duplicados
2. Elimina los que tienen precio = 0
3. Si ambos tienen precio, elimina el más reciente
4. No toca productos con pedidos asociados
5. Usa transacción (puedes hacer ROLLBACK)

### Opción 2: Manual (Más control)

#### Paso 1: Conecta a tu base de datos
```bash
psql -h localhost -U postgres -d railway
# O usa DBeaver / pgAdmin / TablePlus
```

#### Paso 2: Ejecuta la consulta de identificación
```sql
-- Ver productos duplicados
SELECT 
    p.id,
    p.nombre,
    p.precio,
    (SELECT COUNT(*) FROM productos v WHERE v.producto_base_id = p.id) as variantes
FROM productos p
WHERE p.producto_base_id IS NULL
  AND p.nombre IN ('Naranja', 'Toronja', 'Zanahoria', 'Mixto', 'Verde', 
                    'Verde Especial', 'Mixto Betabel', 'Naranja/Toronja',
                    'Naranja/Zanahoria', 'Zanahoria/Toronja', 
                    'Betabel/Naranja', 'Betabel/Zanahoria')
ORDER BY p.nombre, p.precio DESC;
```

#### Paso 3: Identifica los IDs a eliminar
Toma nota de los IDs de los productos con precio = 0 o precio menor.

#### Paso 4: Elimina manualmente
```sql
BEGIN;

-- Reemplaza [ID1, ID2, ...] con los IDs que anotaste
-- Por ejemplo: DELETE FROM productos WHERE producto_base_id IN (123, 456, 789);

-- Primero eliminar variantes
DELETE FROM productos WHERE producto_base_id IN ([IDs_a_eliminar]);

-- Luego eliminar productos base
DELETE FROM productos WHERE id IN ([IDs_a_eliminar]);

-- Verificar
SELECT * FROM productos WHERE producto_base_id IS NULL 
  AND nombre IN ('Naranja', 'Toronja', 'Zanahoria');

-- Si todo está bien:
COMMIT;

-- Si algo salió mal:
-- ROLLBACK;
```

## Recomendación:
✅ **Usa la Opción 1 (archivo EJECUTAR-eliminar-duplicados.sql)**

Es más segura porque:
- Identifica automáticamente los duplicados
- Aplica reglas consistentes
- Usa transacción
- No elimina productos con pedidos

## Criterio de eliminación:
1. ✅ **Mantener**: Productos con precio > 0
2. ❌ **Eliminar**: Productos con precio = 0
3. ✅ **Mantener**: Si ambos tienen precio, mantener el de mayor precio
4. ✅ **Mantener**: Si tienen el mismo precio, mantener el más antiguo
5. ✅ **Nunca eliminar**: Productos que tengan pedidos asociados

## Backup antes de ejecutar:
```bash
# Hacer backup de la tabla productos
pg_dump -h localhost -U postgres -d railway -t productos > backup_productos_$(date +%Y%m%d_%H%M%S).sql

# O hacer backup completo
pg_dump -h localhost -U postgres -d railway > backup_completo_$(date +%Y%m%d_%H%M%S).sql
```

## Después de eliminar:
Verifica que ya no haya duplicados:
```sql
SELECT nombre, COUNT(*) as cantidad
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1;
```

Si esta consulta no retorna nada = ✅ ¡Éxito!

## Problemas comunes:

### Si un producto tiene pedidos:
El script no lo eliminará automáticamente. Necesitarás:
1. Decidir si migrarlo o dejarlo
2. O actualizar los pedidos manualmente

### Si ambos tienen el mismo precio:
El script mantendrá el más antiguo (por created_at).

## Archivos creados:
- `EJECUTAR-eliminar-duplicados.sql` - Script principal (recomendado)
- `ver-duplicados-rapido.sql` - Para consultas rápidas
- `identificar-eliminar-duplicados.sql` - Script detallado con más opciones
- `README-eliminar-duplicados.md` - Esta guía
