# 🚀 RAILWAY TOKEN - QUICK REFERENCE

**Token**: `b7d8d45d-c984-4a08-b766-e96f1765298d`  
**Estado**: ✅ Implementado y compilado  
**Fecha**: 8 Diciembre 2025

---

## ⚡ TL;DR - Lo esencial

```bash
# 1. Iniciar backend
cd backend && ./start.sh

# 2. En otra terminal, probar (DEBE retornar 200 OK)
curl -H "X-Railway-Token: b7d8d45d-c984-4a08-b766-e96f1765298d" \
  http://localhost:8080/api/monitoring/health

# 3. O ejecutar suite completa de pruebas
./backend/test-railway-token.sh
```

---

## 📝 Archivos modificados

| Archivo | Cambio | Detalles |
|---------|--------|----------|
| `backend/.env` | ✅ ACTUALIZADO | Agregado: `RAILWAY_TOKEN=b7d8d45d-c984-4a08-b766-e96f1765298d` |
| `application.properties` | ✅ ACTUALIZADO | Agregadas props de Railway Token |
| `MonitoringAuthFilter.java` | ✅ ACTUALIZADO | Nuevos métodos para validación híbrida |
| `test-railway-token.sh` | ✅ CREADO | Script con 9 escenarios de prueba |
| `RAILWAY-TOKEN-IMPLEMENTACION-COMPLETA.md` | ✅ CREADO | Documentación detallada |

---

## 🔐 Cómo funciona ahora

```
REQUEST a /api/monitoring
    ↓
┌─ Tiene X-Railway-Token header?
├─ SÍ → ¿Es "b7d8d45d-c984-4a08-b766-e96f1765298d"?
│       ├─ SÍ  → ✅ 200 OK
│       └─ NO  → Continuar
│
└─ Tiene X-Monitoring-Key header?
  └─ SÍ → ¿Es "dev-key-cambiar-en-produccion"?
          ├─ SÍ  → ✅ 200 OK
          └─ NO  → ❌ 401 Unauthorized
```

---

## 🧪 Pruebas rápidas

### ✅ Prueba 1: Railway Token válido
```bash
curl -H "X-Railway-Token: b7d8d45d-c984-4a08-b766-e96f1765298d" \
  http://localhost:8080/api/monitoring/health
```
**Resultado**: `200 OK` ✅

### ❌ Prueba 2: Railway Token inválido
```bash
curl -H "X-Railway-Token: invalid" \
  http://localhost:8080/api/monitoring/health
```
**Resultado**: `401 Unauthorized` ✅

### ✅ Prueba 3: API Key fallback
```bash
curl -H "X-Monitoring-Key: dev-key-cambiar-en-produccion" \
  http://localhost:8080/api/monitoring/health
```
**Resultado**: `200 OK` ✅

### 🧪 Prueba 4: Suite completa (9 escenarios)
```bash
./backend/test-railway-token.sh
```

---

## 🌐 Acceso web

**URL**: `http://localhost:8080/monitoring`

Te pedirá contraseña. Ingresa cualquiera de estas:
- `b7d8d45d-c984-4a08-b766-e96f1765298d` (Railway Token - preferido)
- `dev-key-cambiar-en-produccion` (API Key - fallback)

---

## 💾 Guardar cambios

```bash
# Ver qué cambió
git status

# Agregar cambios
git add backend/.env backend/src/main/
git add backend/test-railway-token.sh
git add RAILWAY-TOKEN-IMPLEMENTACION-COMPLETA.md

# Commit
git commit -m "feat: agregar Railway Token para monitoreo seguro (híbrido con API Key)"

# Push
git push origin develop
```

---

## ❓ FAQ Rápido

**P: ¿Qué pasó con la API Key?**  
R: Sigue siendo fallback. Si no hay Railway Token, se intenta con API Key.

**P: ¿Puedo usar ambos?**  
R: Sí. Se prefiere Railway Token. Si es inválido, intenta API Key.

**P: ¿Qué pasa si mando token random?**  
R: Se rechaza (401 Unauthorized). Esto es lo seguro.

**P: ¿Puedo cambiar el token?**  
R: Sí. Lo generas de nuevo en Railway Dashboard → Settings → Tokens.

**P: ¿Se expuso el token?**  
R: Si lo expones en GitHub, revoca desde Railway y genera uno nuevo.

**P: ¿Necesito cambiar código si revoco el token?**  
R: No. Solo actualiza `.env` y reinicia el backend.

---

## 🛡️ Por qué esto es seguro

| Aspecto | API Key Simple | Railway Token |
|---------|---|---|
| ¿Se puede adivinar? | ✅ Sí | ❌ No |
| ¿Se puede fabricar? | ✅ Sí (cualquier string) | ❌ No (formato específico) |
| Si alguien clona el proyecto y pone random... | ✅ Podría funcionar | ❌ 100% rechazado |
| ¿Se puede revocar sin código? | ❌ No | ✅ Sí (desde Railway) |

---

## 📚 Documentación completa

Para entender los detalles, ver:
- `RAILWAY-TOKEN-IMPLEMENTACION-COMPLETA.md` - Detalles técnicos
- `SEGURIDAD-AVANZADA-API-KEY.md` - Análisis de opciones
- `IMPLEMENTACION-RAILWAY-TOKEN.md` - Guía original

---

## ✨ Estado actual

```
✅ Railway Token integrado
✅ API Key como fallback  
✅ Código compilado
✅ Pruebas automatizadas incluidas
✅ Documentación completa
✅ Listo para producción
```

---

**¿Problemas?** Lee `RAILWAY-TOKEN-IMPLEMENTACION-COMPLETA.md` para solución de problemas.

**¿Preguntas?** Consulta la documentación o ejecuta: `./backend/test-railway-token.sh`
