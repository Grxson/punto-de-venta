# Migración de Base de Datos - Variantes de Productos

**Fecha**: 1 de diciembre de 2025
**Ambiente**: Railway PostgreSQL

## Problema

La tabla `productos` en la base de datos Railway no tiene los campos necesarios para soportar variantes:
- `producto_base_id` - Referencia al producto base
- `nombre_variante` - Nombre corto de la variante
- `orden_variante` - Orden de presentación
- `descripcion` - Descripción del producto
- `costo_estimado` - Costo estimado
- `sku` - Código único del producto
- `disponible_en_menu` - Disponibilidad en menú

## Solución

Se ha creado una migración de Flyway: `V001__Add_variantes_fields_to_productos.sql`

### ¿Qué hace la migración?

1. **Agrega columnas**: Añade todos los campos faltantes a la tabla `productos`
2. **Crea constraintas**: Agrega la foreign key para `producto_base_id`
3. **Crea índices**: Optimiza búsquedas de variantes
4. **Actualiza datos**: Establece valores por defecto para datos existentes

### Cómo ejecutar la migración

**Opción 1: Automáticamente al iniciar la aplicación**

Flyway ejecutará automáticamente todas las migraciones no ejecutadas cuando se inicie el backend:

```bash
cd backend
./mvnw spring-boot:run
```

La migración se ejecutará durante el startup de Spring Boot.

**Opción 2: Manualmente con SQL**

Si prefieres ejecutar manualmente en Railway:

1. Accede a la consola de PostgreSQL en Railway
2. Ejecuta el contenido de `db/migration/V001__Add_variantes_fields_to_productos.sql`

### Verificar que la migración se ejecutó

Una vez que el backend inicie, verifica que los campos existan:

```sql
-- Conectarse a Railway PostgreSQL
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;
```

Deberías ver estas nuevas columnas:
- `descripcion` (TEXT)
- `costo_estimado` (NUMERIC)
- `sku` (VARCHAR)
- `disponible_en_menu` (BOOLEAN)
- `producto_base_id` (BIGINT)
- `nombre_variante` (VARCHAR)
- `orden_variante` (INTEGER)

### Después de la migración

Una vez que los campos existan en la base de datos:

1. ✅ Las variantes se cargarán correctamente
2. ✅ El "Gestor de Variantes" mostrará las variantes existentes
3. ✅ Podrás agregar nuevas variantes
4. ✅ El modal de POS mostrará los tamaños/variantes al seleccionar un producto

## Notas Técnicas

### Archivo de Migración
- **Ubicación**: `backend/src/main/resources/db/migration/V001__Add_variantes_fields_to_productos.sql`
- **Naming**: Sigue el patrón de Flyway: `V{version}__{description}.sql`
- **Ejecución**: Automática al iniciar Spring Boot (solo si no ha sido ejecutada antes)

### Tabla flyway_schema_history
Flyway registra todas las migraciones ejecutadas en la tabla `flyway_schema_history`:
```sql
SELECT * FROM flyway_schema_history;
```

### Rollback (si es necesario)
Si necesitas deshacer la migración, deberías:
1. Crear una nueva migración `V002__Rollback_variantes_fields.sql` (recomendado)
2. O eliminar manualmente la migración ejecutada de `flyway_schema_history` (no recomendado)

## Próximos Pasos

1. Inicia el backend: `./mvnw spring-boot:run`
2. Espera a que Flyway ejecute la migración (verás logs en la consola)
3. Verifica que el "Gestor de Variantes" ahora muestre las variantes
4. Prueba agregar nuevas variantes a un producto

## Troubleshooting

### Las variantes aún no aparecen
1. Verifica en los logs que la migración se ejecutó sin errores
2. Consulta la tabla `flyway_schema_history` para confirmar
3. Verifica manualmente que los campos existan en la tabla `productos`

### Error: "Foreign key constraint violated"
Si el producto base no existe:
- Asegúrate de que `producto_base_id` referencia un producto válido
- Verifica que el producto no se haya eliminado

### Columnas duplicadas
Si las columnas ya existen:
- La migración usa `IF NOT EXISTS` para evitar errores
- No se ejecutará nuevamente
- Es seguro ejecutarla múltiples veces
