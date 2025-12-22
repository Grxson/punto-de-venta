import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ComprasList from './components/ComprasList';
import CompraForm from './components/CompraForm';
import CompraSimpleForm from './components/CompraSimpleForm';
import ComprasListaSimple from './components/ComprasListaSimple';
import CrearIngredienteDesdeCompra from './components/CrearIngredienteDesdeCompra';

/**
 * AdminCompras - Componente principal para gestión de compras
 * 
 * Flujo nuevo (recomendado):
 * 1. Registrar Compra Simple (nombre, fecha, cantidad, unidad, precio)
 * 2. Ver Compras Simples
 * 3. Crear Ingrediente desde Compra (calcular costo unitario basado en rendimiento)
 * 
 * Flujo antiguo (para compras complejas con proveedor):
 * - Listado de compras
 * - Crear nueva compra con ingredientes múltiples
 * - Editar compra existente
 */
export default function AdminCompras() {
  const [currentTab, setCurrentTab] = useState(0);
  const [compraEnEdicion, setCompraEnEdicion] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalCrearIngrediente, setModalCrearIngrediente] = useState(false);

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

  /**
   * Después de guardar una compra simple, volver al listado
   */
  const handleGuardadoCompraSimple = () => {
    setRefreshTrigger((prev) => prev + 1);
    setCurrentTab(1); // Ir al listado de compras simples
  };

  /**
   * Al crear un ingrediente, volver al listado
   */
  const handleIngredienteCreado = () => {
    setModalCrearIngrediente(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box>
      <h1 style={{ margin: '0 0 1rem 0' }}>📦 Gestión de Compras</h1>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        {/* FLUJO NUEVO - RECOMENDADO */}
        <Tab label="🔥 Registrar Compra Simple" />
        <Tab label="📋 Ver Compras Simples" />
        <Tab label="✨ Crear Ingrediente" />
        
        {/* FLUJO ANTIGUO */}
        <Tab label="Compras (Antiguo)" />
        <Tab label="Nueva Compra (Antiguo)" disabled={currentTab === 3} />
        {compraEnEdicion && <Tab label={`Editar Compra #${compraEnEdicion}`} disabled={currentTab === 3} />}
      </Tabs>

      {/* TAB 0: Registrar Compra Simple (NUEVO) */}
      {currentTab === 0 && (
        <CompraSimpleForm onGuardado={handleGuardadoCompraSimple} onCancelado={() => setCurrentTab(1)} />
      )}

      {/* TAB 1: Ver Compras Simples (NUEVO) */}
      {currentTab === 1 && (
        <Box>
          <ComprasListaSimple refreshTrigger={refreshTrigger} />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <button 
              onClick={() => setCurrentTab(0)}
              style={{ 
                padding: '10px 20px', 
                cursor: 'pointer',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              + Registrar Nueva Compra
            </button>
            <button 
              onClick={() => setModalCrearIngrediente(true)}
              style={{ 
                padding: '10px 20px', 
                cursor: 'pointer',
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              ✨ Crear Ingrediente desde Compra
            </button>
          </Box>
        </Box>
      )}

      {/* TAB 2: Crear Ingrediente desde Compra (NUEVO) */}
      {currentTab === 2 && (
        <Box>
          <button 
            onClick={() => setModalCrearIngrediente(true)}
            style={{ 
              padding: '12px 24px', 
              cursor: 'pointer',
              backgroundColor: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              marginBottom: '20px'
            }}
          >
            ✨ Crear Ingrediente desde Compra
          </button>
        </Box>
      )}

      {/* TAB 3: Listado de Compras (ANTIGUO) */}
      {currentTab === 3 && (
        <ComprasList onCrear={handleCrear} onEditar={handleEditar} refreshTrigger={refreshTrigger} />
      )}

      {/* TAB 4: Nueva Compra (ANTIGUO) */}
      {currentTab === 4 && (
        <CompraForm onGuardado={handleGuardado} onCancelado={handleCancelado} />
      )}

      {/* TAB 5: Editar Compra (ANTIGUO) */}
      {currentTab === 5 && compraEnEdicion && (
        <CompraForm compraId={compraEnEdicion} onGuardado={handleGuardado} onCancelado={handleCancelado} />
      )}

      {/* Modal: Crear Ingrediente desde Compra */}
      <CrearIngredienteDesdeCompra
        open={modalCrearIngrediente}
        onClose={() => setModalCrearIngrediente(false)}
        onIngredienteCreado={handleIngredienteCreado}
      />
    </Box>
  );
}
