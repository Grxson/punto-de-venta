# Guía Rápida - Sistema de Usuarios y Roles

**Acceso rápido**: `/admin/usuarios`

---

## 🎯 Cómo Usar

### 1. **Crear Usuario**
```
1. Click en botón "Nuevo Usuario"
2. Completar formulario:
   - Nombre, Apellido
   - Email (formato válido)
   - Username (mínimo 3 caracteres)
   - Contraseña (mínimo 6 caracteres)
   - Seleccionar Rol
   - Seleccionar Sucursal
3. Click en "Crear"
```

### 2. **Buscar Usuario**
```
- Escribir en campo de búsqueda por:
  - Nombre
  - Apellido
  - Email
  - Username
```

### 3. **Filtrar Usuarios**
```
- Por Rol: Selector desplegable
- Por Estado: Activos o Inactivos
- Combinable con búsqueda
```

### 4. **Editar Usuario**
```
1. Click en icono de editar (lápiz)
2. Modificar campos deseados
3. Contraseña: dejar vacío para no cambiar
4. Click en "Actualizar"
```

### 5. **Cambiar Rol**
```
1. En la tabla, click en el selector de Rol
2. Seleccionar nuevo rol
3. Se guarda automáticamente
```

### 6. **Desactivar Usuario**
```
1. Click en icono de eliminar (basura roja)
2. Confirmar desactivación
3. Usuario se marca como inactivo pero se puede reactivar
```

---

## 🏗️ Cómo Extender

### Agregar Nuevo Campo a Usuario
```typescript
// 1. En usuario.types.ts
export interface Usuario {
  // ... campos existentes
  nuevocampo: string;  // Agregar aquí
}

// 2. En UsuarioForm.tsx
<Controller
  name="nuevocamp"
  control={control}
  rules={{ required: 'Campo requerido' }}
  render={({ field }) => (
    <TextField {...field} label="Nuevo Campo" />
  )}
/>

// 3. En UsuariosTable.tsx (si necesita ser visible en tabla)
<TableCell>{usuario.nuevocamp}</TableCell>
```

### Agregar Nuevo Filtro
```typescript
// En UsuariosTable.tsx
const [filterNuevo, setFilterNuevo] = useState('');

// En useMemo del filtrado
const matchNuevo = filterNuevo === '' || usuario.nuevocamp === filterNuevo;

// En JSX
<FormControl size="small">
  <Select value={filterNuevo} onChange={(e) => setFilterNuevo(e.target.value)}>
    {/* opciones */}
  </Select>
</FormControl>
```

### Agregar Nueva Acción
```typescript
// En AdminUsers.tsx
const handleNuevaAccion = async (usuarioId: number) => {
  // lógica
};

// Pasar a tabla
<UsuariosTable
  onNuevaAccion={handleNuevaAccion}
  // ...
/>

// En UsuariosTable.tsx
interface UsuariosTableProps {
  // ...
  onNuevaAccion: (usuarioId: number) => void;
}

// Agregar botón en acciones
<IconButton onClick={() => onNuevaAccion(usuario.id)}>
  <IconoNuevo />
</IconButton>
```

---

## 🐛 Troubleshooting

### Problema: "No hay usuarios para mostrar"
**Solución**: 
- Verificar que la sucursal tiene usuarios asignados
- Revisar filtros aplicados (pueden estar ocultando usuarios)
- En Network tab, verificar que `/api/auth/usuarios` devuelve datos

### Problema: "Rol no se guarda"
**Solución**:
- Verificar que el rol es válido
- Revisar console (F12) para errores
- Verificar API endpoint `/api/auth/usuarios/{id}/rol`

### Problema: "Formulario no se envía"
**Solución**:
- Verificar validación roja en campos
- Email debe tener formato válido (ej: user@example.com)
- Contraseña mínimo 6 caracteres si se completa
- Rol y Sucursal deben estar seleccionados

### Problema: "Error de red"
**Solución**:
- Verificar que el backend está corriendo (puerto 8080)
- En Network tab, revisar respuesta del API
- Verificar headers Authorization

---

## 🔗 URLs Relevantes

- **Usuarios**: `/admin/usuarios`
- **API Usuarios**: `GET/POST /api/auth/usuarios`
- **API Rol**: `PUT /api/auth/usuarios/{id}/rol`
- **Swagger**: `http://localhost:8080/swagger-ui.html`

---

## 📚 Archivos Importantes

```
src/
├── pages/admin/AdminUsers.tsx          ← Página principal
├── components/admin/
│   ├── UsuarioForm.tsx                 ← Formulario
│   └── UsuariosTable.tsx              ← Tabla
├── hooks/
│   ├── useUsuarios.ts                  ← Lógica React Query
│   ├── useRoles.ts
│   └── useSucursales.ts
├── services/
│   ├── usuarios.service.ts             ← API calls
│   ├── roles.service.ts
│   └── sucursales.service.ts
├── types/
│   ├── usuario.types.ts                ← Interfaces
│   ├── rol.types.ts
│   └── sucursal.types.ts
```

---

## 💡 Tips

1. **Búsqueda Rápida**: Puedes escribir parcialmente el nombre, el sistema busca automáticamente
2. **Paginación**: Selecciona 25 filas para ver más usuarios sin paginar
3. **Estados**: Los usuarios inactivos se pueden reactivar desde `reactivar` endpoint
4. **Validación**: El formulario marca errores en rojo automáticamente
5. **Caching**: Los cambios se reflejan automáticamente en la tabla

---

**Última Actualización**: 5 de diciembre, 2024
