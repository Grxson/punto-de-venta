# 🚀 Cómo Probar el Fix - Paso a Paso

## PASO 1: Iniciar el Backend

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend
./mvnw spring-boot:run
```

**Espera a ver:**
```
[INFO] Started PuntoDeVentaApplication in X.XXX seconds (JVM running for X.XXX)
```

**Si todo está bien**, deberías ver:
```
[INFO] Tomcat started on port(s): 8080 (http)
```

---

## PASO 2: Iniciar el Frontend (Nueva Terminal)

```bash
cd /home/grxson/Documentos/Github/punto-de-venta/frontend-web
npm start
```

**Espera a ver:**
```
✨ Vite dev server running at:
  ➜  Local:   http://localhost:5173/
```

---

## PASO 3: Abrir en Navegador

Abre en tu navegador:
```
http://localhost:5173
```

---

## PASO 4: Crear un Producto con Variantes

### 4.1 Login
- Usuario: `admin` (o tu usuario)
- Contraseña: `password` (o la correcta)

### 4.2 Ir a Administración
- Click en **"Administración"** → **"Inventario"**

### 4.3 Crear Nuevo Producto
- Click **"Nuevo Producto"**

### 4.4 Llenar Datos
```
Nombre:           Bebida Energética
Descripción:      Bebida energética 100% natural
Categoría:        Bebidas
Precio:           50.00
Costo Estimado:   15.00
SKU:              BEV-001
En Menú:          ☑ (marcar)
```

### 4.5 Agregar Variantes
- Desciende hasta encontrar **"Plantillas de Variantes"**
- Selecciona: **"Tamaños"**
- Click **"Aplicar Plantilla"**
- Verás que se generan automáticamente:
  - Pequeño (16oz)
  - Mediano (22oz)
  - Grande (32oz)

### 4.6 Guardar
- Click **"Guardar"**
- Espera a que muestre: **"Producto guardado correctamente"**

---

## PASO 5: Ver las Variantes (EL VERDADERO TEST)

### 5.1 En la Tabla de Productos
- Busca la bebida que acabas de crear
- Encontrarás 4 registros:
  - Bebida Energética (producto base, sin variante)
  - Bebida Energética - Pequeño (16oz)
  - Bebida Energética - Mediano (22oz)
  - Bebida Energética - Grande (32oz)

### 5.2 Click "Editar" en el Producto Base
- Click en el lápiz/botón de editar del **"Bebida Energética"** (sin variante)

### 5.3 Se Abre el Modal
- Desciende hasta el final
- Encontrarás el botón **"Ver Variantes"**
- Click **"Ver Variantes"**

### 5.4 Se Abre Modal de Gestión de Variantes

**🎯 AQUÍ ESTÁ EL TEST:**

Deberías ver algo como:
```
┌─────────────────────────────────────────────┐
│ Gestión de Variantes                        │
│ Bebida Energética                           │
├─────────────────────────────────────────────┤
│ Variantes                    [+ Agregar]    │
│                                             │
│ Pequeño (16oz)                              │
│ Precio: $50.00                      ✎ ✖    │
│                                             │
│ Mediano (22oz)                              │
│ Precio: $50.00                      ✎ ✖    │
│                                             │
│ Grande (32oz)                               │
│ Precio: $50.00                      ✎ ✖    │
│                                             │
├─────────────────────────────────────────────┤
│                            [Cerrar]         │
└─────────────────────────────────────────────┘
```

✅ **SI VES LAS 3 VARIANTES** → ¡EL FIX FUNCIONÓ! 🎉

---

## PASO 6: Probar Edición (Opcional)

### 6.1 Editar Precio de Variante
- Click en el ✎ (lápiz) de una variante
- Cambia el precio, ej: **"60.00"**
- Click **"Actualizar"**
- El precio debería cambiar inmediatamente

### 6.2 Crear Nueva Variante
- Click **"[+ Agregar]"**
- Nombre: **"Extragrande (1L)"**
- Precio: **"75.00"**
- Orden: **"4"**
- Click **"Crear"**
- Deberías ver la nueva variante en la lista ✅

---

## PASO 7: Probar en POS (Confirmación Final)

### 7.1 Ir a Punto de Venta
- Click en **"Punto de Venta"** o **"Vendedor"**

### 7.2 Nueva Cotización/Venta
- Click **"Nuevo Pedido"** o **"Nueva Cotización"**

### 7.3 Agregar Producto
- Click **"+ Producto"** o similar
- Busca **"Bebida Energética"**
- Selecciona

### 7.4 Debería Mostrar
```
Bebida Energética

Tamaño:
○ Pequeño (16oz)     $50.00
○ Mediano (22oz)     $50.00
○ Grande (32oz)      $50.00
○ Extragrande (1L)   $75.00
```

- Selecciona un tamaño
- Debería agregarse al carrito con ese nombre y precio ✅

---

## ✅ Resumen de Tests

| Test | Esperado | Status |
|------|----------|--------|
| Crear producto base | Se guarda | ✅ |
| Aplicar plantilla | Genera variantes automáticamente | ✅ |
| Ver variantes en modal | Muestra 3+ variantes | 🎯 **ESTE ES EL FIX** |
| Editar variante | Precio se actualiza | ✅ |
| Crear nueva variante | Aparece en la lista | ✅ |
| Usar en POS | Muestra opciones de tamaño | ✅ |

---

## ❌ Si No Funciona

### Las variantes no aparecen en el modal

**Revisa:**
1. Logs del backend (terminal 1)
   - Busca: `ERROR` o `Exception`
   - Busca: `Producto not found`

2. Logs del frontend (terminal 2)
   - Abre consola F12 → Console
   - Busca errores en rojo

3. Network tab
   - F12 → Network
   - Click "Ver Variantes"
   - Busca el request a `/api/inventario/productos/X`
   - ¿Qué devuelve? ¿Tiene `variantes: []` o `variantes: null`?

### Las variantes aparecen pero con precio 0

Probablemente necesites actualizar el precio en cada variante (debería heredarse pero tal vez necesite ajuste).

### Error: "Producto no encontrado"

- Verifica que creaste el producto correctamente
- Que se guardó en la BD (deberían haber 4 registros)
- Intenta recargar la página

---

## 📝 Notas Importantes

1. **Las variantes son productos separados** - Tienen su propio `id` en la BD
2. **Producto base = contenedor** - No tiene precio propio, solo es referencia
3. **Cada variante tiene precio** - Se configuran individualmente
4. **El filtro de activos funciona** - Solo muestra variantes activas
5. **Se ordena por orden_variante** - Si no lo especificas, usa 999

---

## 🆘 Si todo Falla

1. Compilar nuevamente:
   ```bash
   cd backend
   ./mvnw clean compile
   ```

2. Verificar base de datos:
   ```bash
   # Si usas Railway, verifica que existan columnas:
   # - producto_base_id
   # - nombre_variante
   # - orden_variante
   ```

3. Verifica logs:
   ```bash
   # Terminal backend
   tail -100 logs/application.log | grep -i variant
   ```

4. Limpia caché del navegador:
   - Ctrl+Shift+Del (o Cmd+Shift+Del en Mac)
   - Borra todo

---

## 🎉 Éxito

Si las variantes aparecen en el modal → **¡El fix funcionó correctamente!**

Ahora el sistema de variantes está **100% funcional** en:
- ✅ Creación
- ✅ Visualización en AdminInventory
- ✅ Uso en POS
- ✅ Edición y eliminación

---

**Tiempo estimado**: 10 minutos  
**Dificultad**: Muy fácil (solo clicks)  
**Resultado**: Verificación del fix completo

¡Adelante! 🚀
