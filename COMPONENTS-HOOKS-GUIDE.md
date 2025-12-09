# 🏗️ Guía de Uso - Componentes y Hooks Reutilizables

## Diálogos Comunes

### 1. ConfirmDialog (Confirmación Genérica)

Para cualquier acción que requiera confirmación del usuario.

**Ubicación:** `src/components/common/dialogs/ConfirmDialog.tsx`

**Uso:**
```tsx
import { ConfirmDialog } from '@/components/common/dialogs';

export function MiComponente() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    // Acción a realizar
    await apiService.delete('/venta/123');
    setShowConfirm(false);
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        Cancelar Venta
      </Button>

      <ConfirmDialog
        open={showConfirm}
        title="Cancelar Venta"
        message="¿Deseas cancelar esta venta? Se revertirán los movimientos de inventario."
        variant="warning"
        confirmText="Sí, cancelar"
        cancelText="No, atrás"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

**Props:**
- `open: boolean` - Si el diálogo está abierto
- `title: string` - Título del diálogo
- `message: string` - Mensaje de confirmación
- `variant: 'info' | 'warning' | 'error' | 'success'` - Tipo de alerta
- `confirmText?: string` - Texto botón confirmar (default: "Confirmar")
- `cancelText?: string` - Texto botón cancelar (default: "Cancelar")
- `loading?: boolean` - Si está cargando (desactiva botones)
- `onConfirm: () => void` - Callback al confirmar
- `onCancel: () => void` - Callback al cancelar

---

### 2. DeleteDialog (Eliminación con Confirmación de Texto)

Para eliminaciones permanentes, requiere que el usuario escriba un texto de confirmación.

**Ubicación:** `src/components/common/dialogs/DeleteDialog.tsx`

**Uso:**
```tsx
import { DeleteDialog } from '@/components/common/dialogs';
import { useState } from 'react';

export function AdminProductos() {
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await apiService.delete('/productos/123');
      setShowDelete(false);
      showSnackbar('Producto eliminado', 'success');
    } catch (error) {
      showSnackbar('Error al eliminar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button color="error" onClick={() => setShowDelete(true)}>
        Eliminar Producto
      </Button>

      <DeleteDialog
        open={showDelete}
        title="Eliminar Producto"
        itemName="Molletes"
        description="Esta acción no se puede deshacer y eliminará el producto del sistema."
        requireConfirmationText="ELIMINAR"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
```

**Props:**
- `open: boolean` - Si el diálogo está abierto
- `title: string` - Título del diálogo
- `itemName: string` - Nombre del item a eliminar
- `description?: string` - Descripción adicional
- `requireConfirmationText?: string` - Texto que debe escribir (ej: "ELIMINAR")
- `loading?: boolean` - Si está cargando
- `onConfirm: () => void` - Callback al confirmar
- `onCancel: () => void` - Callback al cancelar

---

## Hooks Comunes

### 1. usePagination

Maneja estado de paginación.

**Ubicación:** `src/hooks/common/usePagination.ts`

**Uso:**
```tsx
import { usePagination } from '@/hooks/common';

export function VentasTable() {
  const { page, pageSize, handleChangePage, handleChangePageSize } = usePagination(0, 10);

  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      <Table>
        <TableBody>
          {paginatedData.map(item => (...))}
        </TableBody>
      </Table>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangePageSize}
      />
    </>
  );
}
```

**Retorna:**
- `page: number` - Página actual
- `pageSize: number` - Items por página
- `handleChangePage(event, newPage)` - Cambiar página
- `handleChangePageSize(event)` - Cambiar tamaño de página

---

### 2. useLoadingState

Maneja múltiples estados de carga sin repetición de código.

**Ubicación:** `src/hooks/common/useLoadingState.ts`

**Uso:**
```tsx
import { useLoadingState } from '@/hooks/common';

export function AdminSales() {
  const { isLoading, startLoading, stopLoading, anyLoading } = useLoadingState();

  const handleGuardarVenta = async () => {
    try {
      startLoading('guardarVenta');
      await apiService.post('/ventas', data);
      showSnackbar('Venta guardada', 'success');
    } catch (error) {
      showSnackbar('Error al guardar', 'error');
    } finally {
      stopLoading('guardarVenta');
    }
  };

  const handleCancelarVenta = async () => {
    try {
      startLoading('cancelarVenta');
      await apiService.post('/ventas/123/cancelar');
      showSnackbar('Venta cancelada', 'success');
    } catch (error) {
      showSnackbar('Error al cancelar', 'error');
    } finally {
      stopLoading('cancelarVenta');
    }
  };

  return (
    <Box>
      <Button
        onClick={handleGuardarVenta}
        disabled={anyLoading}
        loading={isLoading('guardarVenta')}
      >
        Guardar
      </Button>

      <Button
        onClick={handleCancelarVenta}
        disabled={anyLoading}
        loading={isLoading('cancelarVenta')}
      >
        Cancelar
      </Button>
    </Box>
  );
}
```

**Retorna:**
- `isLoading(key)` - Verificar si está cargando algo específico
- `startLoading(key)` - Iniciar carga
- `stopLoading(key)` - Detener carga
- `anyLoading` - Si cualquier cosa está cargando
- `setLoading(key, value)` - Establecer estado manualmente

---

### 3. useSnackbar

Maneja notificaciones sin código repetitivo.

**Ubicación:** `src/hooks/common/useSnackbar.ts`

**Uso:**
```tsx
import { useSnackbar } from '@/hooks/common';
import { Snackbar, Alert } from '@mui/material';

