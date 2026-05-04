#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando build del proyecto...\n');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

try {
    // Paso 1: Build del frontend
    console.log('📦 Compilando frontend con Vite...');
    process.chdir(frontendDir);
    
    if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
        console.log('⚠️  node_modules no encontrado en frontend, instalando...');
        execSync('npm install', { stdio: 'inherit' });
    }
    
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend compilado exitosamente\n');

    // Paso 2: Mover archivos compilados
    console.log('📦 Moviendo archivos compilados...');
    process.chdir(rootDir);
    execSync('node scripts/move-dist.js', { stdio: 'inherit' });
    console.log('✅ Archivos movidos exitosamente\n');

    console.log('🎉 Build completado con éxito');
    process.exit(0);
} catch (error) {
    console.error('❌ Error durante el build:', error.message);
    process.exit(1);
}
