# 🚀 Configuración de Railway - Guía Rápida

## ⚠️ CONFIGURACIÓN CRÍTICA

### Paso 1: Root Directory (MÁS IMPORTANTE)
```
Settings → General → Root Directory
```
**Valor**: `backend`

Sin esto, Railway NO encontrará los archivos y fallará el build.

---

## ✅ Configuración completa en Railway Dashboard

### 1. General Settings
- **Root Directory**: `backend` ⚠️ CRÍTICO

### 2. Build Settings
- **Builder**: DOCKERFILE
- **Dockerfile Path**: `Dockerfile` (relativo a backend/)

### 3. Deploy Settings
- **Custom Start Command**: (dejar vacío)
- **Health Check Path**: `/actuator/health/liveness`
- **Health Check Timeout**: 300 segundos

### 4. Variables de Entorno
Railway provee automáticamente:
- `DATABASE_URL` (desde PostgreSQL service)
- `PORT` (asignado por Railway)

Opcional - agregar si necesitas:
```env
SPRING_PROFILES_ACTIVE=railway
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_seguro
CORS_ALLOWED_ORIGINS=https://tudominio.com
```

---

## 🏗️ Cómo funciona

```
Railway Build Process:
1. Clona el repositorio
2. Se posiciona en /backend (Root Directory)
3. Lee el Dockerfile en /backend/Dockerfile
4. Ejecuta el build con contexto en /backend
5. Copia: mvnw, .mvn, pom.xml, src/
6. Compila el JAR
7. Crea imagen con JRE y ejecuta
```

---

## 🧪 Verificar que funciona

Después del deploy, verifica:

1. **Build logs**: Debe mostrar
   ```
   => COPY mvnw .
   => COPY .mvn .mvn
   => COPY pom.xml .
   => COPY src src
   ```

2. **Runtime logs**: Debe mostrar
   ```
   Started PuntoDeVentaBackendApplication
   ```

3. **Health check**: Visita
   ```
   https://tu-app.railway.app/actuator/health/liveness
   ```
   Debe responder: `{"status":"UP"}`

4. **API**: Visita
   ```
   https://tu-app.railway.app/swagger-ui.html
   ```

---

## 🔧 Troubleshooting

### Error: "backend/src not found"
✅ **Solución**: Configura Root Directory = `backend`

### Error: "Unable to access jarfile"
✅ **Solución**: Elimina Custom Start Command (debe estar vacío)

### Error: "Dockerfile does not exist"
✅ **Solución**: Dockerfile Path = `Dockerfile` (no `backend/Dockerfile`)

### Health check falla
✅ **Solución**: Verifica que DATABASE_URL esté configurada

---

## 📱 Para deployar

```bash
# 1. Asegúrate que todo está committed
git status

# 2. Push a Railway
git push origin develop

# 3. Railway detecta el cambio y hace deploy automáticamente
```

---

## 📝 Resumen de archivos

- `/railway.json` - Config principal
- `/railway.toml` - Config alternativa
- `/backend/Dockerfile` - Build de la app
- `/backend/railway.json` - Config local
- `/backend/src/main/resources/application-railway.properties` - Config de Spring Boot

**Todos apuntan a Root Directory = `backend`**

---

**Última actualización**: 22 de noviembre de 2025  
**Versión**: 1.0.0-SNAPSHOT  
**Java**: 21 LTS  
**Spring Boot**: 3.5.7
