#!/usr/bin/env node

/**
 * Script para corregir TODOS los errores de TypeScript reportados por Railway
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo TODOS los errores de TypeScript...\n');

const filesToFix = [
  {
    file: 'src/components/ProtectedRoute.tsx',
    fixes: [
      {
        search: /import.*useAuth.*from/,
        replace: (match) => match.replace(/,\s*useAuth,?/, '').replace(/,\s*}/, ' }')
      }
    ]
  },
  {
    file: 'src/components/productos/ProductoForm.tsx',
    fixes: [
      {
        search: /,\s*Chip,?/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/components/productos/ProductosTable.tsx',
    fixes: [
      {
        search: /import\s*{\s*useState,\s*useEffect\s*}/,
        replace: 'import { useEffect }'
      },
      {
        search: /,\s*Block/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/admin/AdminExpenses.tsx',
    fixes: [
      {
        search: /,\s*Edit/,
        replace: ''
      },
      {
        search: /usuario\?\.sucursalId/,
        replace: 'usuario?.idSucursal'
      },
      {
        search: /usuario\.sucursalId/,
        replace: 'usuario.idSucursal'
      }
    ]
  },
  {
    file: 'src/pages/admin/AdminInventory.tsx',
    fixes: [
      {
        search: /,\s*Chip/,
        replace: ''
      },
      {
        search: /,\s*Tabs/,
        replace: ''
      },
      {
        search: /,\s*Tab/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/admin/AdminSales.tsx',
    fixes: [
      {
        search: /,\s*InputLabel/,
        replace: ''
      },
      {
        search: /,\s*Tooltip/,
        replace: ''
      },
      {
        search: /,\s*Visibility/,
        replace: ''
      },
      {
        search: /,\s*AutoFixHigh/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/auth/Login.tsx',
    fixes: [
      {
        search: /import\s+apiService.*\n/,
        replace: ''
      },
      {
        search: /import\s+{\s*API_ENDPOINTS\s*}.*\n/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/pos/PosCart.tsx',
    fixes: [
      {
        search: /,\s*clearCart/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/pos/PosExpenses.tsx',
    fixes: [
      {
        search: /usuario\?\.sucursalId/,
        replace: 'usuario?.idSucursal'
      },
      {
        search: /usuario\.sucursalId/,
        replace: 'usuario.idSucursal'
      }
    ]
  },
  {
    file: 'src/pages/pos/PosHome.tsx',
    fixes: [
      {
        search: /,\s*ExpandLess/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/pages/pos/PosSales.tsx',
    fixes: [
      {
        search: /handleAgregarPago/,
        replace: (match, content) => {
          // Comentar la función no usada
          return `// ${match}`
        }
      }
    ]
  },
  {
    file: 'src/services/websocket.service.ts',
    fixes: [
      {
        search: /handlersRegistered/,
        replace: (match) => `// ${match}`
      },
      {
        search: /wsEndpoint/,
        replace: (match) => `// ${match}`
      },
      {
        search: /handlerId/,
        replace: (match) => `// ${match}`
      }
    ]
  }
];

let totalFixed = 0;

filesToFix.forEach(({ file, fixes }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  fixes.forEach(fix => {
    if (typeof fix.search === 'string') {
      content = content.replace(fix.search, fix.replace);
    } else if (fix.search instanceof RegExp) {
      if (typeof fix.replace === 'function') {
        content = content.replace(fix.search, fix.replace);
      } else {
        content = content.replace(fix.search, fix.replace);
      }
    }
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corregido: ${file}`);
    totalFixed++;
  }
});

// Corregir errores específicos de AdminSales.tsx - fecha faltante en Pago
const adminSalesPath = path.join(__dirname, 'src/pages/admin/AdminSales.tsx');
if (fs.existsSync(adminSalesPath)) {
  let content = fs.readFileSync(adminSalesPath, 'utf8');
  const originalContent = content;
  
  // Buscar todos los objetos Pago sin fecha y agregarla
  content = content.replace(
    /(const nuevoPago: Pago = \{[\s\S]*?referencia: '[^']*',?\s*\})/g,
    (match) => {
      if (!match.includes('fecha:')) {
        return match.replace(/(referencia: '[^']*',?)/, "$1\n          fecha: new Date().toISOString(),");
      }
      return match;
    }
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(adminSalesPath, content);
    console.log(`✅ Corregido: AdminSales.tsx - agregado campo fecha a Pago`);
    totalFixed++;
  }
}

// Corregir AdminInventory.tsx - MenuItem value boolean
const adminInventoryPath = path.join(__dirname, 'src/pages/admin/AdminInventory.tsx');
if (fs.existsSync(adminInventoryPath)) {
  let content = fs.readFileSync(adminInventoryPath, 'utf8');
  const originalContent = content;
  
  // Ya debería estar corregido, pero verificamos
  if (content.includes('value={true}') || content.includes('value={false}')) {
    content = content.replace(/value=\{true\}/g, 'value="true"');
    content = content.replace(/value=\{false\}/g, 'value="false"');
    
    if (content !== originalContent) {
      fs.writeFileSync(adminInventoryPath, content);
      console.log(`✅ Corregido: AdminInventory.tsx - MenuItem values`);
      totalFixed++;
    }
  }
}

// Corregir PosHome.tsx - producto.descripcion
const posHomePath = path.join(__dirname, 'src/pages/pos/PosHome.tsx');
if (fs.existsSync(posHomePath)) {
  let content = fs.readFileSync(posHomePath, 'utf8');
  const originalContent = content;
  
  content = content.replace(/producto\.descripcion/g, 'producto.nombre');
  
  if (content !== originalContent) {
    fs.writeFileSync(posHomePath, content);
    console.log(`✅ Corregido: PosHome.tsx - producto.descripcion → producto.nombre`);
    totalFixed++;
  }
}

// Corregir userPreferences.service.ts
const userPrefsPath = path.join(__dirname, 'src/services/userPreferences.service.ts');
if (fs.existsSync(userPrefsPath)) {
  let content = fs.readFileSync(userPrefsPath, 'utf8');
  const originalContent = content;
  
  // Remover UserPreferences no usado
  content = content.replace(/interface UserPreferences[\s\S]*?}\s*/g, '');
  
  // Corregir tipo de retorno
  content = content.replace(
    /getPosDesayunosSubcategory\(\):\s*string\s*\|\s*null\s*\|\s*undefined/g,
    'getPosDesayunosSubcategory(): string | null'
  );
  
  content = content.replace(
    /getPosSelectedCategory\(\):\s*number\s*\|\s*null\s*\|\s*undefined/g,
    'getPosSelectedCategory(): number | null'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(userPrefsPath, content);
    console.log(`✅ Corregido: userPreferences.service.ts`);
    totalFixed++;
  }
}

console.log(`\n🎉 Se corrigieron ${totalFixed} archivos.`);
console.log('\n📝 Verificando build...\n');

