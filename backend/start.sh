#!/usr/bin/env bash
# start.sh - Script de arranque para entorno Railway / desarrollo.
# Si se ejecuta desde el directorio 'backend' empaqueta (si falta) y arranca el JAR.
# Perfiles:
#   - SPRING_PROFILES_ACTIVE explícito gana.
#   - Si RAILWAY_ENVIRONMENT_NAME=production => prod
#   - Si no, usa 'railway' en Railway y 'dev' en local interactivo.

set -euo pipefail

# Cargar variables de entorno desde .env si existe
if [[ -f .env ]]; then
  echo "Cargando variables de entorno desde .env..."
  export $(grep -v '^#' .env | xargs)
fi

APP_JAR_PATTERN="target/backend-*.jar"
PORT="${PORT:-8080}"

# Determinar perfil
if [[ -n "${SPRING_PROFILES_ACTIVE:-}" ]]; then
  PROFILE="$SPRING_PROFILES_ACTIVE"
else
  if [[ "${RAILWAY_ENVIRONMENT_NAME:-}" == "production" || "${RAILWAY_ENVIRONMENT:-}" == "production" ]]; then
    PROFILE="prod"
  elif [[ -n "${RAILWAY_PROJECT_ID:-}" ]]; then
    PROFILE="railway"
  else
    PROFILE="dev"
  fi
fi

echo "[start.sh] Usando perfil: $PROFILE"

# Build si no hay JAR
if ! compgen -G "$APP_JAR_PATTERN" > /dev/null; then
  echo "[start.sh] JAR no encontrado. Ejecutando build Maven (skipTests)..."
  ./mvnw clean package -DskipTests
else
  echo "[start.sh] JAR encontrado. No se reconstruye."
fi

# Seleccionar JAR con preferencia al reempacado (sin .original)
JAR_FILE=$(ls -1 target/backend-*.jar 2>/dev/null | grep -v ".original" | head -n 1 || true)
if [[ -z "$JAR_FILE" ]]; then
  # fallback si solo existe .original
  JAR_FILE=$(ls -1 target/backend-*.jar 2>/dev/null | head -n 1 || true)
fi

if [[ -z "$JAR_FILE" ]]; then
  echo "[start.sh] Error: No se encontró ningún JAR válido en target/" >&2
  exit 1
fi

# Sanitizar opciones JVM potencialmente problemáticas en JAVA_OPTS / JAVA_TOOL_OPTIONS
# Algunos entornos inyectan tokens inválidos como "UseContainerSupport" sin prefijo -XX: que rompen el arranque.
sanitize_opts() {
  local opts="$1"
  # Eliminar flags no válidos o redundantes (variantes de UseContainerSupport)
  opts="${opts//-XX:+UseContainerSupport/}"
  opts="${opts//-XX:UseContainerSupport/}"
  opts="${opts//UseContainerSupport/}"
  # Normalizar espacios
  echo "$opts" | sed -E 's/[[:space:]]+/ /g' | xargs
}

SAFE_JAVA_OPTS="$(sanitize_opts "${JAVA_OPTS:-"-Xmx512m"}")"

# Si JAVA_TOOL_OPTIONS existe, sanitizarlo también para evitar que la JVM falle antes de leer JAVA_OPTS
if [[ -n "${JAVA_TOOL_OPTIONS:-}" ]]; then
  export JAVA_TOOL_OPTIONS="$(sanitize_opts "$JAVA_TOOL_OPTIONS")"
  echo "[start.sh] JAVA_TOOL_OPTIONS sanitizado: $JAVA_TOOL_OPTIONS"
fi

echo "[start.sh] Lanzando: java $SAFE_JAVA_OPTS -Dserver.port=$PORT -Dspring.profiles.active=$PROFILE -jar $JAR_FILE"
exec java $SAFE_JAVA_OPTS \
     -Dserver.port="$PORT" \
     -Dspring.profiles.active="$PROFILE" \
     -jar "$JAR_FILE"