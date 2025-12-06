# 📚 INSTRUCCIONES ACTUALIZADAS PARA COPILOT

## ⚠️ IMPORTANTE - LEE ESTO PRIMERO

**A partir de ahora, SIEMPRE usa este comando para ejecutar el backend:**

```bash
cd backend && ./start.sh
```

**NUNCA uses:**
- ❌ `./mvnw spring-boot:run`
- ❌ `java -jar ...` (manual)
- ❌ Comandos explícitos de perfiles

---

## ✅ Lo que hace `./start.sh`

El script `./start.sh` es el ejecutor oficial del backend. Automáticamente:

1. **Carga variables de entorno** desde `.env`
2. **Detecta el perfil** (dev/railway/prod) según el ambiente
3. **Compila si es necesario** (si falta el JAR)
4. **Sanitiza opciones JVM** para evitar errores
5. **Inicia el servidor** en el puerto configurado

---

## 🔧 Si hay Errores de Ejecución

**Paso 1: Revisar `./start.sh`**
```bash
# Ver el contenido del script
cat backend/start.sh

# Buscar líneas de configuración clave:
# - PROFILE (detección de perfil)
# - JAR_FILE (búsqueda del JAR)
# - java ... (línea de ejecución)
```

**Paso 2: Revisar perfiles en `src/main/resources/`**
```bash
# Configuración por perfil:
cat backend/src/main/resources/application-dev.properties
cat backend/src/main/resources/application-railway.properties
cat backend/src/main/resources/application-prod.properties
```

**Paso 3: Revisar variables de entorno**
```bash
# Variables de entorno
cat .env
```

**Paso 4: Ver logs en tiempo real**
```bash
tail -f /tmp/backend.log
```

---

## 📝 Cambios Realizados en Documentación

**Archivo actualizado:** `.github/copilot-instructions.md`

### Antes:
```markdown
### Backend (Java + Spring Boot)
- Ejecutar el proyecto: `cd backend && ./mvnw spring-boot:run`
- La API estará disponible en `http://localhost:8080`
```

### Ahora:
```markdown
### Backend (Java + Spring Boot)
- **EJECUTAR EL PROYECTO**: `cd backend && ./start.sh` (script oficial que gestiona perfiles, build y variables de entorno)
- La API estará disponible en `http://localhost:8080`

**⚠️ IMPORTANTE - Errores de ejecución:**
- Si hay errores al ejecutar el backend, **SIEMPRE revisar y arreglar en `start.sh`** o en los archivos de configuración que referencia
- El script `start.sh` detecta automáticamente el perfil (dev/railway/prod) según el entorno
- Si falta el JAR, lo compila automáticamente
- Si hay errores de conexión a BD, revisar variables de entorno en `.env`
```

---

## 💾 Commits Realizados

```
0f8515e - docs: agregar resumen de uso de ./start.sh como instrucción oficial
1c2e634 - docs: agregar resumen completo de fixes de usuarios y sucursal
085a9c2 - fix: agregar SucursalRepository a UsuarioServicio y validación mejorada
```

---

## ✅ Checklist para Desarrolladores

Cuando escriba código para este proyecto:

- [ ] ¿Necesito ejecutar el backend? → Usar `cd backend && ./start.sh`
- [ ] ¿Hay error de ejecución? → Revisar `start.sh` y perfiles en `application-*.properties`
- [ ] ¿Conecta a BD? → Verificar variables en `.env`
- [ ] ¿Falta el JAR? → Ejecutar `./start.sh` (compila automáticamente)
- [ ] ¿Problema de perfil? → El script detecta automático, pero puede fijar `SPRING_PROFILES_ACTIVE`
- [ ] ¿Cambios en código Java? → Compilar con `./mvnw clean package` en backend, luego ejecutar con `./start.sh`

---

## 🚀 Ejemplo de Ejecución Correcta

```bash
# 1. Ir al directorio backend
cd /home/grxson/Documentos/Github/punto-de-venta/backend

# 2. Ejecutar el script (hace TODO automáticamente)
./start.sh

# Output esperado:
# [start.sh] Usando perfil: dev
# [start.sh] JAR encontrado. No se reconstruye.
# [start.sh] Lanzando: java ... -Dspring.profiles.active=dev -jar target/backend-1.0.0-SNAPSHOT.jar
# 
# :: Punto de Venta Backend ::        (v1.0.0-SNAPSHOT)
# :: Spring Boot 3.5.7 ::        Java 21.0.9
# :: Profile: dev ::        Port: 8080
# 
# 🚀 Starting application...
# ✅ Aplicación iniciada correctamente

# 3. Verificar que está corriendo (en otra terminal)
curl http://localhost:8080/api/auth/login
# Debería devolver 405 o 400 (no 500)
```

---

## 📌 Resumen de Reglas

| Regla | Aplicación |
|-------|-----------|
| **Siempre usar `./start.sh`** | Para ejecutar backend en cualquier ambiente |
| **Si hay error de ejecución** | Revisar `start.sh` → perfiles → `.env` → logs |
| **No ejecutar Java manualmente** | El script maneja perfiles, compilación y opciones JVM |
| **Variables de entorno** | Se cargan automáticamente desde `.env` |
| **Perfiles automáticos** | dev = local, railway = Railway, prod = producción |

---

**Última actualización:** 5 de Diciembre 2025  
**Status:** ✅ EFECTIVO INMEDIATAMENTE  
**Mantener en:** `.github/copilot-instructions.md`
