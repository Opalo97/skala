const fs = require('fs');
const path = require('path');

console.log('📦 Iniciando movimiento de archivos compilados...');

// Rutas
const frontendDist = path.join(__dirname, '../frontend/dist');
const backendPublic = path.join(__dirname, '../backend/public');
const backendDist = path.join(backendPublic, 'dist');

// Verificar que existe frontend/dist
if (!fs.existsSync(frontendDist)) {
    console.error('❌ Error: No se encontró frontend/dist');
    console.error('   Path esperado:', frontendDist);
    process.exit(1);
}

console.log('✅ Encontrado frontend/dist');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
    // Crear directorio de destino si no existe
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
        console.log('📁 Creado directorio:', dest);
    }

    // Leer contenido del directorio fuente
    const files = fs.readdirSync(src);

    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        const stat = fs.statSync(srcFile);

        if (stat.isDirectory()) {
            // Copiar subdirectorio recursivamente
            copyDir(srcFile, destFile);
        } else {
            // Copiar archivo
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

// Función para eliminar directorio recursivamente
function deleteDir(dir) {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const curPath = path.join(dir, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dir);
    }
}

try {
    // Eliminar carpeta dist anterior si existe
    if (fs.existsSync(backendDist)) {
        console.log('🗑️  Eliminando backend/public/dist anterior...');
        deleteDir(backendDist);
    }

    // Crear directorio backend/public si no existe
    if (!fs.existsSync(backendPublic)) {
        fs.mkdirSync(backendPublic, { recursive: true });
        console.log('📁 Creado directorio:', backendPublic);
    }

    // Copiar nueva carpeta dist
    console.log('📦 Copiando frontend/dist a backend/public/dist...');
    copyDir(frontendDist, backendDist);

    console.log('✅ Build completado. Frontend compilado en backend/public/dist/');
    console.log('📊 Archivos en backend/public/dist:');
    console.log(fs.readdirSync(backendDist));
} catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
    process.exit(1);
}

