import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { Refresh, CheckCircle, HighlightOff } from '@mui/icons-material';
import { useCategorias } from '../../hooks/useCategorias';
import type { CategoriaProducto } from '../../types/categorias.types';

export default function AdminCategorias() {
  // Hook de React Query para categorías
  const { data: queryData, isLoading, error, refetch } = useCategorias();
  
  const categorias: CategoriaProducto[] = queryData?.data ?? [];
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProducto | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        ⚙️ Administrar Menú (Categorías)
      </Typography>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar categorías: {error.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">📂 Categorías del Menú</Typography>
            <IconButton size="small" onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Box>

          <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {categorias.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                No hay categorías disponibles
              </Typography>
            ) : (
              categorias.map((categoria) => (
                <ListItem key={categoria.id} disablePadding>
                  <ListItemButton
                    selected={selectedCategoria?.id === categoria.id}
                    onClick={() => setSelectedCategoria(categoria)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor:
                        selectedCategoria?.id === categoria.id ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      {categoria.activa ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <HighlightOff color="disabled" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={categoria.nombre}
                      secondary={`${categoria.descripcion || 'Sin descripción'}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>

          {selectedCategoria && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Información de la Categoría Seleccionada:
              </Typography>
              <Typography variant="caption">
                <strong>ID:</strong> {selectedCategoria.id}
                <br />
                <strong>Nombre:</strong> {selectedCategoria.nombre}
                <br />
                <strong>Descripción:</strong> {selectedCategoria.descripcion || 'N/A'}
                <br />
                <strong>Estado:</strong> {selectedCategoria.activa ? '✅ Activa' : '❌ Inactiva'}
              </Typography>
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 3 }}>
            💡 <strong>Nota:</strong> Este es un panel de visualización. Para gestionar subcategorías,
            utiliza la app móvil (menú Admin) o el backend directamente a través de la API.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
