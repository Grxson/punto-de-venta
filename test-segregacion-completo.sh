#!/bin/bash

###############################################################################
# SCRIPT: Verificar Segregación de Sucursales - TEST COMPLETO
###############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
BACKEND_URL="http://localhost:8080"
LOG_FILE="/tmp/test_segregacion_completo_$(date +%s).log"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SEGREGACIÓN DE SUCURSALES - VERSIÓN COMPLETA${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📝 Logs guardados en: ${YELLOW}${LOG_FILE}${NC}"
echo ""

# PASO 0: Verificar que backend está disponible
echo -e "${BLUE}[PASO 0]${NC} Verificando conexión con backend..."
echo ""

BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/login")

if [ "$BACKEND_RESPONSE" = "000" ]; then
    echo -e "${RED}❌ Backend no está disponible en ${BACKEND_URL}${NC}"
    echo -e "${YELLOW}Por favor ejecuta en otra terminal: cd backend && ./start.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend disponible (HTTP ${BACKEND_RESPONSE})${NC}"
echo ""

# PASO 1: Prueba con usuario ADMIN (sucursal 1)
echo -e "${BLUE}[PASO 1]${NC} Login con usuario ADMIN (sucursal 1)..."
echo ""

LOGIN_ADMIN=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

echo "$LOGIN_ADMIN" >> "$LOG_FILE"

TOKEN_ADMIN=$(echo "$LOGIN_ADMIN" | jq -r '.token // empty')

if [ -z "$TOKEN_ADMIN" ]; then
    echo -e "${RED}❌ ERROR: No se pudo obtener token de admin${NC}"
    echo -e "${YELLOW}Respuesta:${NC}"
    echo "$LOGIN_ADMIN" | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Token de ADMIN obtenido${NC}"
echo ""

# Decodificar JWT de admin
echo -e "${BLUE}Decodificando JWT de ADMIN...${NC}"
PAYLOAD_ADMIN=$(echo "$TOKEN_ADMIN" | cut -d'.' -f2)
PADDING=$((${#PAYLOAD_ADMIN} % 4))
if [ $PADDING -ne 0 ]; then
    PAYLOAD_ADMIN="${PAYLOAD_ADMIN}$(printf '%*s' $((4 - PADDING)) | tr ' ' '=')"
fi

JWT_CLAIMS_ADMIN=$(echo "$PAYLOAD_ADMIN" | base64 -d | jq '.')
echo "$JWT_CLAIMS_ADMIN" | jq '.'
echo ""

SUCURSAL_ADMIN=$(echo "$JWT_CLAIMS_ADMIN" | jq -r '.sucursalId')
echo -e "${GREEN}✅ ADMIN tiene sucursal_id = ${SUCURSAL_ADMIN}${NC}"
echo ""

# PASO 2: Llamar estadísticas con token de ADMIN
echo -e "${BLUE}[PASO 2]${NC} Llamando /api/estadisticas/ventas/dia como ADMIN..."
echo ""

STATS_ADMIN=$(curl -s -X GET "${BACKEND_URL}/api/estadisticas/ventas/dia" \
  -H "Authorization: Bearer ${TOKEN_ADMIN}" \
  -H "Content-Type: application/json")

echo "$STATS_ADMIN" >> "$LOG_FILE"

echo -e "${GREEN}Respuesta para ADMIN (sucursal 1):${NC}"
echo "$STATS_ADMIN" | jq '.'
echo ""

TOTAL_VENTAS_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.totalVentas // "ERROR"')
TOTAL_GASTOS_ADMIN=$(echo "$STATS_ADMIN" | jq -r '.totalGastos // "ERROR"')

echo "Total Ventas: ${YELLOW}${TOTAL_VENTAS_ADMIN}${NC}"
echo "Total Gastos: ${YELLOW}${TOTAL_GASTOS_ADMIN}${NC}"
echo ""

# VERIFICACIÓN: ADMIN debe ver sus datos (sucursal 1 = muchas ventas)
if [ "$TOTAL_VENTAS_ADMIN" != "0" ] && [ "$TOTAL_VENTAS_ADMIN" != "ERROR" ]; then
    echo -e "${GREEN}✅ ADMIN ve datos (sucursal 1): ${TOTAL_VENTAS_ADMIN}${NC}"
else
    echo -e "${YELLOW}⚠️  ADMIN no tiene datos para hoy (sucursal 1)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# PASO 3: Prueba con usuario DEV (sucursal 2)
echo -e "${BLUE}[PASO 3]${NC} Login con usuario DEV (sucursal 2)..."
echo ""

LOGIN_DEV=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"dev","password":"dev"}')

echo "$LOGIN_DEV" >> "$LOG_FILE"

TOKEN_DEV=$(echo "$LOGIN_DEV" | jq -r '.token // empty')

if [ -z "$TOKEN_DEV" ]; then
    echo -e "${RED}❌ ERROR: No se pudo obtener token de dev${NC}"
    echo -e "${YELLOW}Respuesta:${NC}"
    echo "$LOGIN_DEV" | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Token de DEV obtenido${NC}"
echo ""

# Decodificar JWT de dev
echo -e "${BLUE}Decodificando JWT de DEV...${NC}"
PAYLOAD_DEV=$(echo "$TOKEN_DEV" | cut -d'.' -f2)
PADDING=$((${#PAYLOAD_DEV} % 4))
if [ $PADDING -ne 0 ]; then
    PAYLOAD_DEV="${PAYLOAD_DEV}$(printf '%*s' $((4 - PADDING)) | tr ' ' '=')"
fi

JWT_CLAIMS_DEV=$(echo "$PAYLOAD_DEV" | base64 -d | jq '.')
echo "$JWT_CLAIMS_DEV" | jq '.'
echo ""

SUCURSAL_DEV=$(echo "$JWT_CLAIMS_DEV" | jq -r '.sucursalId')
echo -e "${GREEN}✅ DEV tiene sucursal_id = ${SUCURSAL_DEV}${NC}"

if [ "$SUCURSAL_DEV" != "2" ]; then
    echo -e "${RED}❌ PROBLEMA: DEV debe tener sucursal_id=2 pero tiene ${SUCURSAL_DEV}${NC}"
fi

echo ""

# PASO 4: Llamar estadísticas con token de DEV
echo -e "${BLUE}[PASO 4]${NC} Llamando /api/estadisticas/ventas/dia como DEV..."
echo ""

STATS_DEV=$(curl -s -X GET "${BACKEND_URL}/api/estadisticas/ventas/dia" \
  -H "Authorization: Bearer ${TOKEN_DEV}" \
  -H "Content-Type: application/json")

echo "$STATS_DEV" >> "$LOG_FILE"

echo -e "${GREEN}Respuesta para DEV (sucursal 2):${NC}"
echo "$STATS_DEV" | jq '.'
echo ""

TOTAL_VENTAS_DEV=$(echo "$STATS_DEV" | jq -r '.totalVentas // "ERROR"')
TOTAL_GASTOS_DEV=$(echo "$STATS_DEV" | jq -r '.totalGastos // "ERROR"')

echo "Total Ventas: ${YELLOW}${TOTAL_VENTAS_DEV}${NC}"
echo "Total Gastos: ${YELLOW}${TOTAL_GASTOS_DEV}${NC}"
echo ""

# PASO 5: VERIFICACIÓN CRÍTICA - ¿Están segregados?
echo -e "${BLUE}[PASO 5]${NC} VERIFICACIÓN DE SEGREGACIÓN..."
echo ""

echo -e "${BLUE}Comparativa:${NC}"
echo "ADMIN (sucursal 1) - Ventas: ${YELLOW}${TOTAL_VENTAS_ADMIN}${NC}, Gastos: ${YELLOW}${TOTAL_GASTOS_ADMIN}${NC}"
echo "DEV   (sucursal 2) - Ventas: ${YELLOW}${TOTAL_VENTAS_DEV}${NC}, Gastos: ${YELLOW}${TOTAL_GASTOS_DEV}${NC}"
echo ""

# Verificar que DEV debe ver $4.00
if [ "$TOTAL_VENTAS_DEV" = "4" ] || [ "$TOTAL_VENTAS_DEV" = "4.00" ]; then
    echo -e "${GREEN}✅ CORRECTO: DEV (sucursal 2) ve $4.00 en ventas${NC}"
    echo -e "${GREEN}✅ Segregación funcionando correctamente${NC}"
elif [ "$TOTAL_VENTAS_DEV" = "0" ]; then
    echo -e "${YELLOW}⚠️  DEV ve $0 en ventas (verificar si hay datos para sucursal 2 hoy)${NC}"
else
    # Verificar que NO sean los mismos valores que ADMIN
    if [ "$TOTAL_VENTAS_ADMIN" != "ERROR" ] && [ "$TOTAL_VENTAS_DEV" != "ERROR" ]; then
        if [ "$TOTAL_VENTAS_ADMIN" = "$TOTAL_VENTAS_DEV" ]; then
            echo -e "${RED}❌ ERROR CRÍTICO: DEV ve los mismos datos que ADMIN${NC}"
            echo -e "${RED}   Esto indica FALLA en la segregación${NC}"
        else
            echo -e "${YELLOW}⚠️  DEV ve datos diferentes a ADMIN (verificar si son correctos)${NC}"
        fi
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST COMPLETADO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📋 Próximos pasos si hay problemas:"
echo -e "   1. Revisar: ${YELLOW}tail -50 ${LOG_FILE}${NC}"
echo -e "   2. Verificar logs del backend: ${YELLOW}grep -i 'SucursalContext' <logs>${NC}"
echo -e "   3. Confirmar usuario dev tiene sucursal_id=2 en BD"
echo ""
