import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ComprasList from './components/ComprasList';
import CompraForm from './components/CompraForm';

/**
 * AdminCompras - Componente principal para gestión de compras
 * Organizado con tabs para:
 * - Listado de compras (con paginación, filtros, edición, eliminación)
 * - Crear nueva compra (formulario)
 * - Editar compra existente (formulario)
 */
export default function AdminCompras() {
  const [currentTab, setCurrentTab] = useState(0);
  const [compraEnEdicion, setCompraEnEdicion] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setCompraEnEdicion(null);
  };

  /**
   * Navegar a crear nueva compra
   */
  const handleCrear = () => {
    setCompraEnEdicion(null);
    setCurrentTab(1);
  };

  /**
   * Navegar a editar compra
   */
  const handleEditar = (compraId: number) => {
    setCompraEnEdicion(compraId);
    setCurrentTab(2);
  };

  /**
   * Después de guardar, volver al listado
   */
  const handleGuardado = () => {
    setRefreshTrigger((prev) => prev + 1);
    setCompraEnEdicion(null);
    setCurrentTab(0);
  };

  /**
   * Al cancelar, volver al listado
   */
  const handleCancelado = () => {
    setCompraEnEdicion(null);
    setCurrentTab(0);
  };

  return (
    <Box>
      <h1 style={{ margin: '0 0 1rem 0' }}>📦 Gestión de Compras</h1>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="Listado de Compras" />
        <Tab label="Nueva Compra" disabled={currentTab === 0} />
        {compraEnEdicion && <Tab label={`Editar Compra #${compraEnEdicion}`} disabled={currentTab === 0} />}
      </Tabs>

      {/* Tab 0: Listado */}
      {currentTab === 0 && (
        <ComprasList onCrear={handleCrear} onEditar={handleEditar} refreshTrigger={refreshTrigger} />
      )}

      {/* Tab 1: Nueva Compra */}
      {currentTab === 1 && (
        <CompraForm onGuardado={handleGuardado} onCancelado={handleCancelado} />
      )}

      {/* Tab 2: Editar Compra */}
      {currentTab === 2 && compraEnEdicion && (
        <CompraForm compraId={compraEnEdicion} onGuardado={handleGuardado} onCancelado={handleCancelado} />
      )}
    </Box>
  );
}
