# 🔧 Fix: Logging en Railway - Noviembre 22, 2025

## Problema
Railway fallaba el healthcheck con error:
```
java.io.FileNotFoundException: ./logs/application.log (No such file or directory)
Logback configuration error detected
```

## Causa raíz
- `logback-spring.xml` configuraba file appenders (`./logs/*.log`)
- Railway ejecuta contenedores con permisos limitados
- No puede crear directorios en `/app/./logs/`
- La aplicación fallaba en startup antes de responder healthchecks

## Solución implementada

### 1. **Nuevo archivo de logging para Railway**
📁 `src/main/resources/logback-railway.xml`
- Solo logging a CONSOLA (Railway captura automáticamente)
- Sin file appenders
- Niveles optimizados para producción (INFO/WARN)

### 2. **Configuración PostgreSQL específica**
📁 `src/main/resources/data-postgresql.sql`
- Usa `INSERT ... ON CONFLICT DO NOTHING` (PostgreSQL sintaxis)
- Compatible con tablas sin constraints UNIQUE en `nombre`
- Idempotente: puede ejecutarse múltiples veces

### 3. **application-railway.properties actualizado**
```properties
# Usa logback específico de Railway
logging.config=classpath:logback-railway.xml

# Usa script SQL específico de PostgreSQL
spring.sql.init.data-locations=classpath:data-postgresql.sql
```

## ✅ Resultado esperado
- ✅ Aplicación arranca sin errores de Logback
- ✅ Logs visibles en Railway Dashboard (consola)
- ✅ Healthcheck `/actuator/health/liveness` responde OK
- ✅ Datos iniciales cargados en PostgreSQL correctamente

## 📝 Archivos modificados
- `src/main/resources/logback-railway.xml` (NUEVO)
- `src/main/resources/data-postgresql.sql` (NUEVO)
- `src/main/resources/application-railway.properties` (MODIFICADO)

## 🚀 Deployment
```bash
git add .
git commit -m "fix: logging config para Railway y data.sql PostgreSQL"
git push origin develop
```

Railway auto-desplegará con la nueva configuración.

## 🔍 Verificación post-deployment
```bash
# 1. Ver logs en Railway Dashboard
# 2. Verificar healthcheck
curl https://tu-app.up.railway.app/actuator/health/liveness

# 3. Verificar datos iniciales
curl https://tu-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---
**Fecha**: 22 de noviembre de 2025  
**Branch**: develop  
**Autor**: Grxson
