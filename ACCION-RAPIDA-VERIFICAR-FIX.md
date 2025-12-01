# ⚡ ACCIÓN RÁPIDA - Verificar el Fix

**Tiempo total**: ~10 minutos

---

## PASO 1: Terminal 1 - Iniciar Backend

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend
./mvnw spring-boot:run
```

**Espera a:**
```
[INFO] Started PuntoDeVentaApplication in X.XXX seconds
[INFO] Tomcat started on port(s): 8080 (http)
```

✅ Cuando veas esto, el backend está listo

---

## PASO 2: Terminal 2 - Iniciar Frontend

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/frontend-web
npm start
```

**Espera a:**
```
✨ Vite dev server running at:
  ➜  Local:   http://localhost:5173/
```

✅ Cuando veas esto, el frontend está listo

---

## PASO 3: Navegador - Login

Abre: http://localhost:5173

Login con tu usuario

---

## PASO 4: Crear Producto

1. **Administración** → **Inventario**
2. Click **"Nuevo Producto"**
3. Llena:
   - Nombre: **"Bebida"**
   - Categoría: **"Bebidas"**
   - Precio: **"50"**
4. Desciende hasta **"Plantillas de Variantes"**
5. Selecciona: **"Tamaños"**
6. Click **"Aplicar Plantilla"**
7. Click **"Guardar"**

---

## PASO 5: EL TEST - Ver Variantes

1. Busca el producto que creaste en la tabla
2. Haz click en el lápiz (editar) del producto **sin variante**
3. En el modal que se abre, desciende hasta el final
4. Click **"Ver Variantes"**

### 🎯 RESULTADO ESPERADO:

```
┌──────────────────────────────┐
│ Variantes                    │
├──────────────────────────────┤
│ Pequeño (16oz)       $50.00  │
│ Mediano (22oz)       $50.00  │
│ Grande (32oz)        $50.00  │
└──────────────────────────────┘
```

✅ **SI VES ESTO** → ¡EL FIX FUNCIONÓ! 🎉

❌ **SI NO VES NADA** → Revisar logs (ver troubleshooting abajo)

---

## TROUBLESHOOTING RÁPIDO

### ❌ No se ven variantes
**Revisar:**
```bash
# Terminal backend, busca ERROR:
tail -50 logs/application*.log | grep ERROR

# O en la terminal del backend, busca líneas rojas
```

### ❌ Error 404 en API
**Probablemente:** No compiló correctamente
```bash
cd backend
./mvnw clean compile
# Si hay errores, revisar el output
```

### ❌ Producto no aparece en tabla
**Soluciones:**
- Recarga la página (F5)
- Cierra el modal de crear
- Intenta buscar en el campo "Buscar"

---

## DOCUMENTACIÓN ADICIONAL

Si quieres saber **qué cambió exactamente**:
- **`FIX-VARIANTES-RESUMEN.md`** - Resumen visual
- **`FIX-VARIANTES-MOSTRARSE.md`** - Análisis técnico completo

Si quieres **probar más a fondo**:
- **`TESTING-VARIANTES-PASO-A-PASO.md`** - Guía completa

---

## ✅ Checklist

- [ ] Backend compiló sin errores
- [ ] Backend está corriendo en puerto 8080
- [ ] Frontend está corriendo en puerto 5173
- [ ] Puedo hacer login
- [ ] Creé un producto
- [ ] Apliqué plantilla de variantes
- [ ] Guarde el producto
- [ ] Abri modal "Ver Variantes"
- [ ] **Veo las 3 variantes (S, M, L)**

Si todas las casillas están ✅ → **¡Excelente, el fix funciona!**

---

## 🚀 Siguiente Paso

Una vez verificado:
1. **Hacer commit**:
   ```bash
   git add .
   git commit -m "fix: cargar variantes correctamente en AdminInventory"
   ```

2. **Desplegar a Railway** (si tienes acceso)
3. **Ejecutar migración** en Railway (si aún no la ejecutaste)

---

**Tiempo estimado**: 10 minutos  
**Dificultad**: Muy fácil  
**Recompensa**: Sistema de variantes 100% funcional 🎊
