const mongoose = require('mongoose');
require('dotenv').config(); // Para leer tu MONGO_URI

// Importar los modelos
const Usuario = require('./models/Usuarios');
const Producto = require('./models/Producto');
const Inspiracion = require('./models/Inspiracion');

async function poblarBaseDeDatos() {
    try {
        // 1. Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔥 Conectado a MongoDB para poblar datos...');

        // Opcional: Limpiar la base de datos antes de empezar para no duplicar
        await Usuario.deleteMany({});
        await Producto.deleteMany({});
        await Inspiracion.deleteMany({});

        // 2. Crear un Usuario de prueba con los campos recomendados [cite: 29]
        const nuevoUsuario = await Usuario.create({
            nombreCompleto: "María Fernández Ruiz",
            username: "mariferu98",
            email: "maria@gmail.com",
            password: "123", // En el futuro irá hasheada [cite: 121]
            bio: "Me mola diseñar habitaciones",
            preferenciasAccesibilidad: { tamanoFuente: "mediano", modoColor: "claro" }
        });
        console.log('✅ Usuario creado:', nuevoUsuario.username);

        // 3. Crear un Producto subido por ese usuario [cite: 46]
        const nuevoProducto = await Producto.create({
            nombre: "Butaca gris para salón",
            vendedor: "IKEA",
            precio: 39.99,
            especificaciones: { dimensiones: "74x86x102 cm", color: "Gris y negro" },
            subidoPor: nuevoUsuario._id // Relacionamos con el ID del usuario creado [cite: 62]
        });
        console.log('✅ Producto creado:', nuevoProducto.nombre);

        // 4. Crear una Inspiración que incluya ese producto y autor [cite: 77, 78]
        const nuevaInspiracion = await Inspiracion.create({
            nombre: "Salón vintage tonos fríos",
            zonaCasa: "Salón",
            categoriaDecoracion: "Minimalista",
            autor: nuevoUsuario._id,
            productos: [nuevoProducto._id] // Guardamos la referencia al producto [cite: 123]
        });
        console.log('✅ Inspiración creada:', nuevaInspiracion.nombre);

        console.log('🎉 ¡Base de datos inicializada con éxito!');
        process.exit(); // Cierra el script correctamente
    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    }
}

poblarBaseDeDatos();