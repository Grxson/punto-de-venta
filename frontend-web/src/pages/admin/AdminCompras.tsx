import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import CompraSimpleForm from './components/CompraSimpleForm';
import ComprasListaSimple from './components/ComprasListaSimple';
import CrearIngredienteDesdeCompra from './components/CrearIngredienteDesdeCompra';

/**
 * AdminCompras - Gestión de compras simples
 * 
 * Flujo:
 * 1. Registrar Compra Simple (nombre, fecha, cantidad, unidad, precio)
 * 2. Ver Compras Simples
 * 3. Crear Ingrediente desde Compra (calcular costo unitario basado en rendimiento)
 */
export default function AdminCompras() {
  const [currentTab, setCurrentTab] = useState(1); // Por defecto: Ver Compras Simples
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalCrearIngrediente, setModalCrearIngrediente] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
        <Tab label="🔥 Registrar Compra Simple" />
        <Tab label="📋 Ver Compras Simples" />
        <Tab label="✨ Crear Ingrediente" />
      </Tabs>

      {/* TAB 0: Registrar Compra Simple */}
      {currentTab === 0 && (
        <CompraSimpleForm onGuardado={handleGuardadoCompraSimple} onCancelado={() => setCurrentTab(1)} />
      )}

      {/* TAB 1: Ver Compras Simples */}
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

      {/* TAB 2: Crear Ingrediente desde Compra */}
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

      {/* Modal: Crear Ingrediente desde Compra */}
      <CrearIngredienteDesdeCompra
        open={modalCrearIngrediente}
        onClose={() => setModalCrearIngrediente(false)}
        onIngredienteCreado={handleIngredienteCreado}
      />
    </Box>
  );
}
