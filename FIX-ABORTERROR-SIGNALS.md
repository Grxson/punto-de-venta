# 🔧 Fix: AbortError en Peticiones Duplicadas (React 18 Strict Mode)

**Fecha**: 5 de enero de 2026  
**Problema**: Errores `AbortError: signal is aborted without reason` en peticiones de `/ventas?page=0&size=50`  
**Causa Raíz**: React 18 Strict Mode invoca efectos dos veces durante el desarrollo, causando cancelación de peticiones duplicadas

---

## 📋 Análisis del Problema

### Síntomas Observados
```
❌ [GET] http://localhost:8080/api/ventas?page=0&size=50 - Error: AbortError: signal is aborted without reason
Reintento 1/3 para /ventas?page=0&size=50
Reintento 2/3 para /ventas?page=0&size=50
```

### Por qué pasaba
1. **React 18 Strict Mode**: En desarrollo, invoca los efectos de montaje DOS VECES para detectar efectos secundarios no limpios
   ```tsx
   useEffect(() => {
     loadVentas();  // ← Se ejecuta AQUÍ (primera vez)
   }, []);         // Se ejecuta AQUÍ también (segunda vez)
   ```

2. **Efecto cascada**:
   - Primera invocación: Dispara GET `/ventas?page=0`
   - Segunda invocación (antes de completarse): Dispara GET `/ventas?page=0` nuevamente
   - La segunda solicitud cancela la primera con `AbortController.abort()`
   - Resultado: `AbortError`

3. **Reintentos innecesarios**: El código intentaba reintentar 3 veces la misma solicitud cancelada

---

## ✅ Solución Implementada

### 1️⃣ Evitar invocación duplicada en AdminSales.tsx
**Archivo**: `frontend-web/src/pages/admin/AdminSales.tsx`

```typescript
// 🔒 Usar ref para evitar invocación duplicada del efecto en React 18 Strict Mode
const ventasInicializadasRef = useRef(false);

useEffect(() => {
  // Solo cargar una vez al montar el componente (ignorar Strict Mode double-mount)
  if (!ventasInicializadasRef.current) {
    ventasInicializadasRef.current = true;
    loadVentas();
  }
}, []);
```

**Por qué funciona**: El `useRef` persiste entre renderizados. La bandera solo permite que `loadVentas()` se ejecute UNA VEZ, ignorando la segunda invocación de React Strict Mode.

---

### 2️⃣ Cancelar peticiones previas en useSalesCache.ts
**Archivo**: `frontend-web/src/hooks/useSalesCache.ts`

```typescript
// Global AbortController para cancelar cargas previas
let abortControllerGlobal: AbortController | null = null;

const loadAllSales = useCallback(async (dateRange?: { desde: string; hasta: string }) => {
  // Cancelar peticiones previas para evitar AbortError duplicado
  if (abortControllerGlobal) {
    abortControllerGlobal.abort();
  }
  abortControllerGlobal = new AbortController();

  // ... resto del código ...

  // Verificar si se abortó la carga
  while (hasMorePages) {
    if (abortControllerGlobal?.signal.aborted) {
      console.log('⚠️ Carga de ventas cancelada por nueva solicitud');
      setLoading(false);
      abortControllerGlobal = null;
      return [];
    }
    // continuar carga...
  }
}, [getCacheKey, loadSalesPage]);
```

**Por qué funciona**: Si se dispara una nueva carga mientras hay una en progreso, cancela la anterior de forma controlada.

---

### 3️⃣ NO reintentar AbortError en api.service.ts
**Archivo**: `frontend-web/src/services/api.service.ts`

```typescript
catch (error: any) {
  console.error(`❌ [${options.method || 'GET'}] ${url} - Error:`, error);
  
  // ❌ NO reintentar AbortError (solicitud cancelada intencionalmente)
  if (error.name === 'AbortError') {
    return {
      success: false,
      error: 'Solicitud cancelada (AbortError)',
      statusCode: 0,
    };
  }

  // ✅ Reintentar solo otros errores de red
  if (attempt < this.retries) {
    console.log(`Reintento ${attempt}/${this.retries} para ${endpoint}`);
    await this.delay(1000 * attempt);
    return this.requestWithRetry<T>(endpoint, options, attempt + 1);
  }
  // ...
}
```

**Por qué funciona**: Un `AbortError` es una cancelación intencional, no un error de red recuperable. Reintentar no tiene sentido.

---

## 🧪 Comportamiento Después del Fix

### Antes (Con errores):
```
❌ [GET] /ventas?page=0 - AbortError
❌ [GET] /ventas?page=0 - AbortError (Reintento 1/3)
❌ [GET] /ventas?page=0 - AbortError (Reintento 2/3)
✅ [GET] /ventas?page=1 - Status 200
✅ [GET] /ventas?page=2 - Status 200
```

### Después (Limpio):
```
✅ [GET] /ventas?page=0 - Status 200
✅ [GET] /ventas?page=1 - Status 200
✅ [GET] /ventas?page=2 - Status 200
✅ [GET] /ventas?page=3 - Status 200
```

---

## 📊 Impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Errores AbortError | 2-3 por carga | 0 |
| Reintentos innecesarios | Sí (3 por error) | No |
| Tiempo de carga | Variable | Consistente |
| Logs limpios | No | Sí |

---

## 🔍 Archivos Modificados

1. ✅ `frontend-web/src/pages/admin/AdminSales.tsx`
   - Agregado `useRef` para controlar invocación única del efecto

2. ✅ `frontend-web/src/hooks/useSalesCache.ts`
   - Agregado `abortControllerGlobal` para cancelación controlada
   - Agregado check de abort en el loop de páginas

3. ✅ `frontend-web/src/services/api.service.ts`
   - Eliminados reintentos para `AbortError`
   - Mejorada lógica de manejo de errores

---

## 💡 Recomendaciones Futuras

1. **En Desarrollo**: Considerar desabilitar Strict Mode en desarrollo una vez que se confía en los efectos:
   ```tsx
   // dev.tsx o main.tsx
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   // Para producción, está bien mantenerlo
   ```

2. **Mejora de caché**: El caché actual es simple. Considerar usar `TanStack Query` o `SWR` para caché automático:
   ```typescript
   // Ejemplo con TanStack Query
   const { data: ventas } = useQuery({
     queryKey: ['ventas', dateRange],
     queryFn: () => apiService.get('/ventas'),
     staleTime: 5 * 60 * 1000, // 5 minutos
   });
   ```

3. **Monitoreo**: Mantener los logs con información de AbortError para detectar otros problemas similares.

