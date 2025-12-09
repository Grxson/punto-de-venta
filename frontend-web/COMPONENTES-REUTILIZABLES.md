# 🎨 Componentes y Hooks Reutilizables - Guía de Uso

## Introducción

Esta guía explica cómo usar los nuevos componentes y hooks reutilizables para reducir código duplicado en toda la aplicación.

---

## 📚 Tabla de Contenidos

1. [Hooks](#hooks)
   - [useConfirmDialog](#useconfirmdialog)
   - [useFormDialog](#useformdialog)
2. [Componentes](#componentes)
   - [ConfirmationDialog](#confirmationdialog)
   - [FormDialog](#formdialog)
3. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Hooks

### useConfirmDialog

Hook para gestionar diálogos de confirmación (eliminar, cancelar, etc.)

#### Importación
```typescript
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
```

#### Uso Básico
```typescript
const MyComponent = () => {
  const confirmDelete = useConfirmDialog();

  const handleDelete = async () => {
    confirmDelete.setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      confirmDelete.closeDialog();
      showSuccess('Producto eliminado');
    } catch (err) {
      confirmDelete.setError(err.message);
    } finally {
      confirmDelete.setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => confirmDelete.openDialog()}>
        Eliminar
      </button>

      <ConfirmationDialog
        open={confirmDelete.open}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${nombre}"?`}
        severity="error"
        confirmText="Eliminar"
        isLoading={confirmDelete.isLoading}
        onConfirm={handleDelete}
        onCancel={() => confirmDelete.closeDialog()}
      />
    </>
  );
};
```

#### API

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `open` | boolean | Si el diálogo está abierto |
| `isLoading` | boolean | Si está en proceso de carga |
| `error` | string \| null | Mensaje de error actual |
| `openDialog()` | () => void | Abre el diálogo |
| `closeDialog()` | () => void | Cierra el diálogo (no se cierra si está cargando) |
| `setLoading(bool)` | (bool) => void | Establece el estado de carga |
| `setError(msg)` | (msg) => void | Establece el mensaje de error |
| `resetError()` | () => void | Limpia el mensaje de error |

#### Casos de Uso
- ✅ Confirmar eliminación de elementos
- ✅ Confirmar cancelación de ventas
- ✅ Confirmar cambios importantes
- ✅ Confirmar desactivación de usuarios

---

### useFormDialog

Hook genérico para gestionar diálogos de formulario (crear/editar)

#### Importación
```typescript
import { useFormDialog } from '@/hooks/useFormDialog';
```

#### Uso Básico
```typescript
const MyComponent = () => {
  // Para crear
  const formDialog = useFormDialog<Producto>();

  // O para editar existente (pasando tipo inicial)
  const formDialog = useFormDialog<Producto>(undefined);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  const handleOpenCreate = () => {
    setNombre('');
    setPrecio('');
    formDialog.openDialog(); // Abre sin datos (crear)
  };

  const handleOpenEdit = (producto: Producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio.toString());
    formDialog.openDialog(producto); // Abre con datos (editar)
  };

  const handleSave = async () => {
    formDialog.setLoading(true);
    try {
      if (formDialog.isEditing) {
        // Editar
        await api.put(`/products/${formDialog.data.id}`, { nombre, precio });
      } else {
        // Crear
        await api.post('/products', { nombre, precio });
      }
      formDialog.closeDialog();
    } catch (err) {
      formDialog.setError(err.message);
    } finally {
      formDialog.setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleOpenCreate}>Crear</button>

      <FormDialog
        open={formDialog.open}
        title={formDialog.isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        isLoading={formDialog.isLoading}
        error={formDialog.error}
        onClose={() => formDialog.closeDialog()}
        onSubmit={handleSave}
      >
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Precio"
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          fullWidth
          required
          inputProps={{ step: '0.01', min: '0' }}
        />
      </FormDialog>
    </>
  );
};
```

#### API

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `open` | boolean | Si el diálogo está abierto |
| `isLoading` | boolean | Si está en proceso de carga |
| `error` | string \| null | Mensaje de error actual |
| `data` | T \| null | Datos actuales (null si es crear) |
| `isEditing` | boolean | Si es modo edición (data !== null) |
| `openDialog(item?)` | (item?) => void | Abre el diálogo (con datos si pasas item) |
| `closeDialog()` | () => void | Cierra el diálogo |
| `setLoading(bool)` | (bool) => void | Establece el estado de carga |
| `setError(msg)` | (msg) => void | Establece el mensaje de error |
| `setData(data)` | (data) => void | Actualiza los datos |
| `resetError()` | () => void | Limpia el mensaje de error |

#### Casos de Uso
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Crear nuevos usuarios
- ✅ Editar gastos
- ✅ Crear categorías

---

## Componentes

### ConfirmationDialog

Componente visual de diálogo de confirmación.

#### Importación
```typescript
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `open` | boolean | - | Si el diálogo está abierto |
| `title` | string | - | Título del diálogo |
| `message` | string \| ReactNode | - | Mensaje a mostrar |
| `confirmText` | string | 'Confirmar' | Texto del botón confirmar |
| `cancelText` | string | 'Cancelar' | Texto del botón cancelar |
| `severity` | 'warning' \| 'error' \| 'info' \| 'success' | 'warning' | Tipo de severidad |
| `isLoading` | boolean | false | Si está cargando |
| `onConfirm` | () => void | - | Callback al confirmar |
| `onCancel` | () => void | - | Callback al cancelar |
| `confirmColor` | 'error' \| 'warning' \| 'success' \| 'info' | 'error' | Color del botón |
| `maxWidth` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'sm' | Ancho máximo |
| `showAlert` | boolean | true | Mostrar alert como header |

#### Ejemplo Completo
```typescript
<ConfirmationDialog
  open={isOpen}
  title="Cancelar Venta"
  message={
    <>
      <Typography>
        ¿Estás seguro de que deseas cancelar la venta #{ventaId}?
      </Typography>
      <Typography variant="body2" sx={{ mt: 2, color: 'warning.main' }}>
        Esta acción revertirá los movimientos de inventario.
      </Typography>
    </>
  }
  severity="warning"
  confirmText="Cancelar Venta"
  confirmColor="warning"
  isLoading={isCanceling}
  onConfirm={handleCancel}
  onCancel={handleClose}
/>
```

---

### FormDialog

Componente visual de diálogo de formulario.

#### Importación
```typescript
import { FormDialog } from '@/components/common/FormDialog';
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `open` | boolean | - | Si el diálogo está abierto |
| `title` | string | - | Título del diálogo |
| `isLoading` | boolean | false | Si está cargando |
| `error` | string \| null | null | Mensaje de error |
| `onClose` | () => void | - | Callback al cerrar |
| `onSubmit` | () => void | - | Callback al enviar |
| `children` | ReactNode | - | Contenido del formulario |
| `submitText` | string | 'Guardar' | Texto del botón envío |
| `cancelText` | string | 'Cancelar' | Texto del botón cancelar |
| `submitColor` | 'primary' \| 'success' \| 'error' \| 'warning' | 'primary' | Color del botón |
| `submitDisabled` | boolean | false | Si el botón está deshabilitado |
| `maxWidth` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Ancho máximo |

#### Ejemplo Completo
```typescript
<FormDialog
  open={formDialog.open}
  title={formDialog.isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
  isLoading={formDialog.isLoading}
  error={formDialog.error}
  onClose={() => formDialog.closeDialog()}
  onSubmit={handleSave}
  submitText="Guardar"
>
  <TextField
    label="Descripción"
    value={descripcion}
    onChange={(e) => setDescripcion(e.target.value)}
    fullWidth
    required
  />
  <TextField
    label="Monto"
    type="number"
    value={monto}
    onChange={(e) => setMonto(e.target.value)}
    fullWidth
    required
    inputProps={{ step: '0.01', min: '0' }}
  />
  <FormControl fullWidth>
    <InputLabel>Categoría</InputLabel>
    <Select
      value={categoriaId}
      onChange={(e) => setCategoriaId(e.target.value)}
      label="Categoría"
    >
      {categorias.map(cat => (
        <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
      ))}
    </Select>
  </FormControl>
</FormDialog>
```

---

## Ejemplos Prácticos

### Ejemplo 1: Panel de Administración de Productos

Antes (120+ líneas de state):
```typescript
// ❌ SIN REFACTORIZACIÓN
const [openDialog, setOpenDialog] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [editingProduct, setEditingProduct] = useState<Product | null>(null);

const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState<string | null>(null);
const [productToDelete, setProductToDelete] = useState<Product | null>(null);
// ... 40+ líneas más de state declarations
```

Después (reutilizando hooks):
```typescript
// ✅ CON REFACTORIZACIÓN
const formDialog = useFormDialog<Product>();
const confirmDelete = useConfirmDialog();

// Eso es todo lo que necesitas!
```

Comparación de código:

**Antes (200 líneas totales):**
```typescript
const AdminProducts = () => {
  // 80 líneas: state declarations
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // ... etc

  // 50 líneas: handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${productToDelete.id}`);
      // ...
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 70 líneas: JSX con dialogs
  return (
    <>
      {/* ... */}
      <Dialog open={openDialog} onClose={() => !isLoading && setOpenDialog(false)}>
        {/* ... 50 líneas de contenido ... */}
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => !deleteLoading && setOpenDeleteDialog(false)}>
        {/* ... 40 líneas de contenido ... */}
      </Dialog>
    </>
  );
};
```

**Después (80 líneas totales - 60% reducción!):**
```typescript
const AdminProducts = () => {
  const formDialog = useFormDialog<Product>();
  const confirmDelete = useConfirmDialog();

  const handleSave = async () => {
    formDialog.setLoading(true);
    try {
      if (formDialog.isEditing) {
        await api.put(`/products/${formDialog.data.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      formDialog.closeDialog();
    } catch (err) {
      formDialog.setError(err.message);
    }
  };

  const handleDelete = async () => {
    confirmDelete.setLoading(true);
    try {
      await api.delete(`/products/${confirmDelete.data.id}`);
      confirmDelete.closeDialog();
    } catch (err) {
      confirmDelete.setError(err.message);
    }
  };

  return (
    <>
      <button onClick={() => formDialog.openDialog()}>Crear</button>

      <FormDialog
        open={formDialog.open}
        title={formDialog.isEditing ? 'Editar' : 'Crear'}
        isLoading={formDialog.isLoading}
        error={formDialog.error}
        onClose={() => formDialog.closeDialog()}
        onSubmit={handleSave}
      >
        {/* contenido del formulario */}
      </FormDialog>

      <ConfirmationDialog
        open={confirmDelete.open}
        title="Eliminar Producto"
        message={`¿Eliminar "${confirmDelete.data?.nombre}"?`}
        severity="error"
        isLoading={confirmDelete.isLoading}
        onConfirm={handleDelete}
        onCancel={() => confirmDelete.closeDialog()}
      />
    </>
  );
};
```

### Ejemplo 2: Lista de Ventas con Acciones

```typescript
const SalesList = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  
  // Dialogs reutilizables
  const editDialog = useFormDialog<Sale>();
  const cancelDialog = useConfirmDialog();
  const deleteDialog = useConfirmDialog();

  const handleEdit = async () => {
    editDialog.setLoading(true);
    try {
      await api.put(`/sales/${editDialog.data.id}`, editData);
      editDialog.closeDialog();
      // Recargar
    } catch (err) {
      editDialog.setError(err.message);
    }
  };

  const handleCancel = async () => {
    cancelDialog.setLoading(true);
    try {
      await api.post(`/sales/${cancelDialog.data.id}/cancel`, { reason });
      cancelDialog.closeDialog();
    } catch (err) {
      cancelDialog.setError(err.message);
    }
  };

  const handleDelete = async () => {
    deleteDialog.setLoading(true);
    try {
      await api.delete(`/sales/${deleteDialog.data.id}`);
      deleteDialog.closeDialog();
    } catch (err) {
      deleteDialog.setError(err.message);
    }
  };

  return (
    <>
      <table>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>
                <button onClick={() => editDialog.openDialog(sale)}>Editar</button>
                <button onClick={() => cancelDialog.openDialog(sale)}>Cancelar</button>
                <button onClick={() => deleteDialog.openDialog(sale)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FormDialog
        open={editDialog.open}
        title="Editar Venta"
        isLoading={editDialog.isLoading}
        error={editDialog.error}
        onClose={() => editDialog.closeDialog()}
        onSubmit={handleEdit}
      >
        {/* formulario */}
      </FormDialog>

      <ConfirmationDialog
        open={cancelDialog.open}
        title="Cancelar Venta"
        message={`¿Cancelar venta #${cancelDialog.data?.id}?`}
        severity="warning"
        isLoading={cancelDialog.isLoading}
        onConfirm={handleCancel}
        onCancel={() => cancelDialog.closeDialog()}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        title="Eliminar Venta"
        message={`¿Eliminar permanentemente venta #${deleteDialog.data?.id}?`}
        severity="error"
        isLoading={deleteDialog.isLoading}
        onConfirm={handleDelete}
        onCancel={() => deleteDialog.closeDialog()}
      />
    </>
  );
};
```

---

## 📋 Checklist de Adopción

Al refactorizar un componente:

- [ ] Reemplazo todos los `useState` para dialogs con `useConfirmDialog` o `useFormDialog`
- [ ] Reemplazo todos los `<Dialog>` componentes con `<ConfirmationDialog>` o `<FormDialog>`
- [ ] Verifico que la lógica de API sigue siendo idéntica
- [ ] Pruebo manualmente: crear, editar, eliminar, cancelar
- [ ] No hay errores de compilación
- [ ] La UX/UI es idéntica a la original
- [ ] Reduje al menos 40% de líneas de código

---

## 🎯 Próximos Pasos

Una vez estos hooks/componentes estén establecidos:
1. Refactorizar AdminSales (1734 → 500 líneas)
2. Refactorizar PosSales (1469 → 400 líneas)
3. Refactorizar AdminExpenses (1096 → 400 líneas)
4. Refactorizar PosExpenses (959 → 350 líneas)

**Total: 5,227 líneas → 1,650 líneas (68% reducción!)**

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo usar ambos hooks en el mismo componente?**
R: Sí! Cada hook maneja un aspecto diferente. Es común tener `formDialog` para crear/editar y `confirmDelete` para eliminar.

**P: ¿Cómo manejo validación de formularios?**
R: El FormDialog proporciona el `error` prop. Tú validas los datos antes de llamar `onSubmit`.

**P: ¿Puedo personalizar los estilos?**
R: Sí, los componentes aceptan `sx` prop si lo necesitas. Pero idealmente mantiene consistencia.

**P: ¿Cómo paso datos entre el formulario y el handler?**
R: Mantén el estado del formulario en el componente padre (como antes). El hook solo maneja el estado del diálogo.

---

**Última actualización:** 9 de diciembre de 2025
