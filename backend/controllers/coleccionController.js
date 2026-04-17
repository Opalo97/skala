const Coleccion = require('../models/Coleccion');

// Obtener todas las colecciones de un usuario concreto
const obtenerColeccionesPorUsuario = async (req, res) => {
    try {
        const colecciones = await Coleccion.find({ creadaPor: req.params.usuarioId })
            .populate('inspiraciones'); // Trae la info completa de las inspiraciones guardadas
        res.status(200).json(colecciones);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las colecciones', error });
    }
};

// Crear una nueva colección vacía o con datos iniciales
const crearColeccion = async (req, res) => {
    try {
        const nuevaColeccion = await Coleccion.create(req.body);
        res.status(201).json(nuevaColeccion);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear la colección', error });
    }
};

// Actualizar una colección (ej: añadir una nueva inspiración a la colección "Oficina")
const actualizarColeccion = async (req, res) => {
    try {
        const coleccionActualizada = await Coleccion.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Esto hace que nos devuelva el dato ya actualizado
        );
        res.status(200).json(coleccionActualizada);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar la colección', error });
    }
};

// Eliminar una colección
const eliminarColeccion = async (req, res) => {
    try {
        await Coleccion.findByIdAndDelete(req.params.id);
        res.status(200).json({ mensaje: 'Colección eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar la colección', error });
    }
};

module.exports = {
    obtenerColeccionesPorUsuario,
    crearColeccion,
    actualizarColeccion,
    eliminarColeccion
};