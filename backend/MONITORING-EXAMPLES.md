# 🚀 Ejemplos Prácticos del Sistema de Monitoreo

## Escenario 1: Debugging Local

### Situación
Estás desarrollando una nueva feature y quieres ver en tiempo real qué pasa cuando haces cambios.

### Solución

**Terminal 1: Backend**
```bash
cd backend
./start.sh
```

**Terminal 2: Monitor en vivo**
```bash
watch -n 2 'curl -s http://localhost:8080/api/monitoring/health | jq ".memory"'

# Output cada 2 segundos:
# {
#   "max_mb": "2048.00",
#   "used_mb": "512.25",
#   "free_mb": "1535.75",
#   "usage_percent": 25
# }
```

**Terminal 3: Panel web**
```bash
# Abre en navegador
http://localhost:8080/monitoring

# Activa auto-actualización en tab "Logs"
# Ahora verás los logs en tiempo real mientras trabajas
```

### Result
```
✅ Ver qué logs genera cada cambio
✅ Detectar memoria leaks
✅ Identificar bottlenecks
```

---

## Escenario 2: Debugging en Railway (Producción)

### Situación
Tu app en Railway de repente está lenta y no sabes por qué. Los usuarios se quejan.

### Solución Rápida (5 minutos)

**Paso 1: Acceder al panel**
```
https://mi-app.railway.app/monitoring
```

**Paso 2: Ver estado actual**
- Tab 🏥 Salud
  - Memoria: 1024MB / 2048MB ⚠️ (50% usage, normal)
  - Threads: 250 (muchos!)
  - Uptime: 48h

**Paso 3: Filtrar errores recientes**
- Tab 📝 Logs
- Seleccionar "ERROR" en dropdown
- Cambiar líneas a 200
- Clic en 🔄 Actualizar

```
Error encontrado:
2025-12-08 14:30:45 ERROR [QueryThread-1] 
  com.puntodeventa.backend.repository.ProductoRepository
  Database connection timeout: max pool size reached
```

**Paso 4: Descargar para análisis**
- Clic en ⬇️ Descargar
- Guardar `logs-2025-12-08-14-30-45.txt`

### Diagnóstico
```bash
# Contar errores por tipo
grep ERROR logs-*.txt | cut -d: -f3 | sort | uniq -c | sort -rn

# Output:
#  45 Database connection timeout
#  12 OutOfMemoryError
#   8 ConnectionRefusedException
```

### Acción
```
✅ Aumentar pool de conexiones
✅ Reiniciar app en Railway
✅ Monitorear de nuevo
```

---

## Escenario 3: Integración en Tests

### Situación
Quieres que tus tests automatizados verifiquen que el servidor está sano antes de correr tests.

### Solución

**Archivo: `test-health-check.sh`**
```bash
#!/bin/bash

# Esperar a que el servidor esté listo (máx 30 segundos)
echo "Esperando que el servidor esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/monitoring/ping >/dev/null; then
        echo "✓ Servidor respondiendo"
        break
    fi
    echo -n "."
    sleep 1
done

# Verificar memoria disponible
echo "Verificando memoria..."
HEALTH=$(curl -s http://localhost:8080/api/monitoring/health)
MEMORY_PERCENT=$(echo $HEALTH | jq '.memory.usage_percent')

if [ "$MEMORY_PERCENT" -gt 80 ]; then
    echo "✗ Memoria insuficiente: ${MEMORY_PERCENT}%"
    exit 1
fi
echo "✓ Memoria OK: ${MEMORY_PERCENT}%"

# Verificar que no hay errores recientes
echo "Buscando errores recientes..."
ERRORS=$(curl -s "http://localhost:8080/api/monitoring/logs?lines=100&level=ERROR")
ERROR_COUNT=$(echo $ERRORS | jq '.logs | length')

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "⚠ $ERROR_COUNT errores encontrados"
    echo "$ERRORS" | jq '.logs[-5:]' # Mostrar últimos 5
fi

echo "✓ Health check completo"
```

**En GitHub Actions:**
```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      backend:
        image: punto-de-venta-backend:latest
        ports:
          - 8080:8080

    steps:
      - uses: actions/checkout@v3
      
      - name: Health Check
        run: ./backend/test-health-check.sh
      
      - name: Run Tests
        run: cd backend && ./mvnw test
      
      - name: Check Logs for Errors
        if: always()
        run: |
          curl -s "http://localhost:8080/api/monitoring/logs?level=ERROR" | jq '.logs' > error-logs.json
          if [ -s error-logs.json ]; then
            echo "❌ Errores en logs:"
            jq '.' error-logs.json
          fi
```

### Result
```
✅ Tests solo corren si el servidor está OK
✅ Logs guardados en artifacts
✅ Fácil debug si algo falla
```

---

## Escenario 4: Monitoreo Persistente con Cron

