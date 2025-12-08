#!/bin/bash

# Script para matar el proceso viejo y reiniciar el backend

echo "Buscando procesos Java del backend..."
echo ""

# Listar procesos Java
tasklist | grep java

echo ""
echo "Intentando matar el proceso 15776..."
wmic process where ProcessId=15776 delete 2>/dev/null || echo "No se pudo matar con WMIC"

sleep 2

echo "Verificando que el proceso fue eliminado..."
tasklist | grep "15776" || echo "✅ Proceso 15776 eliminado"

echo ""
echo "Iniciando backend nuevo..."
cd "/c/Users/Gael Navarro/Documents/GitHub/punto-de-venta/backend"
./start.sh
