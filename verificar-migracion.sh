#!/bin/bash

# Script para verificar el estado de la migración de Flyway
# Uso: bash verificar-migracion.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║    VERIFICADOR DE MIGRACIÓN - VARIANTES PRODUCTOS      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo

# Crear un script SQL temporal
SCRIPT_SQL=$(mktemp)

cat > "$SCRIPT_SQL" << 'EOF'
-- Verificar que la migración de Flyway se ejecutó
SELECT 'MIGRACIONES DE FLYWAY' as verificacion;
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
ORDER BY version DESC 
LIMIT 5;

echo
echo "-- Verificar columnas en la tabla productos"
SELECT 'COLUMNAS EN TABLA PRODUCTOS' as verificacion;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos'
ORDER BY ordinal_position;

echo
echo "-- Verificar que existen las nuevas columnas"
SELECT 'NUEVAS COLUMNAS' as verificacion;
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('producto_base_id', 'nombre_variante', 'orden_variante', 'descripcion', 'costo_estimado', 'sku', 'disponible_en_menu')
ORDER BY column_name;

echo
echo "-- Verificar productos con variantes"
SELECT 'PRODUCTOS CON VARIANTES' as verificacion;
SELECT id, nombre, producto_base_id, nombre_variante 
FROM productos 
WHERE producto_base_id IS NOT NULL 
LIMIT 10;
EOF

# Instrucciones para ejecutar
echo "OPCIÓN 1: Ejecutar directamente desde Railway Dashboard"
echo "─────────────────────────────────────────────────────"
echo "1. Ve a tu proyecto en Railway: https://railway.app"
echo "2. Selecciona el servicio de PostgreSQL"
echo "3. Ve a la pestaña 'Query Editor' o 'Connect'"
echo "4. Copia y pega las siguientes queries:"
echo

cat "$SCRIPT_SQL"

echo
echo
echo "OPCIÓN 2: Ejecutar desde terminal (si tienes psql instalado)"
echo "────────────────────────────────────────────────────────────"
echo "psql 'your_database_url' -f '$SCRIPT_SQL'"
echo

echo "OPCIÓN 3: Verificar en los logs de Spring Boot"
echo "─────────────────────────────────────────────"
echo "Busca estas líneas en los logs:"
echo "  - 'Creating Flyway config'"
echo "  - 'Successfully validated 1 migration'"
echo "  - 'V001__Add_variantes_fields_to_productos.sql'"
echo "  - 'Schema creation of public.flyway_schema_history succeeded'"

# Limpiar
rm -f "$SCRIPT_SQL"

echo
echo "✓ Script de verificación generado"
echo "✓ Lugar de ejecución: ./backend/src/main/resources/db/migration/"
echo