### Situación
Quieres monitorear tu app en Railway 24/7 y guardar métricas.

### Solución

**Archivo: `continuous-monitor.sh`**
```bash
#!/bin/bash

APP_URL="https://mi-app.railway.app"
LOG_DIR="./monitoring-logs"

mkdir -p "$LOG_DIR"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    DATE=$(date '+%Y-%m-%d')
    HOUR=$(date '+%H')
    
    # Crear archivo de logs por hora
    LOG_FILE="$LOG_DIR/metrics-$DATE-$HOUR.log"
    
    # Obtener métricas
    HEALTH=$(curl -s "$APP_URL/api/monitoring/health")
    METRICS=$(curl -s "$APP_URL/api/monitoring/metrics")
    
    # Extraer valores
    MEMORY=$(echo $HEALTH | jq -r '.memory.usage_percent')
    THREADS=$(echo $HEALTH | jq -r '.threads.count')
    CPU=$(echo $METRICS | jq -r '.cpu.process_cpu_time_seconds')
    UPTIME=$(echo $HEALTH | jq -r '.system.uptime_minutes')
    
    # Guardar
    echo "$TIMESTAMP | Memory: $MEMORY% | Threads: $THREADS | CPU: $CPU s | Uptime: $UPTIME m" >> "$LOG_FILE"
    
    # Alertas
    if [ "$MEMORY" -gt 85 ]; then
        echo "⚠ ALERTA: Memoria alta ($MEMORY%) en $TIMESTAMP" | mail -s "Alerta Punto de Venta" admin@example.com
    fi
    
    if [ "$THREADS" -gt 300 ]; then
        echo "⚠ ALERTA: Threads alto ($THREADS) en $TIMESTAMP" | mail -s "Alerta Punto de Venta" admin@example.com
    fi
    
    # Esperar 5 minutos
    sleep 300
done
```

**En crontab:**
```bash
# Ejecutar script cada minuto (supervisa)
* * * * * /home/user/punto-de-venta/continuous-monitor.sh >> /var/log/monitoring.log 2>&1

# Limpiar logs antiguos cada día
0 2 * * * find /home/user/monitoring-logs -name "*.log" -mtime +30 -delete
```

**Análisis posterior:**
```bash
# Ver promedio de memoria en última hora
tail -60 monitoring-logs/metrics-2025-12-08-14.log | \
  grep -oP 'Memory: \K[0-9]+' | \
  awk '{sum+=$1; count++} END {print "Promedio: " sum/count "%"}'

# Ver picos de memoria
grep "Memory: 9" monitoring-logs/metrics-*.log | tail -10

# Generar reporte semanal
for file in monitoring-logs/metrics-2025-12-*.log; do
    echo "=== $file ==="
    tail -1 "$file"
done
```

### Result
```
✅ Datos históricos de rendimiento
✅ Alertas automáticas
✅ Análisis de tendencias
```

---

## Escenario 5: Integración con Slack

### Situación
Quieres que Slack notifique cuando hay errores críticos en producción.

### Solución

**Archivo: `slack-monitor.sh`**
```bash
#!/bin/bash

# Configurar tu Slack Webhook URL en: https://api.slack.com/messaging/webhooks
# Guárdalo en una variable de entorno: export SLACK_WEBHOOK_URL="tu-url-aqui"
WEBHOOK_URL="$SLACK_WEBHOOK_URL"  # NO hardcodear URLs reales aquí
APP_URL="https://mi-app.railway.app"

# Obtener errores recientes
ERRORS=$(curl -s "$APP_URL/api/monitoring/logs?lines=100&level=ERROR")
ERROR_COUNT=$(echo $ERRORS | jq '.logs | length')

if [ "$ERROR_COUNT" -gt 5 ]; then
    # Obtener últimos 3 errores
    ERROR_SNIPPET=$(echo $ERRORS | jq -r '.logs[-3:] | join("\n")')
    
    # Enviar a Slack
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"🚨 Errores en Punto de Venta\",
            \"attachments\": [
                {
                    \"color\": \"danger\",
                    \"fields\": [
                        {
                            \"title\": \"Cantidad\",
                            \"value\": \"$ERROR_COUNT errores\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Estado\",
                            \"value\": \"Crítico\",
                            \"short\": true
                        },
                        {
                            \"title\": \"Últimos Errores\",
                            \"value\": \"\`\`\`$ERROR_SNIPPET\`\`\`\",
                            \"short\": false
                        },
                        {
                            \"title\": \"Ver Detalles\",
                            \"value\": \"$APP_URL/monitoring\",
                            \"short\": false
                        }
                    ]
                }
            ]
        }" \
        $WEBHOOK_URL
fi
```

**En crontab:**
```bash
# Ejecutar cada 5 minutos
*/5 * * * * /home/user/punto-de-venta/slack-monitor.sh
```

### Result
```
✅ Notificaciones en tiempo real
✅ Team se entera de problemas al instante
✅ Links directos al monitoring panel
```

