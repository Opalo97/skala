const Comentario = require('../models/Comentario');

// Acción: Obtener los comentarios de una inspiración concreta
const obtenerComentariosPorInspiracion = async (req, res) => {
    try {
        // Buscamos los comentarios que coincidan con la ID de la inspiración
        const comentarios = await Comentario.find({ inspiracion: req.params.inspiracionId })
            .populate('usuario', 'username fotoPerfil'); // Traemos datos del autor para mostrar su perfil
            
        res.status(200).json(comentarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los comentarios', error });
    }
};

// Acción: Crear un nuevo comentario
const crearComentario = async (req, res) => {
    try {
        const nuevoComentario = await Comentario.create(req.body);
        res.status(201).json(nuevoComentario);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el comentario', error });
    }
};

// Acción: Eliminar un comentario (por si el usuario quiere borrar el suyo)
const eliminarComentario = async (req, res) => {
    try {
        const comentarioEliminado = await Comentario.findByIdAndDelete(req.params.id);
        if (!comentarioEliminado) {
            return res.status(404).json({ mensaje: 'Comentario no encontrado' });
        }
        res.status(200).json({ mensaje: 'Comentario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el comentario', error });
    }
};

module.exports = {
    obtenerComentariosPorInspiracion,
    crearComentario,
    eliminarComentario
};