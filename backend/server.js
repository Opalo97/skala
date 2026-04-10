const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Esto lee las contraseñas de tu archivo .env

const app = express();

// Middlewares (Configuraciones básicas)
app.use(cors());
app.use(express.json()); // Permite al servidor entender datos en formato JSON

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 Base de datos MongoDB conectada con éxito'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.send('¡El servidor de la plataforma multimedia está funcionando!');
});

// Arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.send('¡El servidor de la plataforma multimedia está funcionando!');
});

// 👇 AÑADE ESTA LÍNEA NUEVA 👇
app.use('/api/elementos', require('./routes/elementosRoutes'));

// Arrancar el servidor
// ... (código posterior)