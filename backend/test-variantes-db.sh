#!/bin/bash

# Credenciales desde .env
source .env

# Configurar variables
DB_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
PGPASSWORD="${DB_PASSWORD}"
export PGPASSWORD

echo "🔗 Conectando a PostgreSQL..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo ""

# 1. Insertar tamaños base
echo "📝 1. Insertando tamaños base..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << SQL
INSERT INTO producto_tamaño (nombre, descripcion, precio_extra, orden, activo, created_at, updated_at) VALUES
('Pequeño', 'Tamaño pequeño', 0, 1, true, now(), now()),
('Mediano', 'Tamaño mediano', 5.00, 2, true, now(), now()),
('Grande', 'Tamaño grande', 10.00, 3, true, now(), now())
ON CONFLICT DO NOTHING;

SELECT '✅ Tamaños insertados' as resultado;
SQL

echo ""
echo "✅ Script ejecutado correctamente"
