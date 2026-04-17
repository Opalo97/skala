const Inspiracion = require('../models/Inspiracion');
const Coleccion = require('../models/Coleccion');
const Comentario = require('../models/Comentario');
const Usuario = require('../models/Usuarios'); // <-- Añade esto para limpiar favoritos

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
        // req.body contiene los datos que el usuario mandó desde el frontend
        const nuevaInspiracion = await Inspiracion.create(req.body);
        res.status(201).json(nuevaInspiracion);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear la inspiración', error });
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

// Exportamos las funciones para que las rutas las puedan usar
module.exports = {
    obtenerInspiraciones,
    crearInspiracion,
    eliminarInspiracion
};