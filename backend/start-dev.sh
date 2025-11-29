#!/bin/bash

# Script para iniciar el backend conectado a Railway PostgreSQL

echo "🚀 Iniciando Punto de Venta Backend (conectado a Railway)..."
echo ""

# Verificar si existe .env
if [ -f .env ]; then
    echo "✅ Encontrado archivo .env, cargando variables..."
    # Cargar variables de entorno desde .env (ignorando comentarios y líneas vacías)
    set -a  # Exportar automáticamente todas las variables
    source <(cat .env | grep -v '^#' | grep -v '^$')
    set +a
else
    echo "⚠️  No se encontró archivo .env"
    echo "💡 Copia .env.example a .env y configura las variables de Railway"
    echo ""
    exit 1
fi

# Verificar variables requeridas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ ERROR: Variables de Railway no configuradas"
    echo ""
    echo "📋 Tu archivo .env debe contener:"
    echo "   DB_HOST=tu-host.railway.app"
    echo "   DB_PORT=5432"
    echo "   DB_NAME=railway"
    echo "   DB_USER=postgres"
    echo "   DB_PASSWORD=tu-password"
    echo ""
    echo "💡 Obtén estos valores desde Railway Dashboard > PostgreSQL > Variables"
    echo ""
    exit 1
fi

echo "🔗 Conectando a: $DB_HOST:$DB_PORT/$DB_NAME (usuario: $DB_USER)"
echo ""

# Ejecutar Maven con variables de entorno
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
