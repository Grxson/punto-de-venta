#!/usr/bin/env node

/**
 * Script de verificación para el build de producción
 * Verifica que todas las variables de entorno necesarias estén configuradas
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Verificando configuración para producción...\n');

// Verificar que existe el build
const distPath = path.join(currentDirectory, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: No se encontró la carpeta dist/');
  console.log('   Ejecuta: npm run build\n');
  process.exit(1);
}

// Verificar archivos importantes
const requiredFiles = [
  'dist/index.html',
  'dist/assets',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(currentDirectory, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: No se encontró ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n   Ejecuta: npm run build\n');
  process.exit(1);
}

// Verificar variables de entorno
const requiredEnvVars = {
  RAILWAY_FRONTEND_URL: process.env.RAILWAY_FRONTEND_URL,
  VITE_API_URL_PROD: process.env.VITE_API_URL_PROD,
};

console.log('📋 Variables de entorno:');
let allEnvVarsSet = true;
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (value) {
    console.log(`   ✅ ${key}: ${value}`);
  } else {
    console.log(`   ⚠️  ${key}: NO CONFIGURADA`);
    allEnvVarsSet = false;
  }
});

if (!allEnvVarsSet) {
  console.log('\n⚠️  Advertencia: Algunas variables de entorno no están configuradas.');
  console.log('   Esto puede causar problemas en producción.\n');
} else {
  console.log('\n✅ Todas las variables de entorno están configuradas.\n');
}

// Verificar configuración de Electron
const electronMainPath = path.join(currentDirectory, 'electron', 'main.cjs');
if (fs.existsSync(electronMainPath)) {
  const electronMain = fs.readFileSync(electronMainPath, 'utf8');
  if (electronMain.includes('RAILWAY_FRONTEND_URL')) {
    console.log('✅ Electron está configurado para usar Railway.\n');
  } else {
    console.log('⚠️  Advertencia: Electron puede no estar configurado correctamente.\n');
  }
}

console.log('✅ Verificación completada.\n');

