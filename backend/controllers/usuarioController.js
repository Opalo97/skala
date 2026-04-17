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
        // En un proyecto real aquí deberíamos hashear la contraseña antes de guardar
        const nuevoUsuario = await Usuario.create(req.body);
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

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    obtenerUsuarioPorId,
    eliminarUsuario
};