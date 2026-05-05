const Inspiracion = require('../models/Inspiracion');
const Coleccion = require('../models/Coleccion');
const Comentario = require('../models/Comentario');
const Usuario = require('../models/Usuarios'); // <-- Añade esto para limpiar favoritos
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Acción: Obtener una inspiración por ID
const obtenerInspiracionPorId = async (req, res) => {
    try {
        const inspiracion = await Inspiracion.findById(req.params.id)
            .populate('autor', 'username fotoPerfil')
            .populate('productos');
        if (!inspiracion) return res.status(404).json({ mensaje: 'Inspiración no encontrada' });
        res.status(200).json(inspiracion);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener la inspiración', error });
    }
};

// Acción: Obtener todas las inspiraciones (GET)
const obtenerInspiraciones = async (req, res) => {
    try {
        const inspiraciones = await Inspiracion.find()
            .populate('autor', 'username fotoPerfil') 
            .populate('productos');
        
        res.status(200).json(inspiraciones);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las inspiraciones', error });
    }
};

// Acción: Crear una nueva inspiración (POST)
const crearInspiracion = async (req, res) => {
    try {
        // Manejo de archivos desde req.files (multer memoryStorage)
        const files = req.files || [];

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

        const imagenes = [];
        const videos = [];

        for (const f of files) {
            const isImage = f.mimetype.startsWith('image/');
            const isVideo = f.mimetype.startsWith('video/');
            const options = { folder: 'skala/inspiraciones' };
            if (isImage) options.resource_type = 'image';
            else if (isVideo) options.resource_type = 'video';
            else options.resource_type = 'raw';

            const resUp = await uploadBuffer(f.buffer, options);
            if (isImage) imagenes.push(resUp.secure_url);
            else if (isVideo) videos.push(resUp.secure_url);
        }

        // Procesar cuerpo
        const body = req.body || {};
        let muebles = body.muebles || [];
        if (typeof muebles === 'string') {
            try { muebles = JSON.parse(muebles); } catch (e) { /* ignore */ }
        }

        const nuevaInspiracionData = {
            nombre: body.nombre,
            zonaCasa: body.zonaCasa,
            categoriaDecoracion: body.categoriaDecoracion,
            multimedia: { imagenes, videos },
            productos: muebles,
            autor: body.autor
        };

        const nuevaInspiracion = await Inspiracion.create(nuevaInspiracionData);
        res.status(201).json(nuevaInspiracion);
    } catch (error) {
        console.error('Error crearInspiracion:', error);
        res.status(400).json({ mensaje: 'Error al crear la inspiración', error: error.message || error });
    }
};

// Acción: Eliminar una inspiración (DELETE)
// Acción: Eliminar una inspiración y limpiarla de las colecciones
const eliminarInspiracion = async (req, res) => {
    try {
        const inspiracionId = req.params.id;

        // 1. Borramos la inspiración principal
        const inspiracionEliminada = await Inspiracion.findByIdAndDelete(inspiracionId);
        
        if (!inspiracionEliminada) {
            return res.status(404).json({ mensaje: 'Inspiración no encontrada' });
        }

        // 2. Limpieza (Cascada manual):
        // Buscamos todas las colecciones que tengan este ID en su array "inspiraciones"
        // y le decimos a MongoDB que "saque" ($pull) ese ID de la lista.
        await Coleccion.updateMany(
            { inspiraciones: inspiracionId }, 
            { $pull: { inspiraciones: inspiracionId } }
        );

        // Limpiar Comentarios: Borrar todos los comentarios asociados a esta inspiración
        await Comentario.deleteMany({ inspiracion: inspiracionId });

        // Limpiar Favoritos: Sacar esta inspiración de los favoritos de cualquier usuario
        await Usuario.updateMany(
            { favoritosInspiraciones: inspiracionId },
            { $pull: { favoritosInspiraciones: inspiracionId } }
        );

        res.status(200).json({ mensaje: 'Inspiración eliminada y limpiada de las colecciones' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar la inspiración', error });
    }


};

// Acción: Obtener inspiraciones de un usuario concreto
const obtenerInspiracionesUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        const inspiraciones = await Inspiracion.find({ autor: usuarioId })
            .populate('autor', 'username fotoPerfil')
            .populate('productos');
            
        res.status(200).json(inspiraciones);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las inspiraciones del usuario', error });
    }
};

// Acción: Obtener inspiraciones que contienen un producto concreto
const obtenerInspiracionesPorProducto = async (req, res) => {
    try {
        const productoId = req.params.id;
        const inspiraciones = await Inspiracion.find({ productos: productoId })
            .populate('autor', 'username fotoPerfil');
        res.status(200).json(inspiraciones);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las inspiraciones del producto', error });
    }
};

// Acción: Actualizar una inspiración existente (PUT)
const actualizarInspiracion = async (req, res) => {
    try {
        const inspiracionId = req.params.id;
        const inspiracionExistente = await Inspiracion.findById(inspiracionId);

        if (!inspiracionExistente) {
            return res.status(404).json({ mensaje: 'Inspiración no encontrada' });
        }

        // 1. Manejo de archivos NUEVOS a subir a Cloudinary
        const files = req.files || [];
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

        const imagenesNuevas = [];
        const videosNuevos = [];

        for (const f of files) {
            const isImage = f.mimetype.startsWith('image/');
            const isVideo = f.mimetype.startsWith('video/');
            const options = { folder: 'skala/inspiraciones' };

            if (isImage) options.resource_type = 'image';
            else if (isVideo) options.resource_type = 'video';
            else options.resource_type = 'raw';

            const resUp = await uploadBuffer(f.buffer, options);

            if (isImage) imagenesNuevas.push(resUp.secure_url);
            else if (isVideo) videosNuevos.push(resUp.secure_url);
        }

        // 2. Procesar datos de texto y arrays enviados desde el frontend
        const body = req.body || {};

        let muebles = body.muebles || [];
        if (typeof muebles === 'string') {
            try { muebles = JSON.parse(muebles); } catch (e) { /* ignorar */ }
        }

        let imagenesActuales = [];
        if (body.imagenesActuales) {
            try { imagenesActuales = JSON.parse(body.imagenesActuales); } catch (e) { /* ignorar */ }
        }

        let videosActuales = [];
        if (body.videosActuales) {
            try { videosActuales = JSON.parse(body.videosActuales); } catch (e) { /* ignorar */ }
        }

        // 3. Combinar multimedia vieja con la nueva
        const imagenesFinales = [...imagenesActuales, ...imagenesNuevas];
        const videosFinales = [...videosActuales, ...videosNuevos];

        // 4. Actualizar en la BD
        const inspiracionActualizada = await Inspiracion.findByIdAndUpdate(
            inspiracionId,
            {
                nombre: body.nombre,
                zonaCasa: body.zonaCasa,
                categoriaDecoracion: body.categoriaDecoracion,
                productos: muebles,
                multimedia: {
                    imagenes: imagenesFinales,
                    videos: videosFinales
                }
            },
            { new: true } // Para que devuelva la info ya actualizada
        );

        res.status(200).json(inspiracionActualizada);

    } catch (error) {
        console.error('Error actualizarInspiracion:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la inspiración', error: error.message });
    }
};

// Exportamos las funciones para que las rutas las puedan usar
module.exports = {
    obtenerInspiraciones,
    obtenerInspiracionPorId,
    crearInspiracion,
    eliminarInspiracion,
    obtenerInspiracionesUsuario,
    obtenerInspiracionesPorProducto,
    actualizarInspiracion
};