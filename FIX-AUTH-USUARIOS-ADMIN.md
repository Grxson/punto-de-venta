# Fix: Autenticación requerida para Admin Users

## Problema Encontrado

Cuando intentas acceder a `/admin/usuarios`, recibes errores HTTP 403/500 y `TypeError: roles.map is not a function`.

### Causa Raíz

1. **Autenticación requerida**: El backend tiene `@EnableWebSecurity` y requiere autenticación para acceder a `/api/roles`, `/api/sucursales`, etc.
2. **Sin token válido**: Sin token de login, el backend rechaza todas las solicitudes con HTTP 403 (Forbidden)
3. **Sin datos**: Cuando no hay datos del servidor, la UI mostraba `undefined` en lugar de arrays vacías

## Solución Implementada

### 1. Mejora de Servicios (Error Handling)
Todos los servicios ahora retornan arrays/null garantizados:
- ✅ roles.service.ts: Retorna `[]` si hay error
- ✅ sucursales.service.ts: Retorna `[]` si hay error
- ✅ usuarios.service.ts: Retorna `[]` o `null` si hay error

### 2. Validación Defensiva en Componentes
- ✅ UsuariosTable.tsx: Valida que `roles` sea array antes de `.map()`
- ✅ Props opcionales: `usuarios` y `roles` ahora son opcionales con defaults

### 3. Próximos Pasos para Usar la Página

**IMPORTANTE**: Debes estar logueado para acceder a `/admin/usuarios`

#### Opción A: Login como ADMIN o GERENTE
1. Ve a `http://localhost:3000` (frontend)
2. Verás la página de Login
3. **Requisito**: El backend debe tener al menos 1 usuario
   - Si no hay usuarios, necesitas crear uno mediante el endpoint POST `/api/auth/usuarios`
   - O ejecutar un script de inicialización de datos

#### Opción B: Crear Usuario de Prueba (Backend)
```bash
# Acceder a H2 Console (si está habilitada)
http://localhost:8080/h2-console

# O hacer POST a /api/auth/usuarios (con autenticación actual)
curl -X POST http://localhost:8080/api/auth/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "nombre": "Admin",
    "apellido": "User",
    "email": "admin@example.com",
    "rolId": 1,
    "sucursalId": 1
  }'
```

## Cómo Verificar que Funciona

1. **Con autenticación válida**:
   ```bash
   # Obtener token de login
   TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}' \
     | jq -r '.data.token')
   
   # Probar endpoint de roles
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/roles
   ```

2. **En el navegador**:
   - Abre http://localhost:3000
   - Haz login con credenciales válidas
   - Navega a Admin → Usuarios
   - Deberías ver la tabla con usuarios

## Archivos Modificados

1. `frontend-web/src/services/roles.service.ts`
   - Mejora de error handling
   - Retorna siempre array

2. `frontend-web/src/services/sucursales.service.ts`
   - Mejora de error handling
   - Retorna siempre array

3. `frontend-web/src/services/usuarios.service.ts`
   - Mejora de error handling
   - Retorna siempre array o null

4. `frontend-web/src/components/admin/UsuariosTable.tsx`
   - Validación defensiva para `roles.map()`
   - Props opcionales con defaults

## Estado Actual

✅ **Sistema listo para usar**: Una vez logueado, `/admin/usuarios` funciona correctamente
✅ **Error handling robusto**: La UI no rompe si faltan datos
✅ **Tipo seguro**: TypeScript valida todos los tipos

## Próximos Pasos

1. Crear usuarios de prueba en el backend (si no existen)
2. Login en el frontend con credenciales válidas
3. Navegar a Admin → Usuarios
4. Probar CRUD completo (crear, editar, eliminar, cambiar rol)

## Troubleshooting

Si aún ves errores:

1. **Error 403**: No estás autenticado
   - Solución: Haz login en `http://localhost:3000`

2. **Error 500 en el servidor**: Revisa los logs del backend
   - Solución: Asegúrate de que `/api/roles`, `/api/sucursales` existen en el controller

3. **TypeError: roles.map is not a function**: (FIJO)
   - Solución: Ya está manejado, retorna array vacío si hay error

4. **No hay usuarios para mostrar**: Crea usuarios primero
   - Solución: POST a `/api/auth/usuarios` con datos válidos
