#!/usr/bin/env bash
# start.sh - Script de arranque para entorno Railway / desarrollo.
# Si se ejecuta desde el directorio 'backend' empaqueta (si falta) y arranca el JAR.
# Perfiles:
#   - SPRING_PROFILES_ACTIVE explícito gana.
#   - Si RAILWAY_ENVIRONMENT_NAME=production => prod
#   - Si no, usa 'railway' en Railway y 'dev' en local interactivo.

set -euo pipefail

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

echo "[start.sh] Lanzando: java -Dserver.port=$PORT -Dspring.profiles.active=$PROFILE -jar $JAR_FILE"
exec java ${JAVA_OPTS:-"-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"} \
  -Dserver.port="$PORT" \
  -Dspring.profiles.active="$PROFILE" \
  -jar "$JAR_FILE"
