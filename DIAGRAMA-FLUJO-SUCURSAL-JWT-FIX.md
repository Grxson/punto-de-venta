# 🔄 Diagrama de Flujo: Obtención de Sucursal en Reportes

## ❌ FLUJO ANTERIOR (INCORRECTO)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ USUARIO INICIA SESIÓN                                                   │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Backend genera JWT                                                      │
│ ├─ username: "juan"                                                     │
│ ├─ usuarioId: 2                                                         │
│ ├─ rol: "USER"                                                          │
│ └─ sucursalId: 2 ✅                                                     │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend guarda JWT                                                     │
│ Authorization: Bearer eyJhbGc...sucursalId: 2...                       │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Usuario abre Reportes                                                   │
│ GET /api/estadisticas/ventas/rango?desde=...&hasta=...                │
│ Header: Authorization: Bearer <JWT>                                    │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SucursalContextFilter recibe request ❌ PROBLEMA AQUÍ                   │
│                                                                         │
│ ❌ IGNORA el JWT (que tiene sucursalId: 2)                             │
│                                                                         │
│ Intenta cargar de BD:                                                  │
│   usuario = usuarioRepository.findByUsername("juan")                   │
│   sucursalId = usuario.getSucursal().getId()  ← Lazy-loading falla    │
│                                                                         │
│ Si error al lazy-load:                                                 │
│   sucursalId = 1L  ❌ HARDCODEADO A 1                                   │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SucursalContext.setSucursal(1, "Default")  ❌ INCORRECTO               │
│ (Debería ser 2)                                                        │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ EstadisticasService                                                     │
│   sucursalId = SucursalContext.getSucursalId()  ← Retorna 1 ❌         │
│   Consulta BD: Datos de Sucursal 1                                     │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend recibe datos de Sucursal 1                                    │
│ Usuario ve gráficas de Sucursal 1  ❌ INCORRECTO (debería ser 2)       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ FLUJO CORREGIDO (CORRECTO)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ USUARIO INICIA SESIÓN                                                   │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Backend genera JWT                                                      │
│ ├─ username: "juan"                                                     │
│ ├─ usuarioId: 2                                                         │
│ ├─ rol: "USER"                                                          │
│ └─ sucursalId: 2 ✅                                                     │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend guarda JWT                                                     │
│ Authorization: Bearer eyJhbGc...sucursalId: 2...                       │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Usuario abre Reportes                                                   │
│ GET /api/estadisticas/ventas/rango?desde=...&hasta=...                │
│ Header: Authorization: Bearer <JWT>                                    │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SucursalContextFilter recibe request ✅ ARREGLADO                       │
│                                                                         │
│ PASO 1: Extraer sucursal del JWT ✅                                    │
│   bearerToken = extractBearerToken(request)                            │
│   sucursalId = jwtUtil.extractSucursalId(bearerToken)                  │
│   ✅ Obtiene sucursalId: 2                                             │
│   logger: "✅ Sucursal obtenida del JWT: 2"                            │
│                                                                         │
│ PASO 2: Validar que no sea nulo                                        │
│   if (sucursalId != null) ✅                                           │
│                                                                         │
│ PASO 3: Si es admin, permitir cambio (no aplica aquí)                 │
│   rolNombre = "USER" → No cambiar                                      │
│                                                                         │
│ PASO 4: Establecer contexto ✅                                         │
│   SucursalContext.setSucursal(2, "Sucursal 2")                        │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ EstadisticasService                                                     │
│   sucursalId = SucursalContext.getSucursalId()  ← Retorna 2 ✅         │
│   Consulta BD: Datos de Sucursal 2 ✅                                  │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend recibe datos de Sucursal 2                                    │
│ Usuario ve gráficas de Sucursal 2  ✅ CORRECTO                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparación de Resultados

### Escenario: 3 Usuarios en diferentes sucursales

#### ❌ ANTES (Incorrecto):
```
┌─────────────┬───────────────────────────┬──────────────────────┐
│ Usuario     │ Sucursal del Usuario      │ Datos en Gráficas    │
├─────────────┼───────────────────────────┼──────────────────────┤
│ Juan        │ Sucursal 1                │ Sucursal 1 ✅        │
│ María       │ Sucursal 2                │ Sucursal 1 ❌        │
│ Pedro       │ Sucursal 3                │ Sucursal 1 ❌        │
└─────────────┴───────────────────────────┴──────────────────────┘

⚠️ María y Pedro ven datos incorrectos (de Sucursal 1)
```

#### ✅ DESPUÉS (Correcto):
```
┌─────────────┬───────────────────────────┬──────────────────────┐
│ Usuario     │ Sucursal del Usuario      │ Datos en Gráficas    │
├─────────────┼───────────────────────────┼──────────────────────┤
│ Juan        │ Sucursal 1                │ Sucursal 1 ✅        │
│ María       │ Sucursal 2                │ Sucursal 2 ✅        │
│ Pedro       │ Sucursal 3                │ Sucursal 3 ✅        │
└─────────────┴───────────────────────────┴──────────────────────┘

✅ Todos ven datos correctos de su propia sucursal
```

---

## 🔐 Seguridad Mejorada

### Ventaja: Imposible Ver Datos de Otra Sucursal

1. **JWT está firmado** → No se puede falsificar
2. **Backend valida JWT** antes de extraer sucursal
3. **SucursalContext** se establece del JWT confiable
4. **No hay forma de cambiar de sucursal** (excepto Admin con header)

```java
// ❌ Hacker intenta cambiar ID directamente
POST /api/estadisticas/ventas/rango
  Authorization: Bearer <JWT_SUCURSAL_2>

// SucursalContextFilter extrae del JWT:
// sucursalId = 2 (del token, no del usuario)
// ✅ Ve datos de Sucursal 2
// ✅ No puede ver Sucursal 1 o 3
```

---

## 📋 Checklist de Implementación

- [x] Identificar problema en `SucursalContextFilter`
- [x] Agregar `JwtUtil` como dependencia
- [x] Crear método `extractBearerToken()`
- [x] Implementar PASO 1: Extraer de JWT
- [x] Implementar PASO 2: Fallback a BD
- [x] Implementar PASO 3: Header para admin
- [x] Implementar PASO 4: Establecer contexto
- [x] Agregar logging detallado
- [x] Compilar exitosamente
- [ ] **Probar en runtime** ← PRÓXIMO PASO
- [ ] Verificar logs mostrando JWT extraction
- [ ] Verificar múltiples usuarios

---

## 🚀 Próximos Pasos de Testing

1. **Iniciar backend**
2. **Crear usuarios en 2-3 sucursales diferentes**
3. **Login con cada usuario**
4. **Acceder a Admin → Reportes**
5. **Verificar que ven datos de su sucursal**
6. **Revisar logs**: `✅ Sucursal obtenida del JWT:`
