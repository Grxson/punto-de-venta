# 🚀 Reiniciar Backend con Fixes Compilados

## ⚡ Acción Inmediata

### 1️⃣ Detener Backend Actual

```bash
# Si está ejecutándose en otra terminal
# Ctrl+C (interrumpir el proceso)

# O usar bash start.sh que maneja el ciclo completo
```

### 2️⃣ Reiniciar con JAR Nuevo

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend

# Opción A: Script oficial (recomendado)
bash start.sh

# Opción B: Ejecutar JAR directamente
java -jar target/backend-1.0.0-SNAPSHOT.jar
```

### 3️⃣ Verificar Logs

**Esperar a ver:**
```
✅ Spring Boot Started
✅ Aplicación disponible en http://localhost:8080
✅ Logs de [SucursalContextFilter]
```

---

## 🔍 Verificar en Logs Reales

### Buscar estos mensajes:

```bash
# En terminal del backend, buscar:
"✅ [SucursalContextFilter]"
"📍 [SucursalContextFilter]"
"❌ [SucursalContextFilter]"
```

---

## 📊 Prueba Rápida

### 1. Login como admin (sucursal 1)

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Esperar respuesta con token:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": "admin",
  "rol": "ADMIN",
  "sucursal_id": 1
}
```

### 2. Listar Productos (admin)

**Request:**
```bash
curl -X GET http://localhost:8080/api/productos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Esperar:**
- ✅ Admin ver ~177 productos (sucursal 1)
- ✅ Status 200 OK

### 3. Verificar DailyStats

**Request:**
```bash
curl -X GET http://localhost:8080/api/estadisticas/ventas/dia \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Esperar:**
- ✅ Datos de sucursal 1
- ✅ 48 gastos visibles
- ✅ Status 200 OK

---

## 🆘 Troubleshooting

### Si hay errores de compilación:
```bash
cd backend
./mvnw clean package -DskipTests
```

### Si el JAR no inicia:
```bash
# Ver error completo
java -jar target/backend-1.0.0-SNAPSHOT.jar
# (mira el stack trace)
```

### Si las sucursales NO se segregan:
- Buscar logs: `❌ [SucursalContextFilter] CRÍTICO`
- Verificar token tiene `sucursalId`
- Verificar usuario tiene sucursal en BD

---

## ✅ Checklist Post-Reinicio

- [ ] Backend inicia sin errores
- [ ] Logs muestran `[SucursalContextFilter] Sucursal obtenida del JWT`
- [ ] Admin login retorna `sucursal_id: 1`
- [ ] Dev login retorna `sucursal_id: 2`
- [ ] Admin ve 177 productos
- [ ] Dev ve 1 + 3 variantes = 4 productos
- [ ] DailyStats muestra datos correctos por sucursal
- [ ] Gastos segregados: sucursal 1 = 48, sucursal 2 = 0

---

**Una vez verificado, la segregación de sucursales estará completamente funcional. 🎉**
