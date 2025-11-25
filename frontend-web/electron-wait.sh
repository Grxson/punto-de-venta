#!/bin/bash
# Script para esperar a que Vite esté listo en cualquier puerto

echo "Esperando a que Vite esté listo..."

for port in 5173 5174 5175 5176; do
  if curl -s http://localhost:$port > /dev/null 2>&1; then
    echo "Vite encontrado en puerto $port"
    export VITE_PORT=$port
    break
  fi
done

# Esperar un poco más para asegurar que esté completamente listo
sleep 2

# Ejecutar Electron
electron .

