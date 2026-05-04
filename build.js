#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando build del proyecto...\n');

const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');

try {
    // Paso 1: Build del frontend con npx
    console.log('📦 Compilando frontend con Vite...');
    
    const distPath = path.join(frontendDir, 'dist');
    if (fs.existsSync(distPath)) {
        console.log('🗑️  Limpiando dist anterior...');
        execSync(`rm -rf "${distPath}"`, { shell: true });
    }
    
    console.log('Ejecutando: npx vite build');
    execSync('npx vite build', { cwd: frontendDir, stdio: 'inherit', shell: true });
    console.log('✅ Frontend compilado exitosamente\n');

    // Paso 2: Verificar que dist existe
    if (!fs.existsSync(distPath)) {
        throw new Error('El directorio dist no se creó después del build');
    }
    console.log('✅ Directorio dist verificado\n');

    // Paso 3: Mover archivos compilados
    console.log('📦 Moviendo archivos compilados...');
    execSync('node scripts/move-dist.js', { cwd: rootDir, stdio: 'inherit', shell: true });
    console.log('✅ Archivos movidos exitosamente\n');

    console.log('🎉 Build completado con éxito');
    process.exit(0);
} catch (error) {
    console.error('❌ Error durante el build:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    process.exit(1);
}
