# Configuración de Desarrollo con Railway PostgreSQL

## 🚀 Pasos para conectarte a la BD de Railway desde tu entorno local

### 1. Obtener la URL de conexión de Railway

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app)
2. Selecciona el servicio **PostgreSQL**
3. Ve a la pestaña **Connect** o **Variables**
4. Copia la variable `DATABASE_URL` completa

La URL tiene este formato:
```
postgresql://usuario:password@host.railway.app:puerto/railway
```

### 2. Configurar la variable de entorno

#### Opción A: Variable de entorno del sistema (Recomendada)

**Linux/macOS:**
```bash
# Añadir a ~/.bashrc o ~/.zshrc
export DATABASE_URL="postgresql://usuario:password@host.railway.app:5432/railway"

# O ejecutar en la terminal actual
export DATABASE_URL="postgresql://usuario:password@host.railway.app:5432/railway"
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://usuario:password@host.railway.app:5432/railway"
```

**Windows (CMD):**
```cmd
set DATABASE_URL=postgresql://usuario:password@host.railway.app:5432/railway
```

#### Opción B: Crear archivo .env en la raíz del backend

Crea `backend/.env` (⚠️ NO lo subas a git, ya está en .gitignore):
```properties
DATABASE_URL=postgresql://usuario:password@host.railway.app:5432/railway
```

#### Opción C: Pasar directamente al ejecutar

```bash
DATABASE_URL="postgresql://..." ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Ejecutar la aplicación

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 4. Verificar la conexión

La aplicación debería iniciar en `http://localhost:8080` y verás logs indicando la conexión a PostgreSQL.

## ✅ Ventajas de esta configuración

- ✨ **Datos reales**: Trabajas con los mismos datos que producción
- 🔄 **Sincronización automática**: Los cambios se reflejan inmediatamente en Railway
- 🐛 **Debug realista**: Pruebas con el esquema y datos reales
- 🚫 **Sin duplicación**: No necesitas mantener schemas/seeds locales
- 👥 **Colaboración**: Todo el equipo ve los mismos datos

## ⚠️ Precauciones

1. **Cuidado con operaciones destructivas**: Estás conectado a la BD real
2. **No uses esta config en producción**: El perfil `dev` tiene logs detallados
3. **Credenciales seguras**: Nunca subas `.env` o expongas `DATABASE_URL` en git
4. **Pool de conexiones limitado**: Configurado con pool pequeño (5 conexiones) para no saturar Railway

## 🔍 Troubleshooting

### Error: "Connection refused"
- Verifica que la URL de Railway sea correcta
- Revisa que tu IP no esté bloqueada (Railway permite todas por defecto)
- Comprueba que el servicio PostgreSQL de Railway esté activo

### Error: "Authentication failed"
- La contraseña en Railway puede cambiar si regeneras el servicio
- Copia la URL actualizada desde Railway Dashboard

### Error: "Database does not exist"
- El nombre de la BD en Railway es `railway` por defecto
- Verifica en Railway Dashboard > PostgreSQL > Variables

## 📚 Más información

- [Railway Docs - PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Spring Boot - External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
