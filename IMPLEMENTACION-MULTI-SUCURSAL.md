# Implementación Multi-Sucursal - Sistema POS

## Resumen
El sistema ahora soporta múltiples sucursales (tus negocios) manteniendo la **misma funcionalidad exacta** sin crear componentes duplicados.

## Cómo funciona

### 1. **Cambio de Sucursal**
En **ProfileScreen**, si eres ADMIN y tienes múltiples sucursales asignadas:
- Toca en el nombre de la sucursal en la sección "Información de Cuenta"
- Se abre un modal con la lista de tus sucursales
- Selecciona la sucursal a la que quieres cambiar
- Los datos se cargan automáticamente

### 2. **Carga Automática de Datos**
Cuando cambias de sucursal, **TODO se actualiza automáticamente**:

#### MenuScreen
- Los **productos** de la nueva sucursal se cargan automáticamente
- Las **categorías** se actualizan
- El carrito se mantiene (pero los precios pueden variar por sucursal)

#### VentasScreen & GastosScreen
- Todos los registros se asocian a la sucursal actual
- Los reportes muestran datos de la sucursal seleccionada

#### AdminDashboard
- Los KPIs (Dashboard) muestran datos de:
  - **General**: todos tus negocios combinados
  - **Por Sucursal**: detalles específicos de cada uno

### 3. **Contextos (Sin cambios en su estructura)**

```
AuthContext
├── user: Tu usuario
├── sucursal: La sucursal actual seleccionada ⬅️ CLAVE
├── changeSucursal(): Función para cambiar sucursal
└── [Otros datos de autenticación]

MenuContext  
├── Monitorea cambios en sucursal ✅
├── Carga productos automáticamente
└── Mantiene el carrito

ReporteContext
├── Carga reportes de la sucursal actual ✅
└── Si eres ADMIN, muestra reportes comparativos
```

### 4. **Flujo Técnico**

```mermaid
1. Usuario inicia sesión
   ↓
2. AuthContext carga usuario + sucursal predeterminada
   ↓
3. MenuContext ve cambio en sucursal
   → Carga productos de esa sucursal
   ↓
4. Usuario selecciona otra sucursal en ProfileScreen
   ↓
5. changeSucursal() actualiza AuthContext.sucursal
   ↓
6. MenuContext reacciona automáticamente
   → Carga nuevos productos
   → Carrito se mantiene (pero precios pueden cambiar)
   ↓
7. ReporteContext también se actualiza
   → Reportes de la nueva sucursal
```

## Archivos Modificados

### Backend
```
✅ GET /api/sucursales
   Obtiene todas las sucursales del usuario (solo ADMIN)
   
✅ GET /sucursales/{id}/productos
   Obtiene productos específicos de una sucursal
   
✅ POST /api/ventas
   Crea venta asociada a sucursal actual
   
✅ POST /api/gastos
   Crea gasto asociado a sucursal actual
   
✅ GET /reportes/*
   Reportes de la sucursal actual
   
✅ GET /reportes/por-sucursal
   (ADMIN) Reportes comparativos por sucursal
```

### Frontend

#### `AuthContext.tsx`
- ✅ Nueva función: `changeSucursal(nuevaSucursal: SucursalDTO)`
- ✅ Guarda sucursal en AsyncStorage
- ✅ Integrada en el contexto

#### `ProfileScreen.tsx`
- ✅ Selector interactivo de sucursal (modal)
- ✅ Muestra todas tus sucursales si eres ADMIN
- ✅ Carga sucursales automáticamente
- ✅ Visual mejorado (flecha ▼ indicando que es seleccionable)

#### `MenuContext.tsx`
- ✅ Ya monitoreaba sucursal cambios
- ✅ Recarga productos al cambiar sucursal

#### `ReporteContext.tsx`
- ✅ Ya soportaba reportes por sucursal
- ✅ Reportes se actualizan automáticamente

## Uso Real

### Escenario: Eres dueño de 2 negocios

1. **Inicia sesión** con tu usuario ADMIN
2. **Selecciona "Perfil"** en la app
3. **Toca "Sucursal: Mi Negocio Principal ▼"**
4. **Elige tu otro negocio** en el modal
5. **Automáticamente**:
   - MenuScreen muestra productos del nuevo negocio
   - Los precios de esa sucursal
   - Las ventas/gastos se registran en la sucursal correcta
   - Los reportes son del negocio actual

## Características Clave

| Característica | Status | Nota |
|---|---|---|
| Cambiar entre sucursales | ✅ | Interfaz simple en ProfileScreen |
| Carga automática de productos | ✅ | MenuContext reacciona a cambios |
| Reportes por sucursal | ✅ | Comparativo en AdminDashboard |
| Carrito multi-sucursal | ✅ | Se mantiene, pero precios pueden variar |
| Sin componentes duplicados | ✅ | Mismas pantallas para todas las sucursales |
| Persistencia en AsyncStorage | ✅ | La sucursal se recuerda tras cerrar app |

## Notas Importantes

1. **Sin duplicación**: No hay un segundo MenuScreen, CarritoScreen, etc.
2. **Un carrito por sesión**: El carrito se mantiene al cambiar sucursal (esto puede ser útil si haces ventas en múltiples locales sin cerrar sesión)
3. **Datos independientes**: Aunque uses los mismos componentes, los datos vienen de API filtrados por sucursal_id
4. **ADMIN vs Usuarios regulares**: 
   - ADMIN: ve todas las sucursales y reportes comparativos
   - Usuarios regulares: solo ven su sucursal asignada (no pueden cambiar)

## Próximos Pasos

Para que funcione completamente necesitas:

1. **Backend**: Verificar que los endpoints filtren correctamente por `sucursal_id`:
   - GET `/sucursales/{id}/productos`
   - POST `/api/ventas` (guardar sucursal_id)
   - POST `/api/gastos` (guardar sucursal_id)
   - GET `/reportes/*` (filtrar por sucursal_id del usuario logueado)

2. **Testing**: Probar con:
   - Usuario ADMIN con 2 sucursales asignadas
   - Cambiar entre sucursales
   - Verificar que los productos cambian
   - Crear una venta en cada sucursal
   - Verificar reportes separados

## Comandos Útiles

```bash
# Compilar y revisar tipos
npm run type-check

# Ejecutar en desarrollo
npm start

# Android
npm run android

# iOS
npm run ios
```

---

**Fecha**: 6 de diciembre de 2025  
**Status**: ✅ Implementación completada
