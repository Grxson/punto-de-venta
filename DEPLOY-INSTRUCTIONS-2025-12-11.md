# 🚀 Pasos para Desplegar a Producción (Railway)

**Fecha:** 2025-12-11  
**Status Actual:** Todos los fixes completados en rama `develop`  

---

## 📋 Estado Actual

✅ **Rama develop:** 4 commits adelante de main  
✅ **Compilación:** Build exitoso (35s)  
✅ **Migraciones:** V018 y V019 listos  
✅ **Code Fixes:** Boolean/SMALLINT + Column naming sincronizado  

---

## 🎯 Pasos para Desplegar

### PASO 1: Cambiar a rama main
```bash
cd /home/grxson/Documentos/Github/punto-de-venta
git checkout main
```

### PASO 2: Mergear develop → main
```bash
git merge develop
```

**Resultado esperado:**
```
Merge made by the 'ort' strategy.
 backend/src/main/java/.../VentaItem.java | changes...
 backend/src/main/java/.../ProductoVarianteTamano.java | changes...
 backend/src/main/resources/db/migration/V018... | changes...
 backend/src/main/resources/db/migration/V019... | changes...
 ...
```

### PASO 3: Crear tag con versión
```bash
git tag v1.0.1-hotfix-api-ventas
```

### PASO 4: Push a origin/main
```bash
git push origin main
git push origin --tags
```

**Esto dispara automáticamente:**
1. Build en Railway (detecta cambios en main)
2. Ejecución de Flyway migrations (V018, V019)
3. Despliegue automático

### PASO 5: Verificar logs en Railway
```bash
# Esperar 2-3 minutos para que se compile y despliegue
# Luego revisar logs en dashboard de Railway o con CLI:
# railway logs -f
```

---

## 🔍 Verificaciones Post-Deploy

### 1. Verificar que la aplicación está healthy
```bash
curl -X GET https://api.puntodeventa.railway.app/actuator/health
```
**Esperado:** HTTP 200 + {"status":"UP"}

### 2. Verificar que /api/ventas funciona
```bash
# Necesitas un JWT válido
curl -X GET https://api.puntodeventa.railway.app/api/ventas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```
**Esperado:** HTTP 200 + JSON con datos de ventas (o array vacío si no hay ventas)

### 3. Revisar logs por errores Hibernate
```bash
railway logs -f
```
Buscar por:
- ❌ "HibernateException: Could not convert"
- ❌ "ERROR: column ... does not exist"
- ✅ "Liquibase: Successfully released database change log lock"
- ✅ "Tomcat started on port 8080"

### 4. Probar creación de venta (POST)
```bash
curl -X POST https://api.puntodeventa.railway.app/api/ventas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sucursalId": 1,
    "clienteId": null,
    "metodoPagoId": 1,
    "items": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 50000,
        "tamanioId": 1,
        "atributos": []
      }
    ]
  }'
```
**Esperado:** HTTP 201 + nueva venta creada

---

## 🔄 Plan de Rollback (Si algo sale mal)

Si después del despliegue ves errores HTTP 500 en /api/ventas:

```bash
# 1. Revierte el commit en main
git revert HEAD

# 2. Push del revert
git push origin main

# 3. Railway detectará cambios y redesplegará la versión anterior
# Espera 2-3 minutos
```

---

## 📊 Cambios Que Se Desplegarán

**Backend Code (Java):**
- 8 entidades con `@Convert(converter = BooleanToIntegerConverter.class)`
- VentaItem con @Column/@JoinColumn correcto para tildes
- ProductoVarianteTamano con @JoinColumn corregido
- Nueva clase: BooleanToIntegerConverter

**Database (PostgreSQL):**
- V018: Convierte BOOLEAN → SMALLINT en 9 tablas
- V019: Documentación de estándar de tildes (no ejecuta cambios actualmente)

**Total:** 6 archivos modificados, 2 migraciones nuevas

---

## ✨ Resumen de Fixes

| Problema | Solución | Riesgo |
|----------|----------|--------|
| Boolean/Integer error | Converter + SMALLINT (V018) | Bajo (migraciones reversibles) |
| Column name mismatch (tamaño_id) | Sync Java to BD naming | Bajo (solo anotaciones) |
| Column name mismatch (precio_extra_tamaño) | Sync Java to BD naming | Bajo (solo anotaciones) |

---

## 📞 Soporte

Si encuentras problemas después del despliegue:

1. **Check logs primero:** `railway logs -f`
2. **Rollback si es necesario:** `git revert HEAD && git push origin main`
3. **Reopen issue en GitHub** si el rollback no soluciona

---

## 🎯 Comandos Rápidos (Copy-Paste)

```bash
# Completo desde cero:
cd /home/grxson/Documentos/Github/punto-de-venta && \
git checkout main && \
git merge develop && \
git tag v1.0.1-hotfix-api-ventas && \
git push origin main && \
git push origin --tags && \
echo "✅ Desplegado! Revisa los logs en Railway en 2-3 minutos"
```

---

**Estado:** 🟢 LISTO PARA DESPLEGAR
