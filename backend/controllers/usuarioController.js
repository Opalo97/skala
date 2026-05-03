const Usuario = require('../models/Usuarios');
const Inspiracion = require('../models/Inspiracion');
const Producto = require('../models/Producto');
const Comentario = require('../models/Comentario');
const Coleccion = require('../models/Coleccion');
const Lista = require('../models/Lista');

// Acción: Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find()
            // Podemos traer la info de las inspiraciones favoritas si las hubiera
            .populate('favoritosInspiraciones'); 
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los usuarios', error });
    }
};

// Acción: Crear un nuevo usuario (Registro)
const crearUsuario = async (req, res) => {
    try {
        // Determinar la URL de la foto de perfil de forma robusta
        const defaultFoto = 'https://res.cloudinary.com/skala/image/upload/v1777538122/foto_perfil_bmu1ge.jpg';
        let fotoPerfil = defaultFoto;

        // Multer + Cloudinary puede aportar distintos campos según la versión
        if (req.file) {
            fotoPerfil = req.file.secure_url || req.file.path || req.file.url || req.file.public_id || fotoPerfil;
        }

        // Si por algún motivo el cliente envió fotoPerfil en el body (string URL), priorizarla
        if (!req.file && req.body && typeof req.body.fotoPerfil === 'string' && req.body.fotoPerfil.trim().length > 0) {
            fotoPerfil = req.body.fotoPerfil.trim();
        }

        // En un proyecto real aquí deberíamos hashear la contraseña antes de guardar
        const nuevoUsuario = await Usuario.create({
            ...req.body,
            fotoPerfil: fotoPerfil,
        });
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el usuario', error });
    }
};

// Acción: Obtener un usuario por su ID
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar el usuario', error });
    }
};

// Acción: Eliminar un usuario y todos sus datos asociados (Borrado en Cascada)
const eliminarUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;

        // 1. Comprobamos si el usuario existe
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // --- INICIO DEL BORRADO EN CASCADA ---

        // 2. Buscar todas las inspiraciones de este usuario para limpiarlas de las colecciones de otros
        const inspiracionesDelUsuario = await Inspiracion.find({ autor: usuarioId });
        const idsInspiraciones = inspiracionesDelUsuario.map(insp => insp._id);

        // Si tenía inspiraciones, las borramos de las colecciones de otros usuarios (como Álvaro)
        if (idsInspiraciones.length > 0) {
            await Coleccion.updateMany(
                { inspiraciones: { $in: idsInspiraciones } }, // Busca en cualquier colección que tenga estas inspiraciones
                { $pull: { inspiraciones: { $in: idsInspiraciones } } } // Las elimina de la lista
            );
        }

        // 3. Buscar todos los productos de este usuario para limpiarlos de las listas de otros
        const productosDelUsuario = await Producto.find({ subidoPor: usuarioId });
        const idsProductos = productosDelUsuario.map(prod => prod._id);

        if (idsProductos.length > 0) {
            await Lista.updateMany(
                { productos: { $in: idsProductos } },
                { $pull: { productos: { $in: idsProductos } } }
            );
        }

        // 4. Borrar el contenido principal que creó el usuario
        await Inspiracion.deleteMany({ autor: usuarioId });
        await Producto.deleteMany({ subidoPor: usuarioId });
        await Comentario.deleteMany({ usuario: usuarioId });
        await Coleccion.deleteMany({ creadaPor: usuarioId }); // Borrar sus propias colecciones
        await Lista.deleteMany({ creadaPor: usuarioId }); // Borrar sus propias listas

        // 5. Finalmente, borramos al usuario
        await Usuario.findByIdAndDelete(usuarioId);

        res.status(200).json({ mensaje: 'Usuario y todos sus datos asociados eliminados con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el usuario', error });
    }
};

// Acción: Actualizar usuario (credenciales, bio, email, password)
const actualizarUsuario = async (req, res) => {
    try {
        const usuarioId = req.params.id;

        // Construir objeto de actualización sólo con campos permitidos
        const allowed = ['nombreCompleto', 'email', 'password', 'bio', 'username'];
        const updates = {};
        allowed.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ mensaje: 'No se proporcionaron campos a actualizar' });
        }

        const usuario = await Usuario.findByIdAndUpdate(usuarioId, updates, { new: true, runValidators: true });
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el usuario', error });
    }
};

// Acción: Actualizar foto de perfil
const actualizarFotoPerfil = async (req, res) => {
    try {
        const usuarioId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se proporcionó ningún archivo' });
        }

        const nuevaUrl = req.file.secure_url || req.file.path || req.file.url || null;
        if (!nuevaUrl) {
            return res.status(500).json({ mensaje: 'No se pudo obtener la URL pública de la imagen subida' });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            usuarioId,
            { fotoPerfil: nuevaUrl },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar la foto de perfil', error });
    }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    obtenerUsuarioPorId,
    eliminarUsuario,
    actualizarFotoPerfil,
    actualizarUsuario
};