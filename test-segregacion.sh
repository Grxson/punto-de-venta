#!/bin/bash

###############################################################################
# SCRIPT: Verificar Segregación de Sucursales - DailyStats
###############################################################################
# Este script hace login como usuario 'dev' (sucursal 2) y verifica que:
# 1. El token contiene sucursal_id=2
# 2. El endpoint /api/estadisticas/ventas/dia retorna $4.00 (no datos de sucursal 1)
# 3. Los logs muestran que SucursalContext se inicializa correctamente

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
BACKEND_URL="http://localhost:8080"
USERNAME="dev"
PASSWORD="dev"
LOG_FILE="/tmp/test_segregacion_$(date +%s).log"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST SEGREGACIÓN DE SUCURSALES - DailyStats${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📝 Logs guardados en: ${YELLOW}${LOG_FILE}${NC}"
echo ""

# PASO 1: Login como usuario dev (sucursal 2)
echo -e "${BLUE}[PASO 1]${NC} Haciendo login como ${YELLOW}${USERNAME}${NC}..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"${USERNAME}\", \"password\": \"${PASSWORD}\"}")

echo "$LOGIN_RESPONSE" >> "$LOG_FILE"

# Extraer token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ ERROR: No se pudo obtener el token.${NC}"
    echo -e "${RED}Respuesta del servidor:${NC}"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✅ Token obtenido${NC}"
echo ""

# PASO 2: Decodificar el JWT para ver su contenido
echo -e "${BLUE}[PASO 2]${NC} Decodificando JWT para verificar claims..."
echo ""

# Función para decodificar JWT (sin validar firma)
decode_jwt() {
    local token=$1
    # Obtener la parte payload del JWT (segunda parte entre puntos)
    local payload=$(echo "$token" | cut -d'.' -f2)
    
    # Agregar padding si es necesario
    local padding=$((${#payload} % 4))
    if [ $padding -ne 0 ]; then
        payload="${payload}$(printf '%*s' $((4 - padding)) | tr ' ' '=')"
    fi
    
    # Decodificar base64
    echo "$payload" | base64 -d | jq '.' 2>/dev/null
}

JWT_CLAIMS=$(decode_jwt "$TOKEN")

if [ -z "$JWT_CLAIMS" ]; then
    echo -e "${RED}❌ No se pudo decodificar el JWT${NC}"
    exit 1
fi

echo -e "${GREEN}JWT Claims:${NC}"
echo "$JWT_CLAIMS" | jq '.'
echo ""

# Extraer sucursalId del token
SUCURSAL_ID_FROM_TOKEN=$(echo "$JWT_CLAIMS" | jq -r '.sucursalId // empty')

if [ -z "$SUCURSAL_ID_FROM_TOKEN" ]; then
    echo -e "${RED}❌ ERROR CRÍTICO: Token NO contiene 'sucursalId'${NC}"
    echo -e "${YELLOW}⚠️  Esto explica por qué ves datos de sucursal 1 (fallback)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Token contiene sucursalId = ${SUCURSAL_ID_FROM_TOKEN}${NC}"
    
    if [ "$SUCURSAL_ID_FROM_TOKEN" = "2" ]; then
        echo -e "${GREEN}✅ CORRECTO: Usuario dev debe tener sucursal_id=2${NC}"
    else
        echo -e "${YELLOW}⚠️  ADVERTENCIA: Usuario dev tiene sucursal_id=${SUCURSAL_ID_FROM_TOKEN} (se esperaba 2)${NC}"
    fi
fi

echo ""

# PASO 3: Llamar al endpoint /api/estadisticas/ventas/dia
echo -e "${BLUE}[PASO 3]${NC} Llamando a ${YELLOW}/api/estadisticas/ventas/dia${NC}..."
echo ""

STATS_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/api/estadisticas/ventas/dia" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "$STATS_RESPONSE" >> "$LOG_FILE"

echo -e "${GREEN}Respuesta de estadísticas:${NC}"
echo "$STATS_RESPONSE" | jq '.'
echo ""

# PASO 4: Verificar los datos
echo -e "${BLUE}[PASO 4]${NC} Verificando resultados..."
echo ""

TOTAL_VENTAS=$(echo "$STATS_RESPONSE" | jq -r '.totalVentas // "ERROR"')
TOTAL_GASTOS=$(echo "$STATS_RESPONSE" | jq -r '.totalGastos // "ERROR"')

echo "Total Ventas: ${YELLOW}${TOTAL_VENTAS}${NC}"
echo "Total Gastos: ${YELLOW}${TOTAL_GASTOS}${NC}"
echo ""

# Comparar con lo esperado para sucursal 2
if [ "$TOTAL_VENTAS" = "4" ] || [ "$TOTAL_VENTAS" = "4.00" ]; then
    echo -e "${GREEN}✅ CORRECTO: Sucursal 2 debe tener $4.00 en ventas${NC}"
    echo -e "${GREEN}✅ Segregación funcionando correctamente${NC}"
elif [ "$TOTAL_VENTAS" = "0" ]; then
    echo -e "${YELLOW}⚠️  Sucursal 2 tiene $0 en ventas (verificar si hay datos en BD)${NC}"
else
    echo -e "${RED}❌ ERROR: Sucursal 2 está mostrando datos de otra sucursal${NC}"
    echo -e "${RED}   Valores esperados: totalVentas=4.00, totalGastos=0${NC}"
    echo -e "${RED}   Valores reales: totalVentas=${TOTAL_VENTAS}, totalGastos=${TOTAL_GASTOS}${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST COMPLETADO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📋 Próximos pasos si el test falla:"
echo -e "   1. Revisar logs del backend: ${YELLOW}tail -f /tmp/spring.log${NC}"
echo -e "   2. Buscar errores en SucursalContextFilter"
echo -e "   3. Confirmar que usuario 'dev' tiene sucursal_id=2 en BD"
echo -e "   4. Verificar que EstadisticasService recibe el SucursalContext correcto"
echo ""
