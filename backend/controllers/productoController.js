const Producto = require('../models/Producto');
const Inspiracion = require('../models/Inspiracion'); // <-- Añade esto
const Lista = require('../models/Lista'); // <-- Añade esto
const Usuario = require('../models/Usuarios'); // <-- Añade esto para limpiar favoritos
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
// Acción: Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find()
            .populate('subidoPor', 'username nombreCompleto'); // Traemos datos del usuario que lo subió
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos', error });
    }
};

// Acción: Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id)
            .populate('subidoPor', 'username nombreCompleto');
        
        if (!producto) {
            // Mock data temporal si el id no existe para testing del UI
            return res.status(200).json({
                _id: req.params.id,
                nombre: "Butaca gris para salón (Mock)",
                precio: 39.99,
                vendedor: "IKEA",
                linkCompra: "https://www.ikea.com",
                imagenes: [
                    "https://via.placeholder.com/600x800?text=Mock+Img1",
                    "https://via.placeholder.com/100x120?text=Mock+Img2",
                    "https://via.placeholder.com/100x120?text=Mock+Img3",
                    "https://via.placeholder.com/100x120?text=Mock+Img4"
                ],
                especificaciones: {
                    dimensiones: "74x86x102 cm",
                    materiales: "Tela acolchada",
                    color: "Gris y Negro",
                    peso: "8-12 kg"
                },
                subidoPor: { _id: "mockUser", username: "mariafer97" }
            });
        }
        res.status(200).json(producto);
    } catch (error) {
        // En caso de id inválido (error de validación de ObjectId de Mongoose), devolvemos el mock tmb
        res.status(200).json({
            _id: req.params.id,
            nombre: "Butaca Mock",
            precio: 39.99,
            vendedor: "IKEA",
            linkCompra: "https://www.ikea.com",
            imagenes: ["https://via.placeholder.com/600x800?text=Butaca"],
            especificaciones: {
                dimensiones: "74x86x102 cm",
                materiales: "Tela acolchada",
                color: "Gris y Negro",
                peso: "8-12 kg"
            },
            subidoPor: { _id: "mockUser", username: "mariafer97" }
        });
    }
};

// Acción: Crear un nuevo producto
const crearProducto = async (req, res) => {
    try {
        // Validar que subidoPor está presente
        if (!req.body.subidoPor) {
            return res.status(400).json({ mensaje: 'Se requiere el ID del usuario (subidoPor)' });
        }

        // Validar que el nombre está presente
        if (!req.body.nombre) {
            return res.status(400).json({ mensaje: 'El nombre del producto es requerido' });
        }

        // Manejo de archivos enviados por multipart/form-data (multer los pone en req.files)
        const files = req.files || {};
        const fotosFiles = files.fotos || [];
        const videosFiles = files.videos || [];
        const modeloFiles = files.modelo || [];

        // Helper para subir buffers a Cloudinary
        const uploadBuffer = (buffer, options) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                const readable = new Readable();
                readable._read = () => {};
                readable.push(buffer);
                readable.push(null);
                readable.pipe(uploadStream);
            });
        };

        // Subir fotos
        const imagenes = [];
        for (const f of fotosFiles) {
            const resUp = await uploadBuffer(f.buffer, { folder: 'skala/muebles', resource_type: 'image' });
            imagenes.push(resUp.secure_url);
        }

        // Subir videos
        const videos = [];
        for (const v of videosFiles) {
            const resUp = await uploadBuffer(v.buffer, { folder: 'skala/muebles', resource_type: 'video' });
            videos.push(resUp.secure_url);
        }

        // Subir modelo 3D (raw)
        let modelo3dUrl = '';
        if (modeloFiles.length > 0) {
            const m = modeloFiles[0];
            const resUp = await uploadBuffer(m.buffer, { folder: 'skala/muebles', resource_type: 'raw' });
            modelo3dUrl = resUp.secure_url;
        }

        // Procesar especificaciones si vienen como string
        let especificaciones = req.body.especificaciones || {};
        if (typeof especificaciones === 'string') {
            try { especificaciones = JSON.parse(especificaciones); } catch (e) { /* ignore */ }
        }

        const nuevoProductoData = {
            nombre: req.body.nombre,
            linkCompra: req.body.linkCompra || '',
            precio: parseFloat(req.body.precio) || 0,
            vendedor: req.body.vendedor || '',
            especificaciones,
            imagenes,
            videos,
            modelo3d: modelo3dUrl,
            subidoPor: req.body.subidoPor
        };

        const nuevoProducto = await Producto.create(nuevoProductoData);
        await nuevoProducto.populate('subidoPor', 'username nombreCompleto');
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el producto', error: error.message });
    }
};

// Acción: Eliminar un producto
// Acción: Eliminar un producto y limpiarlo de inspiraciones y listas
const eliminarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;

        // 1. Borramos el producto de la base de datos principal
        const productoEliminado = await Producto.findByIdAndDelete(productoId);
        
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // --- INICIO DEL BORRADO EN CASCADA ---

        // 2. Limpiamos las Inspiraciones: 
        // Buscamos cualquier inspiración que tenga este producto etiquetado y lo sacamos de la lista
        await Inspiracion.updateMany(
            { productos: productoId }, 
            { $pull: { productos: productoId } }
        );

        // 3. Limpiamos las Listas:
        // Buscamos cualquier lista de usuarios que haya guardado este producto y lo sacamos
        await Lista.updateMany(
            { productos: productoId }, 
            { $pull: { productos: productoId } }
        );

        // Limpiar Favoritos: Sacar este producto de los favoritos de cualquier usuario
        await Usuario.updateMany(
            { favoritosProductos: productoId },
            { $pull: { favoritosProductos: productoId } }
        );

        res.status(200).json({ mensaje: 'Producto eliminado y limpiado de todas las listas e inspiraciones' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el producto', error });
    }
};

// Acción: Obtener productos de un usuario concreto
const obtenerProductosUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const productos = await Producto.find({ subidoPor: usuarioId })
            .populate('subidoPor', 'username nombreCompleto');
            
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos del usuario', error });
    }
};

// Acción: Actualizar un producto existente (PUT)
const actualizarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;
        
        // Parsear especificaciones si vienen como string
        let especificaciones = req.body.especificaciones || {};
        if (typeof especificaciones === 'string') {
            try { especificaciones = JSON.parse(especificaciones); } catch (e) { /* ignore */ }
        }

        // Preparamos los datos a actualizar (Por ahora, textos y números)
        // Nota: La actualización de imágenes requeriría una lógica extra para borrar de Cloudinary, 
        // por simplicidad en esta versión actualizamos los datos del formulario.
        const datosActualizados = {
            nombre: req.body.nombre,
            linkCompra: req.body.linkCompra || '',
            precio: parseFloat(req.body.precio) || 0,
            vendedor: req.body.vendedor || '',
            especificaciones
        };

        const productoActualizado = await Producto.findByIdAndUpdate(
            productoId, 
            datosActualizados, 
            { new: true } // Esto hace que devuelva el objeto ya actualizado
        );

        if (!productoActualizado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        res.status(200).json(productoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el producto', error: error.message });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    eliminarProducto,
    obtenerProductosUsuario,
    actualizarProducto
};