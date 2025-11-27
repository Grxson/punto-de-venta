#!/usr/bin/env node

/**
 * Script para corregir errores de TypeScript automáticamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de TypeScript...\n');

const fixes = [
  // ProductoForm.tsx - Remover import Chip no usado
  {
    file: 'src/components/productos/ProductoForm.tsx',
    search: /import.*{[^}]*Chip,?[^}]*}/,
    replace: (match) => match.replace(/,?\s*Chip,?/, '').replace(/,\s*}/, ' }')
  },
  
  // ProductosTable.tsx - Remover imports no usados
  {
    file: 'src/components/productos/ProductosTable.tsx',
    search: 'import { useState, useEffect }',
    replace: 'import { useEffect }'
  },
  {
    file: 'src/components/productos/ProductosTable.tsx',
    search: ', Block',
    replace: ''
  },
  
  // AdminExpenses.tsx - Remover import Edit no usado
  {
    file: 'src/pages/admin/AdminExpenses.tsx',
    search: ', Edit',
    replace: ''
  },
  
  // AdminInventory.tsx - Remover imports no usados
  {
    file: 'src/pages/admin/AdminInventory.tsx',
    search: /,\s*Chip/,
    replace: ''
  },
  {
    file: 'src/pages/admin/AdminInventory.tsx',
    search: /,\s*Tabs/,
    replace: ''
  },
  {
    file: 'src/pages/admin/AdminInventory.tsx',
    search: /,\s*Tab/,
    replace: ''
  },
  
  // AdminSales.tsx - Remover imports no usados
  {
    file: 'src/pages/admin/AdminSales.tsx',
    search: /,\s*InputLabel/,
    replace: ''
  },
  {
    file: 'src/pages/admin/AdminSales.tsx',
    search: /,\s*Tooltip/,
    replace: ''
  },
  {
    file: 'src/pages/admin/AdminSales.tsx',
    search: /,\s*Visibility/,
    replace: ''
  },
  {
    file: 'src/pages/admin/AdminSales.tsx',
    search: /,\s*AutoFixHigh/,
    replace: ''
  },
  
  // Login.tsx - Remover imports no usados
  {
    file: 'src/pages/auth/Login.tsx',
    search: "import apiService from '../../services/api.service';",
    replace: ''
  },
  {
    file: 'src/pages/auth/Login.tsx',
    search: "import { API_ENDPOINTS } from '../../config/api.config';",
    replace: ''
  },
  
  // PosCart.tsx - Remover import clearCart no usado
  {
    file: 'src/pages/pos/PosCart.tsx',
    search: ', clearCart',
    replace: ''
  },
  
  // PosHome.tsx - Remover import ExpandLess no usado
  {
    file: 'src/pages/pos/PosHome.tsx',
    search: ', ExpandLess',
    replace: ''
  }
];

let fixedCount = 0;

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${fix.file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  if (typeof fix.search === 'string') {
    content = content.replace(fix.search, fix.replace);
  } else if (fix.search instanceof RegExp) {
    if (typeof fix.replace === 'function') {
      content = content.replace(fix.search, fix.replace);
    } else {
      content = content.replace(fix.search, fix.replace);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corregido: ${fix.file}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Se corrigieron ${fixedCount} archivos.`);
console.log('\n📝 Errores restantes que requieren corrección manual:');
console.log('   - AdminExpenses.tsx: usuario.sucursalId → usuario.idSucursal');
console.log('   - AdminInventory.tsx: MenuItem value debe ser string');
console.log('   - AdminSales.tsx: Pago interface necesita campo fecha');
console.log('   - PosExpenses.tsx: usuario.sucursalId → usuario.idSucursal');
console.log('   - PosHome.tsx: producto.descripcion no existe');
console.log('   - userPreferences.service.ts: tipos de retorno');
console.log('   - websocket.service.ts: tipos de sockjs-client');
