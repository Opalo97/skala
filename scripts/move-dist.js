const fs = require('fs');
const path = require('path');

// Rutas
const frontendDist = path.join(__dirname, '../frontend/dist');
const backendPublic = path.join(__dirname, '../backend/public');
const backendDist = path.join(backendPublic, 'dist');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
    // Crear directorio de destino si no existe
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
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

// Eliminar carpeta dist anterior si existe
if (fs.existsSync(backendDist)) {
    console.log('📦 Eliminando dist anterior...');
    deleteDir(backendDist);
}

// Crear directorio backend/public si no existe
if (!fs.existsSync(backendPublic)) {
    fs.mkdirSync(backendPublic, { recursive: true });
}

// Copiar nueva carpeta dist
console.log('📦 Copiando frontend/dist a backend/public/dist...');
copyDir(frontendDist, backendDist);

console.log('✅ Build completado. Frontend compilado en backend/public/dist/');
