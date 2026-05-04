#!/usr/bin/env node

/**
 * Script para reemplazar todas las URLs hardcodeadas de localhost
 * por la configuración centralizada en todos los archivos JSX
 */

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'src');
const filesToUpdate = [
  'pages/Login.jsx',
  'pages/Register.jsx',
  'pages/CrearProducto.jsx',
  'pages/CrearInspiracion.jsx',
  'pages/ItemDetail.jsx',
  'pages/MisModelos.jsx',
  'pages/Perfil.jsx',
  'pages/EditarProducto.jsx',
  'pages/Buscar.jsx',
  'pages/Dashboard.jsx',
  'pages/Guardados.jsx',
];

console.log('🔧 Actualizando URLs de API en archivos JSX...\n');

filesToUpdate.forEach(file => {
  const filePath = path.join(frontendDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const hasImport = content.includes("import API_BASE_URL from '../config/api'");
  
  // Agregar import si no existe
  if (!hasImport) {
    const importRegex = /^(import\s+{[\s\S]*?}\s+from\s+['"][^'"]*['"];?)(\n)/;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$1\nimport API_BASE_URL from '../config/api'$2`);
    }
  }
  
  // Reemplazar URLs
  content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
  // Asegurarse de que está en template literals
  content = content.replace(/\$\{API_BASE_URL\}/g, '${API_BASE_URL}');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Actualizado: ${file}`);
});

console.log('\n🎉 Todas las URLs han sido actualizadas');
