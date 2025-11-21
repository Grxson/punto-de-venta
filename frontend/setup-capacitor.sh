#!/bin/bash

# ========================================
# Script de Setup Frontend
# Instala Capacitor y configura plataformas
# ========================================

set -e

echo "📱 Setup Frontend - Capacitor"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio frontend/"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Instalar Capacitor
echo "⚡ Instalando Capacitor..."
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npm install @capacitor-community/electron

echo "✅ Capacitor instalado"
echo ""

# Preguntar por la URL del backend
echo "🔧 Configuración del Backend"
read -p "¿URL del backend en Railway? (Enter para omitir): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="http://localhost:8080"
    echo "   Usando URL por defecto: $BACKEND_URL"
fi

# Actualizar capacitor.config.ts (ya existe)
echo "✅ Configuración lista"
echo ""

# Instrucciones siguientes
echo "📋 Pasos siguientes:"
echo ""
echo "1️⃣  Para Android:"
echo "   npx cap add android"
echo "   npm run build"
echo "   npx cap sync android"
echo "   npx cap open android"
echo ""
echo "2️⃣  Para iOS:"
echo "   npx cap add ios"
echo "   cd ios/App && pod install && cd ../.."
echo "   npm run build"
echo "   npx cap sync ios"
echo "   npx cap open ios"
echo ""
echo "3️⃣  Para Escritorio (Electron):"
echo "   npx cap add @capacitor-community/electron"
echo "   npm run build"
echo "   npx cap sync @capacitor-community/electron"
echo "   npx cap open @capacitor-community/electron"
echo ""
echo "4️⃣  Actualizar backend URL:"
echo "   Editar: capacitor.config.ts"
echo "   Editar: src/config/api.config.ts"
echo "   Cambiar URLs de Railway después del deploy"
echo ""
echo "📚 Documentación completa en: MOBILE-DESKTOP-SETUP.md"
echo ""
echo "✨ Setup completado!"
