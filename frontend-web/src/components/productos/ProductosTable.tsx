import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Button,
} from '@mui/material';
import { Edit, DeleteForever, Visibility, CheckCircle, Cancel, VisibilityOff, Settings } from '@mui/icons-material';
import type { Producto } from '../../types/productos.types';
import { useAuth } from '../../contexts/AuthContext';

interface ProductosTableProps {
  productos: Producto[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
  onDeletePermanente?: (producto: Producto) => void;
  onView?: (producto: Producto) => void;
}

export default function ProductosTable({
  productos,
  loading = false,
  onEdit,
  onDelete,
  onDeletePermanente,
  onView,
}: ProductosTableProps) {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'ADMIN' || usuario?.rolNombre === 'ADMIN';

  // Función para obtener el nombre limpio del producto (sin prefijo de subcategoría)
  const obtenerNombreLimpio = (nombreProducto: string): string => {
    return nombreProducto.replace(/^\[[^\]]+\]\s*/, '').trim();
  };

  if (loading && productos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando productos...</Typography>
      </Box>
    );
  }

  if (productos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="text.secondary">No hay productos disponibles</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ '& .MuiTableCell-root': { py: 2 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tamaños</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id} hover sx={{ '& > *': { borderBottom: '1px solid', borderColor: 'divider' } }}>
              <TableCell>
                <Box>
                  <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                    {obtenerNombreLimpio(producto.nombre)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    {producto.categoriaNombre && (
                      <Chip label={producto.categoriaNombre} size="small" variant="outlined" />
                    )}
                    {!producto.disponibleEnMenu && (
                      <Chip label="No en menú" size="small" color="warning" />
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                {producto.sku ? (
                  <Chip
                    label={producto.sku}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">-</Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${producto.precio?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
              <TableCell>
                {producto.activo ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Activo"
                    color="success"
                    sx={{ minWidth: 80, fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Inactivo"
                    color="error"
                    sx={{ minWidth: 80, fontWeight: 'bold' }}
                  />
                )}
              </TableCell>
              <TableCell>
                {producto.variantes && producto.variantes.length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={producto.variantes.length}
                      size="medium"
                      color="info"
                      sx={{ fontWeight: 'bold', minWidth: 40 }}
                    />
                    {onView && (
                      <Tooltip title="Gestionar tamaños/variantes">
                        <IconButton
                          size="medium"
                          color="success"
                          onClick={() => onView(producto)}
                          sx={{
                            bgcolor: 'success.light',
                            '&:hover': { bgcolor: 'success.main', color: 'white' },
                            p: 1.5
                          }}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ) : producto.productoBaseId ? (
                  <Chip label="Es variante" size="small" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="large"
                      onClick={() => onEdit(producto)}
                      sx={{
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' },
                        p: 1.5
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  {producto.activo ? (
                    <Tooltip title="Desactivar">
                      <IconButton
                        size="large"
                        onClick={() => onDelete(producto)}
                        sx={{
                          bgcolor: 'warning.light',
                          '&:hover': { bgcolor: 'warning.main', color: 'white' },
                          p: 1.5
                        }}
                      >
                        <VisibilityOff />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activar">
                      <IconButton
                        size="large"
                        onClick={() => onDelete(producto)}
                        sx={{
                          bgcolor: 'success.light',
                          '&:hover': { bgcolor: 'success.main', color: 'white' },
                          p: 1.5
                        }}
                      >
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAdmin && onDeletePermanente && (
                    <Tooltip title="Eliminar definitivamente">
                      <IconButton
                        size="large"
                        onClick={() => onDeletePermanente(producto)}
                        sx={{
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white' },
                          p: 1.5
                        }}
                      >
                        <DeleteForever />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