export function MiComponente() {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();

  const handleGuardar = async () => {
    try {
      await apiService.post('/data', {...});
      showSnackbar('Guardado exitosamente', 'success');
    } catch (error) {
      showSnackbar('Error al guardar: ' + error.message, 'error');
    }
  };

  return (
    <>
      <Button onClick={handleGuardar}>Guardar</Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.type}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
```

**Retorna:**
- `snackbar.open` - Si está abierto
- `snackbar.message` - Mensaje
- `snackbar.type` - Tipo (success/error/info/warning)
- `showSnackbar(message, type)` - Mostrar notificación
- `hideSnackbar()` - Cerrar notificación

---

### 4. useDialogState

Maneja múltiples diálogos sin código repetitivo.

**Ubicación:** `src/hooks/common/useDialogState.ts`

**Uso:**
```tsx
import { useDialogState } from '@/hooks/common';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

export function AdminSales() {
  const { dialogs, openDialog, closeDialog } = useDialogState(['edit', 'delete', 'cancel']);

  return (
    <>
      <Button onClick={() => openDialog('edit')}>Editar</Button>
      <Button onClick={() => openDialog('delete')}>Eliminar</Button>
      <Button onClick={() => openDialog('cancel')}>Cancelar</Button>

      <Dialog open={dialogs.edit} onClose={() => closeDialog('edit')}>
        <DialogTitle>Editar Venta</DialogTitle>
        <DialogContent>...</DialogContent>
      </Dialog>

      <Dialog open={dialogs.delete} onClose={() => closeDialog('delete')}>
        <DialogTitle>Eliminar Venta</DialogTitle>
        <DialogContent>...</DialogContent>
      </Dialog>

      <Dialog open={dialogs.cancel} onClose={() => closeDialog('cancel')}>
        <DialogTitle>Cancelar Venta</DialogTitle>
        <DialogContent>...</DialogContent>
      </Dialog>
    </>
  );
}
```

**Retorna:**
- `dialogs` - Objeto con estado de cada diálogo
- `openDialog(name)` - Abrir diálogo
- `closeDialog(name)` - Cerrar diálogo
- `toggleDialog(name)` - Alternar diálogo

---

## Patrones Comunes

### Patrón 1: Guardar con Notificación
```tsx
const { showSnackbar } = useSnackbar();
const { isLoading, startLoading, stopLoading } = useLoadingState();

const handleGuardar = async () => {
  try {
    startLoading('guardar');
    const response = await apiService.post('/endpoint', data);
    showSnackbar('Guardado exitosamente', 'success');
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    stopLoading('guardar');
  }
};
```

### Patrón 2: Eliminar con Confirmación
```tsx
const { showSnackbar } = useSnackbar();
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const { isLoading, startLoading, stopLoading } = useLoadingState();

const handleDelete = async () => {
  try {
    startLoading('delete');
    await apiService.delete(`/endpoint/${id}`);
    showSnackbar('Eliminado exitosamente', 'success');
    setShowDeleteDialog(false);
    onDataChanged();
  } catch (error) {
    showSnackbar(error.message, 'error');
  } finally {
    stopLoading('delete');
  }
};

return (
  <>
    <Button onClick={() => setShowDeleteDialog(true)}>Eliminar</Button>
    <DeleteDialog
      open={showDeleteDialog}
      title="Eliminar"
      itemName={itemName}
      loading={isLoading('delete')}
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteDialog(false)}
    />
  </>
);
```

---

## Checklist de Refactorización

Cuando refactorices un archivo grande:

- [ ] Reemplazar `useState` para diálogos con `useDialogState`
- [ ] Reemplazar `useState` para loading con `useLoadingState`
- [ ] Reemplazar `useState` para snackbar con `useSnackbar`
- [ ] Extraer diálogos a componentes separados
- [ ] Extraer tablas a componentes separados
- [ ] Usar `ConfirmDialog` y `DeleteDialog` en lugar de código custom
- [ ] Documentar props nuevos/cambiados
- [ ] Testing de funcionalidades
- [ ] Verificar que no se perdió funcionalidad
