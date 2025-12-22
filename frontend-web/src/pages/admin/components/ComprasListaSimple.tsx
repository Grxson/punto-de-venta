import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { format } from 'date-fns';
import { ingredientesService, Unidad } from '../../../services/ingredientes.service';

interface CompraSimple {
  id: number;
  nombre: string;
  fecha: string;
  cantidad: number;
  unidadId: number;
  unidadNombre?: string;
  unidadAbreviatura?: string;
  precioTotal: number;
}

interface ComprasListaSimpleProps {
  refreshTrigger?: number;
}

/**
 * Lista las compras simples registradas
 * Permite: ver, editar, eliminar, crear ingrediente desde compra
 */
export default function ComprasListaSimple({ refreshTrigger = 0 }: ComprasListaSimpleProps) {
  const [compras, setCompras] = useState<CompraSimple[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [compraAEliminar, setCompraAEliminar] = useState<number | null>(null);

  useEffect(() => {
    cargarCompras();
    cargarUnidades();
  }, [refreshTrigger]);

  const cargarCompras = async () => {
    setLoading(true);
    setError(null);
    try {
      const comprasGuardadas = JSON.parse(localStorage.getItem('comprasSimples') || '[]');
      setCompras(comprasGuardadas);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  const cargarUnidades = async () => {
    try {
      const data = await ingredientesService.obtenerUnidades();
      setUnidades(data);
    } catch (err) {
      console.error('Error al cargar unidades:', err);
    }
  };

  const handleEliminarCompra = (id: number) => {
    setCompraAEliminar(id);
    setDialogoEliminar(true);
  };

  const confirmarEliminar = () => {
    if (compraAEliminar === null) return;

    try {
      const comprasActualizadas = compras.filter((c) => c.id !== compraAEliminar);
      localStorage.setItem('comprasSimples', JSON.stringify(comprasActualizadas));
      setCompras(comprasActualizadas);
      setDialogoEliminar(false);
      setCompraAEliminar(null);
    } catch (err) {
      setError('Error al eliminar la compra');
    }
  };

  const obtenerNombreUnidad = (unidadId: number) => {
    const unidad = unidades.find((u) => u.id === unidadId);
    return unidad ? unidad.abreviatura : 'un';
  };

  const totalCompras = compras.reduce((sum, c) => sum + c.precioTotal, 0);

  if (loading) {
    return <Box sx={{ p: 2 }}>Cargando...</Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {compras.length === 0 ? (
        <Alert severity="info">No hay compras registradas aún. Crea una nueva compra.</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="center">Unidad</TableCell>
                  <TableCell align="right">Precio Total</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compras.map((compra) => {
                  const unidadAbre = obtenerNombreUnidad(compra.unidadId);
                  const precioUnitario = compra.cantidad > 0 ? compra.precioTotal / compra.cantidad : 0;
                  return (
                    <TableRow key={compra.id}>
                      <TableCell>
                        <strong>{compra.nombre}</strong>
                      </TableCell>
                      <TableCell align="center">
                        {format(new Date(compra.fecha), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell align="right">{compra.cantidad.toFixed(2)}</TableCell>
                      <TableCell align="center">{unidadAbre}</TableCell>
                      <TableCell align="right">${compra.precioTotal.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ${precioUnitario.toFixed(2)} / {unidadAbre}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleEliminarCompra(compra.id)}
                          >
                            <Delete fontSize="small" />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen total */}
          <Box sx={{ p: 2, backgroundColor: '#f9f9f9', mt: 2, borderRadius: 1 }}>
            <Box sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              Total de Compras: ${totalCompras.toFixed(2)} ({compras.length} compra{compras.length !== 1 ? 's' : ''})
            </Box>
          </Box>
        </>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={dialogoEliminar} onClose={() => setDialogoEliminar(false)}>
        <DialogTitle>Eliminar Compra</DialogTitle>
        <DialogContent>¿Estás seguro de que quieres eliminar esta compra?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEliminar(false)}>Cancelar</Button>
          <Button onClick={confirmarEliminar} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