---

## Escenario 6: Análisis de Performance

### Situación
Necesitas entender cómo está el performance de tu app a lo largo del día.

### Solución

**Recolectar datos:**
```bash
# Ejecutar durante 1 hora, capturando datos cada 30 segundos
for i in {1..120}; do
    curl -s http://localhost:8080/api/monitoring/metrics | jq '.timestamp, .memory, .threads, .cpu' >> performance.jsonl
    sleep 30
done
```

**Analizar:**
```bash
# Memoria máxima
jq -s 'map(.memory.heap_used_mb | tonumber) | max' performance.jsonl

# Threads máximo
jq -s 'map(.threads.live_count) | max' performance.jsonl

# Promedio de CPU
jq -s 'map(.cpu.process_cpu_time_seconds | tonumber) | add / length' performance.jsonl
```

**Generar reporte:**
```bash
#!/bin/bash
{
    echo "# Performance Report - $(date)"
    echo ""
    echo "## Memory Stats"
    echo "Max Heap: $(jq -s 'map(.memory.heap_used_mb | tonumber) | max' performance.jsonl) MB"
    echo "Avg Heap: $(jq -s 'map(.memory.heap_used_mb | tonumber) | add / length' performance.jsonl) MB"
    echo ""
    echo "## Thread Stats"
    echo "Max Threads: $(jq -s 'map(.threads.live_count) | max' performance.jsonl)"
    echo "Avg Threads: $(jq -s 'map(.threads.live_count) | add / length' performance.jsonl)"
} > performance-report.md

cat performance-report.md
```

### Result
```
✅ Datos cuantitativos de rendimiento
✅ Identificar picos y valles
✅ Reportes ejecutivos
```

---

## Escenario 7: Post-Mortem de Incidente

### Situación
Hubo un problema en producción hace 2 horas. Necesitas investigar qué pasó.

### Procedimiento

**1. Descargar logs históricos**
```bash
# Si aún tienes el panel abierto
# Clic en ⬇️ Descargar → logs-TIMESTAMP.txt

# O vía CLI
./monitor.sh https://mi-app.railway.app logs 1000 > incident-logs.txt
./monitor.sh https://mi-app.railway.app errors 1000 > incident-errors.txt
```

**2. Analizar timeline**
```bash
# Extrae logs del momento del incidente
grep "2025-12-08 14:3[0-9]" incident-logs.txt

# Primeros errores
head -20 incident-errors.txt

# Últimos logs normales antes del error
grep -B10 "first ERROR" incident-logs.txt
```

**3. Buscar patrones**
```bash
# Qué componente falló
grep ERROR incident-errors.txt | cut -d: -f2 | sort | uniq -c | sort -rn

# Mensajes de error únicos
grep ERROR incident-errors.txt | sed 's/.*ERROR //' | sort | uniq

# Stack traces
grep -A5 "Exception" incident-errors.txt
```

**4. Correlacionar con métricas**
```bash
# ¿Memoria estaba bajo?
grep "14:30" incident-logs.txt | grep -i memory

# ¿Threads en aumento?
grep "14:30" incident-logs.txt | grep -i thread

# ¿Conexiones agotadas?
grep "connection" incident-errors.txt
```

**5. Crear timeline**
```
14:25 - Sistema normal, 200MB memory, 50 threads
14:28 - ERROR: Connection timeout (primero)
14:29 - Memory sube a 500MB
14:30 - 200 threads activos (anormal)
14:31 - OutOfMemoryError
14:32 - Crash y reinicio
14:33 - Sistema recuperado
```

**6. Documentar**
```markdown
# Post-Mortem: Incident 2025-12-08

## Timeline
- 14:28: Connection pool exhausted
- 14:31: OOM Error
- 14:32: Auto-restart triggered

## Root Cause
Database connection leak en endpoint `/api/productos`
Connected pero no closed después de error

## Fix
- Cerrar connections en finally block
- Añadir timeout configurables
- Mejorar pool monitoring

## Prevention
- Auto-restart en OOM (ya existe)
- Alert cuando threads > 150
- Alert cuando memory > 75%
```

### Result
```
✅ Identificar causa raíz
✅ Documentar para el futuro
✅ Implementar prevención
```

---

## Resumen de Casos de Uso

| Escenario | Herramienta | Propósito |
|-----------|------------|----------|
| Desarrollo local | Panel web + CLI | Ver logs en vivo |
| Debug en producción | Panel web | Acceso rápido a logs |
| Testing automatizado | API REST + bash | Health checks |
| Monitoreo continuo | Cron + script | Datos históricos |
| Alertas | Slack integration | Notificaciones |
| Performance analysis | jq + Python | Reportes |
| Post-mortem | Logs descargados | Análisis detallado |

---

**Última actualización**: 8 de diciembre de 2025  
**Versión**: 1.0.0
