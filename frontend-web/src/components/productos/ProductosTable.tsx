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
} from '@mui/material';
import { Edit, DeleteForever, Visibility, CheckCircle, Cancel, VisibilityOff } from '@mui/icons-material';
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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Costo Estimado</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>En Menú</TableCell>
            <TableCell>Variantes</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {producto.nombre}
                  </Typography>
                  {producto.descripcion && (
                    <Typography variant="caption" color="text.secondary">
                      {producto.descripcion}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                {producto.categoriaNombre || (
                  <Typography variant="body2" color="text.secondary">
                    Sin categoría
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  ${producto.precio?.toFixed(2) || '0.00'}
                </Typography>
              </TableCell>
              <TableCell>
                {producto.costoEstimado ? (
                  <Typography variant="body2">
                    ${producto.costoEstimado.toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {producto.sku || (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {producto.activo ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Activo"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Inactivo"
                    color="error"
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell>
                {producto.disponibleEnMenu ? (
                  <Chip label="Sí" color="primary" size="small" />
                ) : (
                  <Chip label="No" size="small" />
                )}
              </TableCell>
              <TableCell>
                {producto.variantes && producto.variantes.length > 0 ? (
                  <Chip
                    label={`${producto.variantes.length} variante${producto.variantes.length > 1 ? 's' : ''}`}
                    size="small"
                    color="info"
                  />
                ) : producto.productoBaseId ? (
                  <Chip label="Variante" size="small" variant="outlined" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                  {onView && (
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => onView(producto)}
                        color="info"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(producto)}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {producto.activo ? (
                    <Tooltip title="Desactivar producto (no aparecerá en el menú)">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(producto)}
                        color="warning"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'warning.light',
                          },
                        }}
                      >
                        <VisibilityOff fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activar producto">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(producto)}
                        color="success"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'success.light',
                          },
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isAdmin && onDeletePermanente && (
                    <Tooltip title="Eliminar definitivamente (acción irreversible)">
                      <IconButton
                        size="small"
                        onClick={() => onDeletePermanente(producto)}
                        color="error"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.light',
                          },
                        }}
                      >
                        <DeleteForever fontSize="small" />
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

