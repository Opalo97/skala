const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Esto lee las contraseñas de tu archivo .env

const app = express();

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Configuración de Multer con Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'skala/usuarios',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        resource_type: 'image',
    },
});

const upload = multer({ storage: storage });

// Middlewares (Configuraciones básicas)
app.use(cors());
app.use(express.json()); // Permite al servidor entender datos en formato JSON
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos del frontend compilado
app.use(express.static(path.join(__dirname, 'public/dist')));

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 Base de datos MongoDB conectada con éxito'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.send('¡El servidor de la plataforma multimedia está funcionando!');
});

// 👇 AQUÍ CONECTAS TUS RUTAS 👇
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/inspiraciones', require('./routes/inspiracionRoutes'));
app.use('/api/comentarios', require('./routes/comentarioRoutes'));
app.use('/api/colecciones', require('./routes/coleccionRoutes'));
app.use('/api/listas', require('./routes/listaRoutes'));
app.use('/api/elementos', require('./routes/elementosRoutes'));

// SPA Fallback: redirige todas las rutas no-API al index.html para que React Router las maneje
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'public/dist/index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});