#!/bin/bash

# ========================================
# Script de Setup PostgreSQL Local
# Para probar antes de Railway
# ========================================

set -e

echo "🐘 Setup PostgreSQL Local"
echo ""

# Verificar que PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado"
    echo "   Instalar con: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ PostgreSQL detectado"
echo ""

# Configuración
DB_NAME="puntodeventa"
DB_USER="postgres"
DB_PASSWORD="postgres"

echo "📝 Configuración:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""

read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 0
fi

# Crear base de datos
echo "🔨 Creando base de datos..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
echo "✅ Base de datos creada"
echo ""

# Ejecutar schema.sql
echo "📊 Ejecutando schema.sql..."
sudo -u postgres psql -d $DB_NAME -f src/main/resources/schema.sql
echo "✅ Schema aplicado"
echo ""

# Verificar tablas
echo "📋 Tablas creadas:"
sudo -u postgres psql -d $DB_NAME -c "\dt"
echo ""

# Verificar datos iniciales
echo "👥 Roles creados:"
sudo -u postgres psql -d $DB_NAME -c "SELECT * FROM roles;"
echo ""

echo "✨ Setup completado!"
echo ""
echo "📝 Configurar application-dev.properties:"
echo "   spring.datasource.url=jdbc:postgresql://localhost:5432/$DB_NAME"
echo "   spring.datasource.username=$DB_USER"
echo "   spring.datasource.password=$DB_PASSWORD"
echo ""
echo "🚀 Ejecutar con: ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev"
