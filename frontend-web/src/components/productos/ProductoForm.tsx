import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { ExpandMore, Delete, Add } from '@mui/icons-material';
import type { Producto } from '../../types/productos.types';
import type { CategoriaProducto } from '../../types/categorias.types';
import type { CategoriaSubcategoria } from '../../types/subcategorias.types';
import { productosService } from '../../services/productos.service';
import { categoriasService } from '../../services/categorias.service';
import { subcategoriasService } from '../../services/subcategorias.service';

interface ProductoFormProps {
  open: boolean;
  onClose: () => void;
  producto?: Producto | null;
  onSuccess: () => void;
}

export default function ProductoForm({ open, onClose, producto, onSuccess }: ProductoFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);

  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [subcategoria, setSubcategoria] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [sku, setSku] = useState('');
  const [skuGenerado, setSkuGenerado] = useState(false);
  const [subcategoriasDisponibles, setSubcategoriasDisponibles] = useState<CategoriaSubcategoria[]>([]);

  // Variantes
  const [variantes, setVariantes] = useState<Array<{ id?: number; nombre: string; precio: string; orden: number }>>([]);
  const [variantesEliminadas, setVariantesEliminadas] = useState<number[]>([]);
  const [plantillaVariantes, setPlantillaVariantes] = useState<string>('');
  const [accordionExpanded, setAccordionExpanded] = useState(false);

  // Cargar categorías al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadCategorias();
      if (producto) {
        // Modo edición
        const nombreLimpio = obtenerNombreLimpio(producto.nombre);
        const subcatExtraida = extraerSubcategoriaDelNombre(producto.nombre);
        
        setNombre(nombreLimpio);
        setDescripcion(producto.descripcion || '');
        setCategoriaId(producto.categoriaId || '');
        setSubcategoria(subcatExtraida);
        setPrecio(producto.precio?.toString() || '');
        setSku(producto.sku || '');
        setSkuGenerado(false); // En edición, no generar automáticamente

        // Cargar variantes existentes en modo edición
        if (producto.variantes && producto.variantes.length > 0) {
          const variantesExistentes = producto.variantes.map((v, index) => ({
            id: v.id,
            nombre: v.nombreVariante || '',
            precio: v.precio?.toString() || '',
            orden: v.ordenVariante || index + 1
          }));
          setVariantes(variantesExistentes);
          setAccordionExpanded(true); // Expandir si hay variantes
        } else {
          setVariantes([]);
          setAccordionExpanded(false);
        }
      } else {
        // Modo creación
        resetForm();
      }
    }
  }, [open, producto]);

  const loadCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const response = await categoriasService.listar({ activa: true });
      if (response.success && response.data) {
        setCategorias(response.data);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Cargar subcategorías cuando se selecciona una categoría
  const loadSubcategorias = async (categoriaId: number) => {
    try {
      const response = await subcategoriasService.obtenerPorCategoria(categoriaId);
      if (response.success && response.data) {
        setSubcategoriasDisponibles(response.data);
      } else {
        setSubcategoriasDisponibles([]);
      }
    } catch (err) {
      console.error('Error cargando subcategorías:', err);
      setSubcategoriasDisponibles([]);
    }
  };

  // Efecto para cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaId && typeof categoriaId === 'number') {
      loadSubcategorias(categoriaId);
      setSubcategoria(''); // Limpiar subcategoría seleccionada
    } else {
      setSubcategoriasDisponibles([]);
      setSubcategoria('');
    }
  }, [categoriaId]);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setCategoriaId('');
    setSubcategoria('');
    setPrecio('');
    setSku('');
    setSkuGenerado(false);
    setVariantes([]);
    setVariantesEliminadas([]);
    setPlantillaVariantes('');
    setAccordionExpanded(false);
    setError(null);
  };

  // Función para obtener el nombre limpio del producto (sin prefijo de subcategoría)
  const obtenerNombreLimpio = (nombreProducto: string): string => {
    return nombreProducto.replace(/^\[[^\]]+\]\s*/, '').trim();
  };

  // Función para extraer subcategoría del prefijo del nombre
  const extraerSubcategoriaDelNombre = (nombreProducto: string): string => {
    const prefixMatch = nombreProducto.match(/^\[([^\]]+)\]/);
    if (prefixMatch) {
      const subcatDelPrefijo = prefixMatch[1];
      // Retornar tal como está, sin obligar a minúsculas
      return subcatDelPrefijo;
    }
    return '';
  };

  // Plantillas de variantes comunes
  const plantillasVariantes = {
    '': 'Sin variantes',
    'tamanos': [
      { nombre: 'Chico', precio: '', orden: 1 },
      { nombre: 'Mediano', precio: '', orden: 2 },
      { nombre: 'Grande', precio: '', orden: 3 },
    ],
    'tamanos-bebidas': [
      { nombre: '250ml', precio: '', orden: 1 },
      { nombre: '500ml', precio: '', orden: 2 },
      { nombre: '1 Litro', precio: '', orden: 3 },
    ],
    'tamanos-cafe': [
      { nombre: 'Chico', precio: '', orden: 1 },
      { nombre: 'Mediano', precio: '', orden: 2 },
      { nombre: 'Grande', precio: '', orden: 3 },
      { nombre: 'Extra Grande', precio: '', orden: 4 },
    ],
  };

  const handlePlantillaChange = (plantilla: string) => {
    setPlantillaVariantes(plantilla);
    if (plantilla && plantillasVariantes[plantilla as keyof typeof plantillasVariantes]) {
      const variantesPlantilla = plantillasVariantes[plantilla as keyof typeof plantillasVariantes] as Array<{ nombre: string; precio: string; orden: number }>;
      setVariantes([...variantesPlantilla]);
    } else {
      setVariantes([]);
    }
  };

  const handleAgregarVariante = () => {
    setVariantes([
      ...variantes,
      { nombre: '', precio: '', orden: variantes.length + 1 },
    ]);
  };

  const handleEliminarVariante = (index: number) => {
    const varianteAEliminar = variantes[index];
    // Si tiene ID, es una variante existente que debe eliminarse del backend
    if (varianteAEliminar.id) {
      setVariantesEliminadas([...variantesEliminadas, varianteAEliminar.id]);
    }

    const nuevasVariantes = variantes.filter((_, i) => i !== index);
    // Reordenar
    nuevasVariantes.forEach((v, i) => {
      v.orden = i + 1;
    });
    setVariantes(nuevasVariantes);
  };

  const handleVarianteChange = (index: number, field: 'nombre' | 'precio', value: string) => {
    const nuevasVariantes = [...variantes];
    nuevasVariantes[index][field] = value;
    setVariantes(nuevasVariantes);
  };

  // Generar SKU automáticamente cuando cambia el nombre (solo en creación)
  const generarSkuDesdeNombre = (nombreProducto: string) => {
    if (!nombreProducto.trim() || producto) return; // Solo generar en modo creación

    const palabras = nombreProducto.trim().toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Eliminar caracteres especiales
      .split(/\s+/)
      .filter(p => p.length > 0);

    if (palabras.length === 0) return;

    let iniciales = '';
    const maxPalabras = Math.min(palabras.length, 4);
    for (let i = 0; i < maxPalabras; i++) {
      const palabra = palabras[i];
      const letrasATomar = Math.min(palabra.length, 4);
      iniciales += palabra.substring(0, letrasATomar);
    }

    if (iniciales.length === 0) {
      iniciales = 'PROD';
    }

    // Limitar a 8 caracteres
    const prefijo = iniciales.length > 8 ? iniciales.substring(0, 8) : iniciales;

    // Generar SKU con formato PREFIJO-001
    // El número será generado por el backend para asegurar unicidad
    setSku(prefijo + '-001');
    setSkuGenerado(true);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoNombre = e.target.value;
    setNombre(nuevoNombre);

    // Generar SKU automáticamente solo si no se ha editado manualmente
    if (!producto && (!sku || skuGenerado)) {
      generarSkuDesdeNombre(nuevoNombre);
    }
    
    // Auto-detectar subcategoría si la categoría es "Desayunos"
    const categoriaSeleccionada = categorias.find(cat => cat.id === categoriaId);
    if (categoriaSeleccionada?.nombre === 'Desayunos') {
      const nombreLower = nuevoNombre.toLowerCase();
      
      // Intentar auto-detectar basado en palabras clave
      let subcategoriaDetectada = '';
      if (nombreLower.includes('mollete') || nombreLower.includes('waffle') || nombreLower.includes('hot cake')) {
        subcategoriaDetectada = 'DULCES';
      } else if (nombreLower.includes('lonche') && !nombreLower.includes('sandwich')) {
        subcategoriaDetectada = 'LONCHES';
      } else if (nombreLower.includes('sandwich')) {
        subcategoriaDetectada = 'SANDWICHES';
      }
      
      // Solo establecer si coincide con una subcategoría disponible en la BD
      if (subcategoriaDetectada && subcategoriasDisponibles.some(sc => sc.nombre === subcategoriaDetectada)) {
        setSubcategoria(subcategoriaDetectada);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!precio || parseFloat(precio) < 0) {
      setError('El precio debe ser mayor o igual a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar el nombre: incluir subcategoría como prefijo si está seleccionada
      let nombreFinal = nombre.trim();
      if (subcategoria) {
        // Codificar subcategoría en el nombre con un prefijo especial: [subcategoria]
        nombreFinal = `[${subcategoria.toUpperCase()}] ${nombreFinal}`;
      }

      const productoData = {
        nombre: nombreFinal,
        descripcion: descripcion.trim() || null,
        categoriaId: categoriaId ? Number(categoriaId) : null,
        precio: parseFloat(precio),
        // Si no hay SKU o está vacío, el backend lo generará automáticamente
        sku: sku.trim() || null,
      };

      if (producto?.id) {
        // Actualizar producto base
        await productosService.actualizar(producto.id, productoData);

        // Eliminar variantes marcadas para eliminación
        for (const varianteId of variantesEliminadas) {
          try {
            await productosService.eliminar(varianteId);
          } catch (err) {
            console.error(`Error al eliminar variante ${varianteId}:`, err);
          }
        }

        // Actualizar variantes existentes modificadas
        const variantesExistentes = variantes.filter(v => v.id);
        for (const variante of variantesExistentes) {
          if (variante.nombre.trim()) {
            const precioVariante = variante.precio
              ? parseFloat(variante.precio)
              : parseFloat(precio) || 0;

            // Enviar los campos actualizables incluyendo el nombre completo
            const nombreVarianteFinal = `${nombreFinal} - ${variante.nombre.trim()}`;
            await productosService.actualizar(variante.id, {
              nombre: nombreVarianteFinal,
              nombreVariante: variante.nombre.trim(),
              precio: precioVariante,
              ordenVariante: variante.orden,
            } as Partial<Omit<Producto, 'id'>>);
          }
        }

        // Crear nuevas variantes (las que no tienen ID)
        const variantesNuevas = variantes.filter(v => !v.id && v.nombre.trim());
        if (variantesNuevas.length > 0) {
          const precioBase = parseFloat(precio) || 0;

          for (const variante of variantesNuevas) {
            const precioVariante = variante.precio
              ? parseFloat(variante.precio)
              : precioBase;

            await productosService.crearVariante(producto.id, {
              nombre: `${nombre.trim()} - ${variante.nombre.trim()}`,
              nombreVariante: variante.nombre.trim(),
              precio: precioVariante,
              ordenVariante: variante.orden,
              categoriaId: categoriaId ? Number(categoriaId) : null,
              productoBaseId: producto.id,
              descripcion: descripcion.trim() || null,
            } as Omit<Producto, 'id' | 'variantes'>);
          }
        }
      } else {
        // Crear producto
        const productoCreado = await productosService.crear(productoData as Omit<Producto, 'id' | 'variantes'>);

        // Crear variantes si hay alguna
        if (variantes.length > 0 && productoCreado.success && productoCreado.data?.id) {
          const productoId = productoCreado.data.id;
          const precioBase = parseFloat(precio) || 0;

          for (const variante of variantes) {
            if (variante.nombre.trim()) {
              const precioVariante = variante.precio
                ? parseFloat(variante.precio)
                : precioBase; // Si no tiene precio, usar el precio base

              await productosService.crearVariante(productoId, {
                nombre: `${nombreFinal} - ${variante.nombre.trim()}`,
                nombreVariante: variante.nombre.trim(),
                precio: precioVariante,
                ordenVariante: variante.orden,
                categoriaId: categoriaId ? Number(categoriaId) : null,
                productoBaseId: productoId,
                descripcion: descripcion.trim() || null,
              } as Omit<Producto, 'id' | 'variantes'>);
            }
          }
        }
      }

      handleClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {producto ? 'Editar Producto' : 'Nuevo Producto'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
            💡 Tip: Subcategorías automáticas para Desayunos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las subcategorías se asignan automáticamente según el nombre del producto:
            <br />• <strong>Dulces:</strong> Contiene "mollete", "waffle" o "hot cake"
            <br />• <strong>Lonches:</strong> Contiene "lonche"
            <br />• <strong>Sandwiches:</strong> Contiene "sandwich"
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nombre *"
            value={nombre}
            onChange={handleNombreChange}
            fullWidth
            required
            disabled={loading}
          />

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />

          <FormControl fullWidth disabled={loading || loadingCategorias}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={categoriaId}
              label="Categoría"
              onChange={(e) => {
                setCategoriaId(e.target.value as number | '');
              }}
            >
              <MenuItem value="">Sin categoría</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {subcategoriasDisponibles.length > 0 && (
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Subcategoría (opcional)</InputLabel>
              <Select
                value={subcategoria}
                label="Subcategoría (opcional)"
                onChange={(e) => setSubcategoria(e.target.value)}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {subcategoriasDisponibles.map((subcat) => (
                  <MenuItem key={subcat.id} value={subcat.nombre || ''}>
                    {subcat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Precio *"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            fullWidth
            required
            inputProps={{ min: 0, step: 0.01 }}
            disabled={loading}
          />

          <TextField
            label="SKU"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setSkuGenerado(false); // Marcar como editado manualmente
            }}
            fullWidth
            disabled={loading}
            helperText={
              skuGenerado
                ? "SKU generado automáticamente. Puedes editarlo si lo deseas."
                : producto
                  ? "Código único del producto"
                  : "Se generará automáticamente basándose en el nombre"
            }
          />

          {/* Sección de Tamaños/Variantes */}
          <Accordion
            expanded={accordionExpanded}
            onChange={(e, isExpanded) => setAccordionExpanded(isExpanded)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                Tamaños/Variantes {variantes.length > 0 && `(${variantes.length})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {producto
                    ? 'Gestiona las variantes de tamaño o presentación de este producto. Puedes agregar, editar o eliminar variantes.'
                    : 'Agrega variantes de tamaño o presentación para este producto (opcional). Ejemplo: Chico, Mediano, Grande o 250ml, 500ml, 1L'
                  }
                </Typography>

                <FormControl fullWidth size="small">
                  <InputLabel>Plantilla de variantes</InputLabel>
                  <Select
                    value={plantillaVariantes}
                    label="Plantilla de variantes"
                    onChange={(e) => handlePlantillaChange(e.target.value)}
                  >
                    <MenuItem value="">Sin variantes</MenuItem>
                    <MenuItem value="tamanos">Tamaños (Chico, Mediano, Grande)</MenuItem>
                    <MenuItem value="tamanos-bebidas">Bebidas (250ml, 500ml, 1L)</MenuItem>
                    <MenuItem value="tamanos-cafe">Café (Chico, Mediano, Grande, Extra Grande)</MenuItem>
                  </Select>
                </FormControl>

                {variantes.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                      {producto ? 'Variantes actuales:' : 'Variantes configuradas:'}
                    </Typography>
                    <List dense>
                      {variantes.map((variante, index) => (
                        <ListItem
                          key={variante.id || index}
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                  size="small"
                                  placeholder="Nombre variante"
                                  value={variante.nombre}
                                  onChange={(e) => handleVarianteChange(index, 'nombre', e.target.value)}
                                  sx={{ flex: 1 }}
                                  disabled={loading}
                                />
                                <TextField
                                  size="small"
                                  type="number"
                                  placeholder="Precio"
                                  value={variante.precio}
                                  onChange={(e) => handleVarianteChange(index, 'precio', e.target.value)}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 120 }}
                                  disabled={loading}
                                />
                              </Box>
                            }
                            secondary={`Orden: ${variante.orden}${variante.id ? ' (existente)' : ' (nueva)'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleEliminarVariante(index)}
                              disabled={loading}
                              size="small"
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAgregarVariante}
                  disabled={loading}
                  size="small"
                >
                  Agregar Nueva Variante
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingCategorias}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {producto ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

