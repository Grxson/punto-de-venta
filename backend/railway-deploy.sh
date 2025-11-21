#!/bin/bash

# ========================================
# Script de Despliegue Railway
# Punto de Venta - Backend
# ========================================

set -e  # Salir si hay algún error

echo "🚂 Preparando despliegue en Railway..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "pom.xml" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio backend/"
    exit 1
fi

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
./mvnw clean

# Compilar proyecto
echo "🔨 Compilando proyecto..."
./mvnw package -DskipTests

# Verificar que el JAR se creó
if [ ! -f target/backend-*.jar ]; then
    echo "❌ Error: No se pudo generar el JAR"
    exit 1
fi

echo "✅ JAR generado exitosamente"
echo ""

# Instrucciones para Railway
echo "📋 Pasos siguientes para desplegar en Railway:"
echo ""
echo "1️⃣  Crear proyecto en Railway:"
echo "   - Ve a https://railway.app"
echo "   - Click en 'New Project'"
echo ""
echo "2️⃣  Agregar PostgreSQL:"
echo "   - Click en 'Add Service' → 'Database' → 'PostgreSQL'"
echo "   - Railway creará la base de datos automáticamente"
echo ""
echo "3️⃣  Conectarse a PostgreSQL y ejecutar schema.sql:"
echo "   - railway connect postgres"
echo "   - \\i src/main/resources/schema.sql"
echo "   - \\q"
echo ""
echo "4️⃣  Agregar Backend:"
echo "   - Click en 'Add Service' → 'GitHub Repo'"
echo "   - Seleccionar 'punto-de-venta'"
echo "   - Root Directory: backend"
echo ""
echo "5️⃣  Configurar Variables de Entorno (Backend):"
echo "   SPRING_PROFILES_ACTIVE=prod"
echo "   DB_USERNAME=\${{Postgres.PGUSER}}"
echo "   DB_PASSWORD=\${{Postgres.PGPASSWORD}}"
echo "   SPRING_DATASOURCE_URL=jdbc:postgresql://\${{Postgres.PGHOST}}:\${{Postgres.PGPORT}}/\${{Postgres.PGDATABASE}}"
echo "   ADMIN_USERNAME=admin"
echo "   ADMIN_PASSWORD=[generar password seguro]"
echo "   CORS_ORIGINS=https://tuapp.railway.app,capacitor://localhost"
echo ""
echo "6️⃣  Verificar despliegue:"
echo "   - https://tu-backend.railway.app/actuator/health"
echo "   - https://tu-backend.railway.app/api/version"
echo ""
echo "📚 Documentación completa en: RAILWAY-DEPLOYMENT.md"
echo ""
echo "✨ Build completado exitosamente!"
